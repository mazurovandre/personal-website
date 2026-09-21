import { Module } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { ContactController } from './contact/contact.controller.js';
import { ContactService, MAIL_TRANSPORT } from './contact/contact.service.js';
import { RateLimitGuard } from './contact/rate-limit.guard.js';
import { HealthController } from './health.controller.js';

@Module({
  controllers: [ContactController, HealthController],
  providers: [
    ContactService,
    RateLimitGuard,
    {
      provide: MAIL_TRANSPORT,
      useFactory: () => nodemailer.createTransport({
        host: requiredEnvironment('SMTP_HOST'),
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: requiredEnvironment('SMTP_PASSWORD') }
          : undefined
      })
    }
  ]
})
export class AppModule {}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}
