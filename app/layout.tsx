import type { Metadata, Viewport } from 'next';
import { getSiteUrl, readPortfolioContent } from '../lib/content';
import './styles.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await readPortfolioContent();
  const siteUrl = getSiteUrl();

  return {
    metadataBase: siteUrl,
    title: site.seo.title,
    description: site.seo.description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'profile',
      url: '/',
      siteName: `${site.home.firstName} ${site.home.lastName}`,
      title: site.seo.title,
      description: site.seo.description
    },
    twitter: {
      card: 'summary',
      title: site.seo.title,
      description: site.seo.description
    }
  };
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f8f9f6',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
