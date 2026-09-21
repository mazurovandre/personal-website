import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Transporter } from 'nodemailer';
import { ContactService } from '../src/contact/contact.service';

describe('ContactService', () => {
  const sendMail = vi.fn();
  const service = new ContactService({ sendMail } as unknown as Transporter);

  beforeEach(() => {
    process.env.CONTACT_RECIPIENT = 'owner@example.com';
    process.env.SMTP_FROM = 'website@example.com';
    sendMail.mockReset().mockResolvedValue({});
  });

  afterEach(() => {
    delete process.env.CONTACT_RECIPIENT;
    delete process.env.SMTP_FROM;
  });

  it('sends a text-only email with reply-to', async () => {
    await service.send({
      name: 'Ada',
      email: 'ada@example.com',
      company: 'Analytical Engines',
      subject: 'A role',
      message: 'Hello there',
      website: ''
    }, '127.0.0.1');

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'owner@example.com',
      replyTo: 'ada@example.com',
      subject: '[Website] A role'
    }));
  });

  it('silently accepts honeypot submissions', async () => {
    await service.send({
      name: 'Bot',
      email: 'bot@example.com',
      company: '',
      subject: 'Spam',
      message: 'Spam',
      website: 'https://spam.example'
    }, '127.0.0.1');

    expect(sendMail).not.toHaveBeenCalled();
  });
});
