import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { ContactRequest } from '@portfolio/contracts';
import type { Transporter } from 'nodemailer';

export const MAIL_TRANSPORT = Symbol('MAIL_TRANSPORT');

@Injectable()
export class ContactService {
  constructor(@Inject(MAIL_TRANSPORT) private readonly transport: Transporter) {}

  async send(request: ContactRequest, sourceIp: string): Promise<void> {
    if (request.website) return;

    const recipient = requiredEnvironment('CONTACT_RECIPIENT');
    const from = requiredEnvironment('SMTP_FROM');
    const text = [
      `Name: ${request.name}`,
      `Email: ${request.email}`,
      request.company ? `Company: ${request.company}` : undefined,
      `Source IP: ${sourceIp}`,
      '',
      request.message
    ].filter((line): line is string => line !== undefined).join('\n');

    try {
      await this.transport.sendMail({
        from,
        to: recipient,
        replyTo: request.email,
        subject: `[Website] ${request.subject}`,
        text
      });
    } catch {
      throw new ServiceUnavailableException('The message could not be sent. Please try again later.');
    }
  }
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

