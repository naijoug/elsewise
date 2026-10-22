import { afterEach, expect, it } from 'vitest';
import Prism from 'prismjs';
import { CodeComparison } from './CodeComparison';
import {
  cleanupRenderedComponents,
  renderComponent,
} from '../test/renderComponent';

afterEach(cleanupRenderedComponents);

it('renders code as text when a grammar is unavailable', () => {
  const grammar = Prism.languages.swift;
  delete Prism.languages.swift;
  try {
    const code = '<img src=x onerror="alert(1)"> & <T>';
    const { container } = renderComponent(
      <CodeComparison
        implementations={[
          { languageId: 'swift', code, explanation: 'literal source' },
        ]}
        selectedLanguages={['swift']}
        availableLanguages={[]}
      />
    );
    expect(container.querySelector('code')?.textContent).toBe(code);
    expect(container.querySelector('img')).toBeNull();
  } finally {
    if (grammar) Prism.languages.swift = grammar;
  }
});
