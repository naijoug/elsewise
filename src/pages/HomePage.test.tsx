import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';
import { createTestIdiom } from '../test/fixtures';
import type { Idiom } from '../types';
import {
  cleanupRenderedComponents,
  renderComponent,
} from '../test/renderComponent';

const mockContext = vi.hoisted(() => ({
  useAppContext: vi.fn(),
}));

vi.mock('../contexts', () => ({
  useAppContext: mockContext.useAppContext,
}));

vi.mock('../components/IdiomList', () => ({
  IdiomList: ({ idioms }: { idioms: Idiom[] }) => (
    <section aria-label="mock idiom list" data-testid="idiom-list">
      {idioms.map((idiom) => (
        <article key={idiom.id} data-idiom-id={idiom.id}>
          {idiom.title}
        </article>
      ))}
    </section>
  ),
}));

afterEach(() => {
  cleanupRenderedComponents();
  mockContext.useAppContext.mockReset();
});

const idioms: Idiom[] = [
  createTestIdiom(),
  createTestIdiom({
    id: 'guard-clause',
    title: 'Guard clause',
    description: 'Return early for invalid states.',
    category: 'Control Flow',
    difficulty: 'intermediate',
    paradigms: ['Imperative'],
    implementations: [
      {
        languageId: 'go',
        code: 'if err != nil { return err }',
        explanation: 'Returns on error.',
      },
    ],
    tags: ['control-flow'],
  }),
];

function mockHomePageContext({
  loading = false,
  error,
  idiomList = idioms,
}: {
  loading?: boolean;
  error?: Error;
  idiomList?: Idiom[];
}) {
  mockContext.useAppContext.mockReturnValue({
    idioms: idiomList,
    loading,
    error,
  });
}

describe('HomePage', () => {
  it('shows an accessible loading state while data is loading', () => {
    mockHomePageContext({ loading: true });

    const { container } = renderComponent(<HomePage />);
    const status = container.querySelector('[role="status"]');

    expect(status?.getAttribute('aria-live')).toBe('polite');
    expect(status?.textContent).toContain('加载中...');
    expect(container.querySelector('.animate-spin')).toBeInstanceOf(
      HTMLElement
    );
    expect(container.querySelector('[data-testid="idiom-list"]')).toBeNull();
  });

  it('shows an accessible error state with the error message and reload action', () => {
    mockHomePageContext({ error: new Error('Network unavailable') });

    const { container } = renderComponent(<HomePage />);
    const alert = container.querySelector('[role="alert"]');
    const reloadButton = container.querySelector(
      'button[aria-label="重新加载页面"]'
    );

    expect(alert?.getAttribute('aria-live')).toBe('assertive');
    expect(alert?.textContent).toContain('加载失败');
    expect(alert?.textContent).toContain('Network unavailable');
    expect(reloadButton?.textContent).toContain('重新加载');
    expect(container.querySelector('[data-testid="idiom-list"]')).toBeNull();
  });

  it('renders the page title and forwards idioms to the shared list', () => {
    mockHomePageContext({});

    const { container } = renderComponent(<HomePage />);
    const list = container.querySelector('[data-testid="idiom-list"]');
    const renderedCards = Array.from(
      container.querySelectorAll('[data-idiom-id]')
    );

    expect(container.querySelector('h1')?.textContent).toBe('编程习语');
    expect(container.textContent).toContain('不同语言，同一种巧思。');
    expect(list?.getAttribute('aria-label')).toBe('mock idiom list');
    expect(
      renderedCards.map((card) => card.getAttribute('data-idiom-id'))
    ).toEqual(['map-transform', 'guard-clause']);
  });
});
