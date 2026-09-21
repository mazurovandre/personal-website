import type { MetadataRoute } from 'next';
import { getSiteUrl } from '../lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return [{
    url: new URL('/', siteUrl).toString(),
    changeFrequency: 'monthly',
    priority: 1
  }];
}
