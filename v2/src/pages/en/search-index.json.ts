import { content } from '../../lib/localized-content';
export function GET() {
  const { idioms, languages } = content('en');
  const lower = (s: string[]) => s.map((v) => v.toLocaleLowerCase());
  return new Response(
    JSON.stringify(
      idioms.map((i) => ({
        id: i.id,
        fields: {
          title: lower([i.title]),
          description: lower([i.description]),
          category: lower([i.category]),
          tags: lower(i.tags),
          languages: lower(
            i.implementations.flatMap((e) => [
              e.languageId,
              languages.find((l) => l.id === e.languageId)!.name,
            ])
          ),
          code: lower(i.implementations.map((e) => e.code)),
          explanation: lower(i.implementations.map((e) => e.explanation)),
        },
      }))
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
}
