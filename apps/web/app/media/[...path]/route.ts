import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getMediaPath } from '../../../lib/content';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const contentTypes: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  try {
    const filePath = getMediaPath(segments);
    const contentType = contentTypes[path.extname(filePath).toLowerCase()];
    if (!contentType) return new Response('Not found', { status: 404 });
    const file = await readFile(filePath);
    return new Response(file, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=300',
        'x-content-type-options': 'nosniff'
      }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
