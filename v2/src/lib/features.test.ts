import { describe, expect, it } from 'vitest';
import { features, featureSummaries, validateFeatures } from './feature-content';
import { featureKey, filterFeatures } from './features';
import { languages } from './content';
describe('reviewed feature catalog', () => {
  it('covers every registered language with preserved concepts and four practical tasks', () => {
    expect(features).toHaveLength(20);
    expect(features.reduce((n, feature) => n + feature.entries.length, 0)).toBe(108);
    for (const language of languages) expect(features.flatMap(f => f.entries).filter(e => e.languageId === language.id)).toHaveLength(9);
    expect(() => validateFeatures(features)).not.toThrow();
  });
  it('keeps code and evidence out of client summaries and isolates learned ids', () => {
    expect(JSON.stringify(featureSummaries)).not.toMatch(/"(?:code|sources|entries)":/);
    expect(featureKey('closures')).toBe('feature:closures');
  });
  it('combines search, scope and language without claiming unsupported', () => {
    expect(filterFeatures(featureSummaries, '所有权', 'specific', 'rust').map(f => f.id)).toEqual(['rust-ownership']);
    expect(filterFeatures(featureSummaries, '所有权', '', 'java')).toEqual([]);
    expect(filterFeatures(featureSummaries, '', 'common', '')).toHaveLength(6);
  });
  it('requires complete reviewed coverage for a common label', () => {
    const copy = structuredClone(features); copy.find(f => f.scope === 'common')!.entries.pop();
    expect(() => validateFeatures(copy)).toThrow(/every catalog language/);
  });
  it('rejects dangling relationships and missing evidence', () => {
    const copy = structuredClone(features); copy[0].related.push('missing');
    expect(() => validateFeatures(copy)).toThrow(/related feature/);
    const noEvidence = structuredClone(features); noEvidence[0].entries[0].sources = [];
    expect(() => validateFeatures(noEvidence)).toThrow(/evidence/);
  });
  it('does not conflate lack of subclassing with lack of polymorphism', () => {
    for (const id of ['go', 'rust']) {
      expect(features.find(f => f.id === 'inheritance')!.entries.find(e => e.languageId === id)!.status).toBe('not-applicable');
      expect(features.find(f => f.id === 'polymorphism')!.entries.find(e => e.languageId === id)!.status).toBe('native');
    }
  });
});
