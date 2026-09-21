import { z } from 'zod';

const requiredText = z.string().trim().min(1);
const safeUrl = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === 'https:' || protocol === 'http:';
}, 'Only HTTP(S) links are allowed');

export const siteContentSchema = z.object({
  home: z.object({
    firstName: requiredText.max(80),
    lastName: requiredText.max(80),
    role: requiredText.max(160),
    contactsLabel: requiredText.max(40),
    aboutLabel: requiredText.max(40),
    cvLabel: requiredText.max(40)
  }),
  about: z.object({
    title: requiredText.max(80),
    toolkitLabel: requiredText.max(80),
    technologies: z.array(requiredText.max(80)).min(1).max(30),
    stackNote: z.string().trim().max(500).default('')
  }),
  contacts: z.object({
    title: requiredText.max(80),
    email: z.string().trim().email().max(254),
    links: z.array(z.object({
      label: requiredText.max(80),
      url: safeUrl
    })).max(12),
    form: z.object({
      title: requiredText.max(120),
      nameLabel: requiredText.max(80),
      emailLabel: requiredText.max(80),
      companyLabel: requiredText.max(80),
      subjectLabel: requiredText.max(80),
      messageLabel: requiredText.max(80),
      submitLabel: requiredText.max(80),
      successMessage: requiredText.max(300),
      privacyLabel: requiredText.max(120)
    })
  }),
  cv: z.object({
    title: requiredText.max(80),
    fileName: z.literal('cv.pdf'),
    downloadName: z.string().trim().regex(/^[^/\\]+\.pdf$/i),
    downloadLabel: requiredText.max(80),
    openLabel: requiredText.max(80),
    fallback: requiredText.max(240)
  }),
  seo: z.object({
    title: requiredText.max(70),
    description: requiredText.max(170)
  })
});

export type SiteContent = z.infer<typeof siteContentSchema>;

export const contactRequestSchema = z.object({
  name: requiredText.max(100),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(150).optional().default(''),
  subject: requiredText.max(150),
  message: requiredText.max(5000),
  website: z.string().max(200).optional().default('')
}).strict();

export type ContactRequest = z.infer<typeof contactRequestSchema>;
