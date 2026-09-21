import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { siteContentSchema, type SiteContent } from './schema';

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
  const configured = process.env.CONTENT_DIR;
  if (configured) return path.resolve(/* turbopackIgnore: true */ configured);
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), 'content');
}

async function signatureFor(files: string[]): Promise<string> {
  const stats = await Promise.all(files.map((file) => stat(file)));
  return stats.map(({ mtimeMs, size }) => `${mtimeMs}:${size}`).join('|');
}

export async function readPortfolioContent(): Promise<PortfolioContent> {
  const contentDirectory = getContentDirectory();
  const sitePath = path.join(contentDirectory, 'site.json');
  const aboutPath = path.join(contentDirectory, 'about.md');
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;

  try {
    const signature = await signatureFor([sitePath, aboutPath]);
    if (cache?.signature === signature) {
      cache.expiresAt = now + 60_000;
      return cache.value;
    }

    const [siteSource, aboutMarkdown] = await Promise.all([
      readFile(sitePath, 'utf8'),
      readFile(aboutPath, 'utf8')
    ]);
    const value = {
      site: siteContentSchema.parse(JSON.parse(siteSource) as unknown),
      aboutMarkdown
    } satisfies PortfolioContent;

    cache = { expiresAt: now + 60_000, signature, value };
    return value;
  } catch (error) {
    if (cache) {
      console.error('Content reload failed; continuing with the last valid version.');
      cache.expiresAt = now + 60_000;
      return cache.value;
    }
    throw error;
  }
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
