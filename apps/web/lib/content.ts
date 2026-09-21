import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { siteContentSchema, type SiteContent } from '@portfolio/contracts';

export type PortfolioContent = {
  site: SiteContent;
  aboutMarkdown: string;
};

type CacheEntry = {
  expiresAt: number;
  signature: string;
  value: PortfolioContent;
};

let cache: CacheEntry | undefined;

export function getContentDirectory(): string {
  return path.resolve(
    process.env.CONTENT_DIR ?? path.join(process.cwd(), '..', '..', 'content')
  );
}

async function signatureFor(files: string[]): Promise<string> {
  const stats = await Promise.all(files.map((file) => stat(file)));
  return stats.map(({ mtimeMs, size }) => `${mtimeMs}:${size}`).join('|');
}

export async function readPortfolioContent(): Promise<PortfolioContent> {
  const contentDirectory = getContentDirectory();
  const sitePath = path.join(contentDirectory, 'site.json');
  const aboutPath = path.join(contentDirectory, 'about.md');
  const signature = await signatureFor([sitePath, aboutPath]);
  const now = Date.now();

  if (cache && cache.expiresAt > now && cache.signature === signature) {
    return cache.value;
  }

  const [siteSource, aboutMarkdown] = await Promise.all([
    readFile(sitePath, 'utf8'),
    readFile(aboutPath, 'utf8')
  ]);

  let source: unknown;
  try {
    source = JSON.parse(siteSource);
  } catch {
    throw new Error(`Invalid JSON in ${sitePath}`);
  }

  const value = {
    site: siteContentSchema.parse(source),
    aboutMarkdown
  } satisfies PortfolioContent;

  cache = { expiresAt: now + 60_000, signature, value };
  return value;
}

export async function readPrivacyMarkdown(): Promise<string> {
  return readFile(path.join(getContentDirectory(), 'privacy.md'), 'utf8');
}

export function getSiteUrl(): URL {
  const raw = process.env.SITE_URL ?? 'http://localhost:3000';
  try {
    return new URL(raw);
  } catch {
    throw new Error('SITE_URL must be an absolute HTTP(S) URL');
  }
}

export function getCvPath(fileName: string): string {
  return path.join(getContentDirectory(), 'cv', path.basename(fileName));
}

export function getMediaPath(segments: string[]): string {
  const mediaRoot = path.join(getContentDirectory(), 'media');
  const resolved = path.resolve(mediaRoot, ...segments);
  if (resolved !== mediaRoot && !resolved.startsWith(`${mediaRoot}${path.sep}`)) {
    throw new Error('Invalid media path');
  }
  return resolved;
}

