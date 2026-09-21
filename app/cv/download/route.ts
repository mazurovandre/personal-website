import { readFile } from 'node:fs/promises';
import { getCvPath, readPortfolioContent } from '../../../lib/content';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const { site } = await readPortfolioContent();
  const pdf = await readFile(getCvPath(site.cv.fileName));
  const downloadName = site.cv.downloadName.replaceAll('"', '');
  return new Response(pdf, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${downloadName}"`,
      'cache-control': 'private, max-age=300',
      'x-content-type-options': 'nosniff'
    }
  });
}

