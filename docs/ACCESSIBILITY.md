# ByteBite 可访问性文档

本文档记录可访问性实现意图与验收方法。修改相关 UI 时按需查阅；它不构成当前版本的全站合规报告。

## 概述

ByteBite 以 WCAG 2.1 AA 为目标。下文功能描述与勾选记录需要结合当前组件复核；达标声明需附日期、提交、检查范围、工具和结果。验证范围见 [TESTING.md](TESTING.md)。

## 实现的可访问性功能

### 1. 键盘导航

所有交互元素都可以通过键盘访问：

- **Tab 键**: 在可聚焦元素之间导航
- **Enter/Space**: 激活按钮和链接
- **Escape**: 关闭下拉菜单和模态框
- **箭头键**: 在列表和菜单中导航

#### 焦点指示器

- 所有交互元素都有清晰的焦点指示器（蓝色轮廓）
- 焦点指示器在所有背景上都有足够的对比度
- 使用 `:focus-visible` 伪类，仅在键盘导航时显示焦点

### 2. ARIA 标签和角色

#### 语义化 HTML

- 使用适当的 HTML5 语义元素（`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`）
- 使用 `<button>` 而不是 `<div>` 来实现按钮功能
- 使用 `<fieldset>` 和 `<legend>` 来组织表单控件

#### ARIA 属性

- **aria-label**: 为图标按钮和没有可见文本的元素提供标签
- **aria-labelledby**: 将元素与其标签关联
- **aria-describedby**: 提供额外的描述信息
- **aria-expanded**: 指示可展开元素的状态
- **aria-current**: 标记当前活动的导航项
- **aria-live**: 动态内容更新的实时区域
- **aria-hidden**: 隐藏装饰性元素，使其对屏幕阅读器不可见

### 3. 跳转导航

- 在页面顶部提供"跳转到主内容"链接
- 该链接在键盘聚焦时可见
- 允许屏幕阅读器用户快速跳过导航

### 4. 颜色对比度

验收文本和交互元素时应检查以下对比度目标：

- **正常文本**: 至少 4.5:1 的对比度
- **大文本**: 至少 3:1 的对比度
- **交互元素**: 至少 3:1 的对比度

#### 颜色方案

- 主色（蓝色）: `#2563eb` - 对比度需按实际背景测量
- 文本颜色: `#111827` (gray-900) - 对比度需按实际背景测量
- 次要文本: `#4b5563` (gray-600) - 对比度需按实际背景测量

### 5. 触摸目标大小

移动端触摸目标的项目验收目标：

- **最小尺寸**: 44x44 像素（移动端）
- **推荐尺寸**: 48x48 像素（大按钮）
- 确保触摸目标之间有足够的间距

### 6. 屏幕阅读器支持

#### 屏幕阅读器专用文本

使用 `.sr-only` 类隐藏视觉内容，但保留给屏幕阅读器：

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

#### 实时区域

- 搜索结果计数使用 `aria-live="polite"`
- 错误消息使用 `aria-live="assertive"`
- 加载状态使用 `role="status"`

### 7. 表单可访问性

- 所有输入字段都有关联的 `<label>` 元素
- 使用 `<fieldset>` 和 `<legend>` 组织相关的表单控件
- 复选框和单选按钮有清晰的标签
- 错误消息与相应的输入字段关联

### 8. 图像和图标

- 所有装饰性图标都标记为 `aria-hidden="true"`
- 功能性图标有 `aria-label` 属性
- SVG 图标包含适当的标题和描述

### 9. 响应式设计

- 支持文本缩放至 200% 而不丢失功能
- 移动端布局优化，确保内容可读性
- 支持横屏和竖屏方向

### 10. 减少动画

支持 `prefers-reduced-motion` 媒体查询：

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 组件可访问性清单

### Header 组件

- ✅ 使用 `<nav>` 元素和 `aria-label`
- ✅ 移动菜单按钮有 `aria-expanded` 和 `aria-label`
- ✅ 当前页面使用 `aria-current="page"`
- ✅ 所有链接都有可见的焦点指示器

### SearchBar 组件

- ✅ 使用 `role="search"` 包装器
- ✅ 输入字段有关联的 `<label>`（使用 `.sr-only`）
- ✅ 清除按钮有 `aria-label`
- ✅ 搜索图标标记为 `aria-hidden="true"`

### FilterPanel 组件

- ✅ 使用 `<fieldset>` 和 `<legend>` 组织筛选选项
- ✅ 每个复选框都有清晰的标签
- ✅ 展开/收起按钮有 `aria-expanded` 和 `aria-controls`
- ✅ 筛选组使用 `role="group"`

### IdiomCard 组件

- ✅ 使用 `<article>` 元素包装
- ✅ 链接有描述性的 `aria-label`
- ✅ 收藏状态图标有屏幕阅读器文本
- ✅ 标签列表使用 `role="list"`

### IdiomList 组件

- ✅ 搜索结果计数使用 `aria-live="polite"`
- ✅ 习语列表使用 `role="list"` 和 `aria-label`
- ✅ 空状态有 `role="status"`
- ✅ 筛选按钮有 `aria-expanded` 和 `aria-controls`

### CodeComparison 组件

- ✅ 代码块使用 `role="region"` 和 `aria-label`
- ✅ 代码块可以通过键盘聚焦（`tabIndex={0}`）
- ✅ 每个实现使用 `role="article"`
- ✅ 空状态有 `role="status"`

### LanguageSelector 组件

- ✅ 下拉菜单使用 `role="listbox"`
- ✅ 选项使用 `role="option"` 和 `aria-selected`
- ✅ 按钮有 `aria-expanded` 和 `aria-haspopup`
- ✅ 移除按钮有描述性的 `aria-label`

### FavoriteButton 组件

- ✅ 按钮有描述性的 `aria-label`
- ✅ 图标标记为 `aria-hidden="true"`
- ✅ 状态变化对屏幕阅读器可见

### Footer 组件

- ✅ 使用 `role="contentinfo"`
- ✅ 导航区域有 `aria-label`
- ✅ 外部链接有屏幕阅读器提示
- ✅ 所有链接都有可见的焦点指示器

## 测试

### 键盘导航测试

1. 使用 Tab 键浏览整个页面
2. 确保所有交互元素都可以聚焦
3. 确保焦点顺序符合逻辑
4. 测试 Enter/Space 键激活按钮
5. 测试 Escape 键关闭下拉菜单

### 屏幕阅读器测试

推荐的屏幕阅读器：

- **macOS**: VoiceOver (Cmd + F5)
- **Windows**: NVDA (免费) 或 JAWS
- **iOS**: VoiceOver (设置 > 辅助功能)
- **Android**: TalkBack (设置 > 辅助功能)

测试清单：

1. 导航到每个页面
2. 确保所有内容都被正确朗读
3. 测试表单输入和错误消息
4. 测试动态内容更新
5. 测试模态框和下拉菜单

### 颜色对比度测试

使用工具：

- Chrome DevTools (Lighthouse)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### 自动化测试

使用以下工具进行自动化可访问性测试：

- **axe DevTools**: Chrome/Firefox 扩展
- **Lighthouse**: Chrome DevTools 内置
- **WAVE**: Web 可访问性评估工具

## 已知问题和改进计划

### 当前限制

1. 代码高亮可能对某些屏幕阅读器用户不友好
2. 复杂的代码示例可能需要额外的上下文

### 未来改进

1. 添加键盘快捷键指南
2. 实现高对比度模式
3. 添加字体大小调整选项
4. 改进代码块的屏幕阅读器体验
5. 添加更多的 ARIA 实时区域

## 反馈

如果您在使用 ByteBite 时遇到任何可访问性问题，请通过以下方式联系我们：

- GitHub Issues
- 电子邮件: accessibility@bytebite.com

我们致力于为所有用户提供最佳体验。
