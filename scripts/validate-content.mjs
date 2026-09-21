#!/usr/bin/env node

import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'content');
const requiredFiles = ['site.json', 'about.md', 'privacy.md', 'cv/cv.pdf'];

function fail(message) {
  process.stderr.write(`Content validation failed: ${message}\n`);
  process.exitCode = 1;
}

function text(value, location, max = 5_000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new Error(`${location} must be non-empty text up to ${max} characters`);
  }
}

try {
  await Promise.all(requiredFiles.map(async (relativePath) => {
    const details = await stat(path.join(root, relativePath));
    if (!details.isFile() || details.size === 0) throw new Error(`${relativePath} is missing or empty`);
  }));

  const site = JSON.parse(await readFile(path.join(root, 'site.json'), 'utf8'));
  text(site?.home?.firstName, 'home.firstName', 80);
  text(site?.home?.lastName, 'home.lastName', 80);
  text(site?.home?.role, 'home.role', 160);
  for (const key of ['contactsLabel', 'aboutLabel', 'cvLabel']) text(site?.home?.[key], `home.${key}`, 40);
  text(site?.about?.title, 'about.title', 80);
  text(site?.about?.toolkitLabel, 'about.toolkitLabel', 80);
  if (!Array.isArray(site?.about?.technologies) || site.about.technologies.length < 1 || site.about.technologies.length > 30) {
    throw new Error('about.technologies must contain 1–30 entries');
  }
  site.about.technologies.forEach((value, index) => text(value, `about.technologies[${index}]`, 80));
  text(site?.contacts?.title, 'contacts.title', 80);
  text(site?.contacts?.email, 'contacts.email', 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contacts.email)) throw new Error('contacts.email is invalid');
  if (!Array.isArray(site?.contacts?.links) || site.contacts.links.length > 12) throw new Error('contacts.links must be an array');
  for (const [index, link] of site.contacts.links.entries()) {
    text(link?.label, `contacts.links[${index}].label`, 80);
    const url = new URL(link?.url);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`contacts.links[${index}].url must use HTTP(S)`);
  }
  for (const key of ['title', 'nameLabel', 'emailLabel', 'companyLabel', 'subjectLabel', 'messageLabel', 'submitLabel', 'successMessage', 'privacyLabel']) {
    text(site?.contacts?.form?.[key], `contacts.form.${key}`, 300);
  }
  text(site?.cv?.title, 'cv.title', 80);
  if (site?.cv?.fileName !== 'cv.pdf') throw new Error('cv.fileName must be cv.pdf');
  text(site?.cv?.downloadName, 'cv.downloadName', 180);
  text(site?.cv?.downloadLabel, 'cv.downloadLabel', 80);
  text(site?.cv?.openLabel, 'cv.openLabel', 80);
  text(site?.cv?.fallback, 'cv.fallback', 240);
  text(site?.seo?.title, 'seo.title', 70);
  text(site?.seo?.description, 'seo.description', 170);

  const [about, privacy, pdf] = await Promise.all([
    readFile(path.join(root, 'about.md'), 'utf8'),
    readFile(path.join(root, 'privacy.md'), 'utf8'),
    readFile(path.join(root, 'cv/cv.pdf'))
  ]);
  text(about, 'about.md', 50_000);
  text(privacy, 'privacy.md', 50_000);
  if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('cv/cv.pdf is not a PDF file');

  process.stdout.write(`Content is valid: ${root}\n`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

