import { z } from 'zod';

const requiredText = z.string().trim().min(1);
const publicUrl = z.string().url().refine((value) => {
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
      url: publicUrl
    })).max(12)
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
