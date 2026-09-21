import { Portfolio } from '../components/portfolio';
import { getSiteUrl, readPortfolioContent } from '../lib/content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const content = await readPortfolioContent();
  const { site } = content;
  const sameAs = site.contacts.links.map(({ url }) => url);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${site.home.firstName} ${site.home.lastName}`,
    jobTitle: site.home.role,
    url: getSiteUrl().toString(),
    sameAs
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replaceAll('<', '\\u003c')
        }}
      />
      <Portfolio content={content} />
    </>
  );
}

