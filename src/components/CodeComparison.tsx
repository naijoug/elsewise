/**
 * 代码对比组件
 *
 * 并排展示多种编程语言的代码实现，支持：
 * - 动态多列布局（1-3 列）
 * - 语法高亮（使用 Prism.js）
 * - 响应式设计（桌面端并排，移动端堆叠）
 * - 代码说明、输出、设计理念展示
 * - 优缺点对比
 * - 参考文档链接
 *
 * 性能优化：
 * - 使用 React.memo 避免不必要的重渲染
 * - 使用 useMemo 缓存过滤和高亮结果
 *
 * @example
 * ```tsx
 * <CodeComparison
 *   implementations={idiom.implementations}
 *   selectedLanguages={['javascript', 'python']}
 *   availableLanguages={languages}
 * />
 * ```
 */

import { useMemo, memo } from 'react';
import Prism from 'prismjs';
import type { Implementation, Language } from '../types';
import { Card } from './common';

export interface CodeComparisonProps {
  implementations: Implementation[];
  selectedLanguages: string[];
  availableLanguages: Language[];
}

export const CodeComparison = memo(function CodeComparison({
  implementations,
  selectedLanguages,
  availableLanguages,
}: CodeComparisonProps) {
  // Filter implementations based on selected languages (memoized)
  const filteredImplementations = useMemo(
    () =>
      implementations.filter((impl) =>
        selectedLanguages.includes(impl.languageId)
      ),
    [implementations, selectedLanguages]
  );

  // Get language name from ID (memoized)
  const getLanguageName = useMemo(
    () =>
      (languageId: string): string => {
        const language = availableLanguages.find(
          (lang) => lang.id === languageId
        );
        return language?.name || languageId;
      },
    [availableLanguages]
  );

  // Map language IDs to Prism language keys
  const getPrismLanguage = (languageId: string): string => {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      go: 'go',
      rust: 'rust',
      java: 'java',
      csharp: 'csharp',
      ruby: 'ruby',
      php: 'php',
      swift: 'swift',
      kotlin: 'kotlin',
      cpp: 'cpp',
    };
    return languageMap[languageId] || 'javascript';
  };

  // Highlight code when implementations or selected languages change (memoized)
  const highlightedCode = useMemo(() => {
    const newHighlightedCode = new Map<string, string>();

    filteredImplementations.forEach((impl) => {
      const prismLang = getPrismLanguage(impl.languageId);
      const grammar = Prism.languages[prismLang];

      if (grammar) {
        const highlighted = Prism.highlight(impl.code, grammar, prismLang);
        newHighlightedCode.set(impl.languageId, highlighted);
      }
    });

    return newHighlightedCode;
  }, [filteredImplementations]);

  if (filteredImplementations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500" role="status">
        <p className="text-lg">请选择至少一种编程语言来查看代码实现</p>
      </div>
    );
  }

  return (
    <div
      className={`
        grid gap-6
        ${filteredImplementations.length === 1 ? 'grid-cols-1' : ''}
        ${filteredImplementations.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : ''}
        ${filteredImplementations.length >= 3 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : ''}
      `}
      role="region"
      aria-label="代码对比视图"
    >
      {filteredImplementations.map((impl) => (
        <Card
          key={impl.languageId}
          className="flex flex-col"
          role="article"
          aria-label={`${getLanguageName(impl.languageId)} 实现`}
        >
          {/* Language Header */}
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {getLanguageName(impl.languageId)}
            </h3>
          </div>

          {/* Code Block */}
          <div className="mb-4 overflow-x-auto -mx-2 sm:mx-0">
            <pre
              className="!m-0 !p-4 !bg-gray-900 rounded-lg text-sm sm:text-base overflow-x-auto touch-pan-x"
              role="region"
              aria-label={`${getLanguageName(impl.languageId)} 代码示例`}
              tabIndex={0}
            >
              <code
                className={`language-${getPrismLanguage(impl.languageId)}`}
                style={{ fontSize: 'inherit' }}
                dangerouslySetInnerHTML={
                  highlightedCode.has(impl.languageId)
                    ? { __html: highlightedCode.get(impl.languageId)! }
                    : undefined
                }
              >
                {highlightedCode.has(impl.languageId) ? undefined : impl.code}
              </code>
            </pre>
          </div>

          {/* Explanation */}
          {impl.explanation && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">说明</h4>
              <p className="text-sm text-gray-600">{impl.explanation}</p>
            </div>
          )}

          {/* Output Section */}
          {(impl.output || impl.errorOutput) && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                输出结果
              </h4>
              <div className="space-y-2">
                {/* Standard Output */}
                {impl.output && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        标准输出
                      </span>
                    </div>
                    <pre className="bg-gray-50 border border-gray-200 p-3 rounded text-sm text-gray-800 overflow-x-auto font-mono whitespace-pre-wrap break-words touch-pan-x">
                      {impl.output}
                    </pre>
                  </div>
                )}

                {/* Error Output */}
                {impl.errorOutput && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded">
                        错误输出
                      </span>
                    </div>
                    <pre className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800 overflow-x-auto font-mono whitespace-pre-wrap break-words touch-pan-x">
                      {impl.errorOutput}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Design Rationale */}
          {impl.designRationale && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                设计理念
              </h4>
              <p className="text-sm text-gray-600">{impl.designRationale}</p>
            </div>
          )}

          {/* Pros and Cons */}
          {(impl.pros || impl.cons) && (
            <div className="mb-4 space-y-3">
              {impl.pros && impl.pros.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-700 mb-2">
                    优点
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {impl.pros.map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              {impl.cons && impl.cons.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-700 mb-2">
                    缺点
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {impl.cons.map((con, index) => (
                      <li key={index}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* References */}
          {impl.references && impl.references.length > 0 && (
            <div className="mt-auto pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                参考资料
              </h4>
              <ul className="space-y-1">
                {impl.references.map((ref, index) => (
                  <li key={index}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {ref.title} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
});
