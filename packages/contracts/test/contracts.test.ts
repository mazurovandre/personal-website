import { describe, expect, it } from 'vitest';
import { contactRequestSchema, siteContentSchema } from '../src/index';

describe('contactRequestSchema', () => {
  it('accepts a valid contact request', () => {
    expect(contactRequestSchema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      company: '',
      subject: 'Hello',
      message: 'A useful message',
      website: ''
    }).success).toBe(true);
  });

  it('rejects bot honeypot content and oversized messages', () => {
    expect(contactRequestSchema.safeParse({
      name: 'Bot',
      email: 'bot@example.com',
      subject: 'Spam',
      message: 'x'.repeat(5001),
      website: 'https://spam.example'
    }).success).toBe(false);
  });
});

describe('siteContentSchema', () => {
  it('requires an HTTPS or HTTP social link', () => {
    const result = siteContentSchema.shape.contacts.shape.links.element.safeParse({
      label: 'Profile',
      url: 'javascript:alert(1)'
    });
    expect(result.success).toBe(false);
  });
});
