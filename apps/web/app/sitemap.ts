import type { MetadataRoute } from 'next';
import { getSiteUrl } from '../lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return ['/', '/privacy'].map((pathname) => ({
    url: new URL(pathname, siteUrl).toString(),
    changeFrequency: 'monthly' as const,
    priority: pathname === '/' ? 1 : 0.2
  }));
}

