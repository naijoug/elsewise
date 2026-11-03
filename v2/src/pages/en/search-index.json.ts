import { content } from '../../lib/localized-content';
import { buildSearchIndex } from '../../lib/content';
export function GET() {
  const { idioms, languages } = content('en');
  return new Response(JSON.stringify(buildSearchIndex(idioms, languages)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
