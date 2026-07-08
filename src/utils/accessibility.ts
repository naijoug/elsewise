/**
 * 无障碍访问工具函数
 *
 * 提供一组工具函数来增强应用的无障碍访问性：
 * - 屏幕阅读器公告
 * - 焦点管理
 * - ARIA 属性生成
 *
 * 这些工具帮助确保应用符合 WCAG 2.1 AA 标准
 *
 * @example
 * ```typescript
 * // 向屏幕阅读器宣布消息
 * announceToScreenReader('搜索完成，找到 5 个结果');
 *
 * // 在模态框中捕获焦点
 * const cleanup = trapFocus(modalElement);
 * // 关闭模态框时调用 cleanup()
 * ```
 */

/**
 * 向屏幕阅读器宣布消息
 *
 * 创建一个临时的 aria-live 区域来宣布消息，然后自动移除
 *
 * @param message 要宣布的消息文本
 * @param priority 优先级：'polite'（礼貌）或 'assertive'（强制）
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * 在容器内捕获焦点
 *
 * 用于模态框和下拉菜单，确保 Tab 键只在容器内的可聚焦元素间循环
 *
 * @param container 要捕获焦点的容器元素
 * @returns 清理函数，用于移除事件监听器
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * 生成唯一的 ID
 *
 * 用于 ARIA 属性（如 aria-labelledby, aria-describedby）
 *
 * @param prefix ID 前缀，默认为 'a11y'
 * @returns 唯一的 ID 字符串
 */
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * 检查元素是否对屏幕阅读器可见
 *
 * @param element 要检查的 HTML 元素
 * @returns 如果元素对屏幕阅读器可见则返回 true
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  return (
    element.getAttribute('aria-hidden') !== 'true' &&
    !element.hasAttribute('hidden') &&
    element.style.display !== 'none' &&
    element.style.visibility !== 'hidden'
  );
}

/**
 * 获取元素的无障碍名称
 *
 * 按优先级检查 aria-label、aria-labelledby 和 textContent
 *
 * @param element 要获取名称的 HTML 元素
 * @returns 元素的无障碍名称
 */
export function getAccessibleName(element: HTMLElement): string {
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) {
    return ariaLabel;
  }

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const referencedName = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');

    if (referencedName) {
      return referencedName;
    }
  }

  return (element.textContent || '').trim();
}
