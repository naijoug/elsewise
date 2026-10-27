import { searchIndex } from '../lib/content';
export function GET() {
  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
