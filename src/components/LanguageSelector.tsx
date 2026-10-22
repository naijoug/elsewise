import {
  useState,
  useRef,
  useEffect,
  memo,
  useMemo,
  useCallback,
  useId,
} from 'react';
import type { Language } from '../types';
import { Badge } from './common/Badge';
import { Button } from './common/Button';

export interface LanguageSelectorProps {
  availableLanguages: Language[];
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  maxSelection?: number;
  className?: string;
}

export const LanguageSelector = memo(function LanguageSelector({
  availableLanguages,
  selectedLanguages,
  onChange,
  maxSelection,
  className = '',
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // 关闭下拉菜单当点击外部时
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 切换语言选择 (memoized)
  const toggleLanguage = useCallback(
    (languageId: string) => {
      if (selectedLanguages.includes(languageId)) {
        // 移除语言
        onChange(selectedLanguages.filter((id) => id !== languageId));
      } else {
        // 添加语言（检查最大选择数）
        if (maxSelection && selectedLanguages.length >= maxSelection) {
          return;
        }
        onChange([...selectedLanguages, languageId]);
      }
    },
    [selectedLanguages, onChange, maxSelection]
  );

  // 清除所有选择 (memoized)
  const clearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  // 重置为默认选择（前两个语言）(memoized)
  const resetToDefault = useCallback(() => {
    const defaultLanguages = availableLanguages
      .slice(0, 2)
      .map((lang) => lang.id);
    onChange(defaultLanguages);
  }, [availableLanguages, onChange]);

  // 移除单个已选语言 (memoized)
  const removeLanguage = useCallback(
    (languageId: string) => {
      onChange(selectedLanguages.filter((id) => id !== languageId));
    },
    [selectedLanguages, onChange]
  );

  // 获取语言名称 (memoized)
  const getLanguageName = useMemo(
    () => (languageId: string) => {
      return (
        availableLanguages.find((lang) => lang.id === languageId)?.name ||
        languageId
      );
    },
    [availableLanguages]
  );

  return (
    <div
      className={`relative ${className}`}
      ref={dropdownRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.preventDefault();
          setIsOpen(false);
          dropdownRef.current
            ?.querySelector<HTMLButtonElement>('[aria-haspopup="listbox"]')
            ?.focus();
        }
      }}
    >
      {/* 选择器按钮 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? listboxId : undefined}
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              选择语言
              {selectedLanguages.length > 0 && (
                <Badge variant="primary" size="sm">
                  {selectedLanguages.length}
                </Badge>
              )}
            </span>
            <svg
              className={`w-4 h-4 ml-auto transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {/* 快捷操作按钮 */}
          {selectedLanguages.length > 0 && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                title="清除所有"
                aria-label="清除所有选择的语言"
                className="min-w-[44px]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefault}
                title="重置为默认"
                aria-label="重置为默认语言选择"
                className="min-w-[44px]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </Button>
            </div>
          )}
        </div>

        {/* 已选语言标签 */}
        {selectedLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedLanguages.map((langId) => (
              <Badge
                key={langId}
                variant="primary"
                size="md"
                className="flex items-center gap-1.5 pr-1"
              >
                {getLanguageName(langId)}
                <button
                  onClick={() => removeLanguage(langId)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-1 min-w-[24px] min-h-[24px] transition-colors active:bg-blue-300 flex items-center justify-center"
                  aria-label={`移除 ${getLanguageName(langId)}`}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          role="listbox"
          id={listboxId}
          aria-multiselectable="true"
          aria-label="可选择的编程语言"
        >
          <div className="p-2">
            {maxSelection && (
              <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100 mb-2">
                最多选择 {maxSelection} 种语言
                {selectedLanguages.length > 0 &&
                  ` (已选 ${selectedLanguages.length})`}
              </div>
            )}
            {availableLanguages.map((language) => {
              const isSelected = selectedLanguages.includes(language.id);
              const isDisabled =
                !isSelected &&
                maxSelection !== undefined &&
                selectedLanguages.length >= maxSelection;

              return (
                <button
                  key={language.id}
                  onClick={() => !isDisabled && toggleLanguage(language.id)}
                  disabled={isDisabled}
                  className={`w-full text-left px-4 py-3 min-h-[56px] rounded-md transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-50 text-gray-700 active:bg-gray-100'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* 复选框图标 */}
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-xs text-gray-500">
                          {language.paradigms.join(', ')} ·{' '}
                          {language.typeSystem}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
