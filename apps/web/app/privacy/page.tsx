import type { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { readPrivacyMarkdown } from '../../lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy policy',
  robots: { index: true, follow: true }
};

export default async function PrivacyPage() {
  const markdown = await readPrivacyMarkdown();
  return (
    <main className="legal-page">
      <Link className="text-link back-link" href="/">Back</Link>
      <article className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
    </main>
  );
}
