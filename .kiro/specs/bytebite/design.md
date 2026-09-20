# ByteBite 设计文档

> 状态：原始设计，仅作历史参考。2026-09-20 明确归档边界；旧技术栈、接口、SHALL 条目和勾选状态不代表当前实现或新任务范围。当前架构见 [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)，当前功能与路线图见 [README](../../../README.md)，验证要求见 [docs/TESTING.md](../../../docs/TESTING.md)。

## 概述

ByteBite 是一个现代化的编程语言对比学习平台，采用前端为主的架构设计。系统将提供直观的用户界面，让开发者能够轻松浏览、对比和学习不同编程语言的实现方式。

### 核心目标

- 提供流畅的多语言代码对比体验
- 支持动态语言选择和灵活的布局
- 确保良好的移动端体验
- 实现快速的内容加载和搜索

## 架构

### 技术栈

**前端:**
- **框架**: React 18+ with TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **代码高亮**: Prism.js 或 Shiki
- **状态管理**: React Context API + Local Storage
- **路由**: React Router v6

**数据存储:**
- **内容数据**: 静态 JSON 文件
- **用户偏好**: Browser Local Storage

**部署:**
- 静态网站托管（Vercel / Netlify / GitHub Pages）

### 架构模式

采用 **静态站点生成 (SSG)** 模式：
- 编程习语和代码片段存储为结构化的 JSON 数据
- 构建时生成静态页面
- 客户端进行动态交互和筛选
- 无需后端服务器，降低维护成本

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           React 应用 (SPA)                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │  习语列表  │  │  对比视图  │  │ 语言页面  │  │  │
│  │  └────────────┘  └────────────┘  └───────────┘  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │  搜索组件  │  │ 筛选组件   │  │ 收藏管理  │  │  │
│  │  └────────────┘  └────────────┘  └───────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         状态管理 (Context + Hooks)               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Local Storage API                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP GET
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   静态资源服务器                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  /data/idioms.json                               │  │
│  │  /data/languages.json                            │  │
│  │  /data/code-snippets.json                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 组件和接口

### 核心组件

#### 1. IdiomList 组件
**职责**: 展示编程习语列表，支持搜索和筛选

**Props**:
```typescript
interface IdiomListProps {
  idioms: Idiom[];
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
}
```

**状态**:
- 当前搜索关键词
- 激活的筛选条件
- 显示的习语列表

#### 2. CodeComparison 组件
**职责**: 并排展示多种语言的代码实现

**Props**:
```typescript
interface CodeComparisonProps {
  idiomId: string;
  selectedLanguages: string[];
  onLanguageChange: (languages: string[]) => void;
}
```

**功能**:
- 动态渲染选中语言的代码列
- 语法高亮
- 代码说明展示
- 响应式布局（桌面端多列，移动端堆叠）

#### 3. LanguageSelector 组件
**职责**: 允许用户选择要对比的编程语言

**Props**:
```typescript
interface LanguageSelectorProps {
  availableLanguages: Language[];
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  maxSelection?: number;
}
```

**交互**:
- 多选下拉菜单或复选框列表
- 显示已选语言的标签
- 支持快速清除和重置

#### 4. LanguagePage 组件
**职责**: 展示单个编程语言的详细信息

**Props**:
```typescript
interface LanguagePageProps {
  languageId: string;
}
```

**内容**:
- 语言基本信息卡片
- 核心特性列表
- 该语言实现的所有习语
- 相关资源链接

#### 5. FavoriteManager 组件
**职责**: 管理用户收藏的习语

**功能**:
- 添加/移除收藏
- 展示收藏列表
- 持久化到 Local Storage

## 数据模型

### Idiom (编程习语)

```typescript
interface Idiom {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  paradigms: string[]; // ['oop', 'functional', 'concurrent']
  implementations: Implementation[];
  tags: string[];
}
```

### Implementation (代码实现)

```typescript
interface Implementation {
  languageId: string;
  code: string;
  explanation: string;
  output?: string;
  designRationale?: string;
  pros?: string[];
  cons?: string[];
  references?: Reference[];
}
```

### Language (编程语言)

```typescript
interface Language {
  id: string;
  name: string;
  version: string;
  paradigms: string[];
  typeSystem: 'static' | 'dynamic' | 'gradual';
  description: string;
  features: string[];
  officialDocs: string;
  icon?: string;
}
```

### FilterOptions (筛选选项)

```typescript
interface FilterOptions {
  categories?: string[];
  paradigms?: string[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  languages?: string[];
}
```

### UserPreferences (用户偏好)

```typescript
interface UserPreferences {
  favoriteIdioms: string[];
  selectedLanguages: string[];
  theme?: 'light' | 'dark';
}
```

## 数据流

### 1. 应用初始化流程

```
用户访问网站
    ↓
加载 React 应用
    ↓
从 Local Storage 读取用户偏好
    ↓
并行加载数据文件:
  - idioms.json
  - languages.json
    ↓
初始化应用状态
    ↓
渲染首页
```

### 2. 习语对比流程

```
用户选择习语
    ↓
导航到习语详情页
    ↓
读取该习语的所有实现
    ↓
根据用户选择的语言筛选实现
    ↓
渲染代码对比视图（多列布局）
    ↓
用户更改语言选择
    ↓
更新显示的代码列
    ↓
保存语言偏好到 Local Storage
```

### 3. 搜索和筛选流程

```
用户输入搜索关键词或选择筛选条件
    ↓
在客户端对习语数据进行过滤
    ↓
更新显示的习语列表
    ↓
显示匹配结果数量
```

## 错误处理

### 数据加载错误

**场景**: JSON 数据文件加载失败

**处理策略**:
- 显示友好的错误提示
- 提供重试按钮
- 记录错误到控制台
- 降级到缓存数据（如果可用）

```typescript
try {
  const data = await fetch('/data/idioms.json');
  return await data.json();
} catch (error) {
  console.error('Failed to load idioms:', error);
  showErrorToast('无法加载数据，请刷新页面重试');
  return getCachedData() || [];
}
```

### 代码执行错误

**场景**: 在线代码执行功能失败（如果实现）

**处理策略**:
- 捕获执行超时
- 显示错误信息
- 提供错误堆栈（开发模式）
- 限制执行时间为 5 秒

### Local Storage 错误

**场景**: 浏览器禁用 Local Storage 或配额已满

**处理策略**:
- 优雅降级，使用内存状态
- 提示用户启用 Local Storage 以保存偏好
- 不影响核心功能使用

```typescript
function savePreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem('bytebite_prefs', JSON.stringify(prefs));
  } catch (error) {
    console.warn('Cannot save preferences:', error);
    // 继续使用内存状态
  }
}
```

### 路由错误

**场景**: 用户访问不存在的习语或语言页面

**处理策略**:
- 显示 404 页面
- 提供返回首页的链接
- 推荐相关内容

## 测试策略

### 单元测试

**工具**: Vitest + React Testing Library

**覆盖范围**:
- 数据过滤和搜索逻辑
- 用户偏好管理函数
- 工具函数（格式化、验证等）

**示例**:
```typescript
describe('filterIdioms', () => {
  it('should filter by difficulty', () => {
    const idioms = [/* test data */];
    const result = filterIdioms(idioms, { difficulty: ['beginner'] });
    expect(result).toHaveLength(2);
  });
});
```

### 组件测试

**覆盖范围**:
- LanguageSelector 的多选行为
- CodeComparison 的动态列渲染
- FavoriteManager 的添加/移除功能

**示例**:
```typescript
describe('LanguageSelector', () => {
  it('should allow selecting multiple languages', () => {
    render(<LanguageSelector {...props} />);
    fireEvent.click(screen.getByText('Go'));
    fireEvent.click(screen.getByText('Rust'));
    expect(props.onChange).toHaveBeenCalledWith(['go', 'rust']);
  });
});
```

### 集成测试

**覆盖范围**:
- 完整的习语浏览和对比流程
- 搜索和筛选的组合使用
- 收藏功能的端到端流程

### 端到端测试

**工具**: Playwright（可选）

**关键场景**:
- 用户从首页浏览到习语详情页
- 选择多个语言进行对比
- 收藏习语并在收藏页查看

### 响应式测试

**方法**:
- 在不同视口尺寸下测试布局
- 验证移动端的堆叠布局
- 测试触摸交互

### 性能测试

**指标**:
- 首次内容绘制 (FCP) < 1.5s
- 最大内容绘制 (LCP) < 2.5s
- 交互时间 (TTI) < 3.5s
- 代码高亮渲染时间 < 200ms

**工具**: Lighthouse, Web Vitals

## 性能优化

### 代码分割

- 按路由分割代码块
- 懒加载习语详情页组件
- 动态导入代码高亮库

```typescript
const IdiomDetail = lazy(() => import('./pages/IdiomDetail'));
```

### 数据优化

- 压缩 JSON 数据文件
- 使用 CDN 分发静态资源
- 实现虚拟滚动（如果习语列表很长）

### 渲染优化

- 使用 React.memo 避免不必要的重渲染
- 使用 useMemo 缓存计算结果
- 防抖搜索输入

```typescript
const filteredIdioms = useMemo(
  () => filterIdioms(idioms, filters),
  [idioms, filters]
);
```

### 缓存策略

- Service Worker 缓存静态资源
- 缓存 API 响应数据
- 使用 stale-while-revalidate 策略

## 可访问性

### WCAG 2.1 AA 合规

- 所有交互元素支持键盘导航
- 提供适当的 ARIA 标签
- 确保颜色对比度 ≥ 4.5:1
- 代码块提供纯文本替代

### 语义化 HTML

- 使用正确的标题层级
- 使用 `<nav>`, `<main>`, `<article>` 等语义标签
- 表单元素关联 label

### 屏幕阅读器支持

- 为图标按钮提供 aria-label
- 动态内容更新使用 aria-live
- 代码块标注编程语言

## 国际化

### 初期支持

- 界面语言：中文（简体）
- 代码注释：保持原语言或英文

### 未来扩展

- 使用 i18n 库（react-i18next）
- 支持多语言界面切换
- 社区贡献翻译

## 部署策略

### 构建流程

```bash
npm run build
  ↓
Vite 构建优化
  ↓
生成静态文件到 /dist
  ↓
部署到静态托管服务
```

### 环境配置

- **开发环境**: 本地 Vite 开发服务器
- **预览环境**: Vercel/Netlify 预览部署
- **生产环境**: CDN 加速的静态托管

### CI/CD

- GitHub Actions 自动构建
- PR 预览部署
- 主分支自动部署到生产

## 未来扩展

### 第一阶段（MVP）
- 核心习语浏览和对比功能
- 支持 12 种编程语言
- 基础搜索和筛选
- 本地收藏功能

### 第二阶段
- 在线代码执行（使用 WebAssembly 或远程沙箱）
- 用户账户系统
- 社区贡献代码片段
- 评论和讨论功能

### 第三阶段
- AI 辅助代码解释
- 个性化学习路径推荐
- 代码片段版本历史
- 移动应用（React Native）

## 设计决策

### 为什么选择静态站点？

**理由**:
- 降低运维成本和复杂度
- 更快的加载速度
- 更好的 SEO
- 易于部署和扩展
- 对于内容为主的网站最合适

### 为什么使用 Local Storage？

**理由**:
- 无需用户注册即可使用收藏功能
- 降低开发和维护成本
- 保护用户隐私
- 足够满足 MVP 需求

**权衡**:
- 数据不能跨设备同步（未来可通过账户系统解决）
- 清除浏览器数据会丢失收藏（可导出/导入功能缓解）

### 为什么选择 React + TypeScript？

**理由**:
- React 生态成熟，组件化开发效率高
- TypeScript 提供类型安全，减少运行时错误
- 丰富的第三方库支持
- 良好的开发者体验

### 代码高亮方案选择

**选项对比**:
- **Prism.js**: 轻量，主题丰富，易于定制
- **Shiki**: 使用 VS Code 的语法高亮引擎，更准确但体积较大

**决策**: 优先使用 Prism.js，如果需要更精确的高亮再考虑 Shiki
