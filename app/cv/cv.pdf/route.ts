import { readFile } from 'node:fs/promises';
import { getCvPath, readPortfolioContent } from '../../../lib/content';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const { site } = await readPortfolioContent();
  const pdf = await readFile(getCvPath(site.cv.fileName));
  return new Response(pdf, {
    headers: {
      'content-type': 'application/pdf',
      'cache-control': 'public, max-age=300',
      'x-content-type-options': 'nosniff'
    }
  });
}

