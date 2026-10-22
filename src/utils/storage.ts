/**
 * Local Storage 管理工具
 *
 * 提供用户偏好设置的持久化存储功能：
 * - 收藏的习语列表
 * - 选中的编程语言
 * - 主题设置
 *
 * 特性：
 * - 自动处理 JSON 序列化/反序列化
 * - 优雅降级（如果 Local Storage 不可用）
 * - 提供默认值
 *
 * 存储键：elsewise_preferences；首次读取兼容 ByteBite 的旧偏好。
 *
 * @example
 * ```typescript
 * // 加载偏好
 * const prefs = loadPreferences();
 *
 * // 保存偏好
 * savePreferences({
 *   favoriteIdioms: ['array-map', 'string-split'],
 *   selectedLanguages: ['javascript', 'python'],
 *   theme: 'dark'
 * });
 * ```
 */

import type { UserPreferences } from '../types';

const STORAGE_KEY = 'elsewise_preferences';
const LEGACY_STORAGE_KEY = 'bytebite_preferences';

/**
 * 默认用户偏好设置
 *
 * 当 Local Storage 中没有保存的偏好或加载失败时使用
 */
const defaultPreferences = (): UserPreferences => ({
  favoriteIdioms: [],
  selectedLanguages: [],
  theme: 'light',
});

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (item): item is string =>
              typeof item === 'string' && item.length > 0
          )
        ),
      ]
    : [];
}

/**
 * 从 Local Storage 读取用户偏好
 *
 * @returns UserPreferences 用户偏好对象，如果加载失败则返回默认值
 */
export function loadPreferences(): UserPreferences {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    const stored = current ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) {
      return defaultPreferences();
    }
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return defaultPreferences();
    }
    const data = parsed as Record<string, unknown>;
    const preferences: UserPreferences = {
      favoriteIdioms: stringArray(data.favoriteIdioms),
      selectedLanguages: stringArray(data.selectedLanguages),
      theme: data.theme === 'dark' ? 'dark' : 'light',
    };
    // Keep the legacy value for rollback. A failed write must not hide favorites.
    if (current === null) savePreferences(preferences);
    return preferences;
  } catch (error) {
    console.warn('Failed to load preferences from localStorage:', error);
    return defaultPreferences();
  }
}

/**
 * 保存用户偏好到 Local Storage
 *
 * @param preferences 要保存的用户偏好对象
 */
export function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save preferences to localStorage:', error);
  }
}

/**
 * 清除所有用户偏好
 */
export function clearPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear preferences from localStorage:', error);
  }
}

/**
 * 添加收藏的习语
 */
export function addFavoriteIdiom(idiomId: string): void {
  const preferences = loadPreferences();
  if (!preferences.favoriteIdioms.includes(idiomId)) {
    preferences.favoriteIdioms.push(idiomId);
    savePreferences(preferences);
  }
}

/**
 * 移除收藏的习语
 */
export function removeFavoriteIdiom(idiomId: string): void {
  const preferences = loadPreferences();
  preferences.favoriteIdioms = preferences.favoriteIdioms.filter(
    (id) => id !== idiomId
  );
  savePreferences(preferences);
}

/**
 * 检查习语是否已收藏
 */
export function isFavoriteIdiom(idiomId: string): boolean {
  const preferences = loadPreferences();
  return preferences.favoriteIdioms.includes(idiomId);
}

/**
 * 更新选中的语言列表
 */
export function updateSelectedLanguages(languages: string[]): void {
  const preferences = loadPreferences();
  preferences.selectedLanguages = languages;
  savePreferences(preferences);
}

/**
 * 更新主题设置
 */
export function updateTheme(theme: 'light' | 'dark'): void {
  const preferences = loadPreferences();
  preferences.theme = theme;
  savePreferences(preferences);
}
