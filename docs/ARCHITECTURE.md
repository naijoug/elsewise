# 当前架构

本文描述当前实现；原始设计保留在 [.kiro/specs/bytebite](../.kiro/specs/bytebite/design.md)，仅作历史参考。

## 运行方式

ByteBite 是客户端渲染的 SPA。Vite 生成静态资源，浏览器加载 React 后渲染页面；
构建过程没有逐路由生成 HTML，也没有应用后端或在线代码执行服务。

| 层 | 实现与入口 |
| --- | --- |
| UI | React 19、TypeScript、Tailwind CSS 4；[组件目录](../src/components) |
| 构建 | rolldown-vite（以 `vite` 包名使用）；[vite.config.ts](../vite.config.ts) |
| 路由 | React Router 7、BrowserRouter、按页面 lazy 加载；[App.tsx](../src/App.tsx) |
| 状态 | [AppContext](../src/contexts/AppContext.tsx) 与 [usePreferences](../src/hooks/usePreferences.ts) |
| 数据加载 | [dataLoader.ts](../src/utils/dataLoader.ts) 并行 fetch 两份 JSON |
| 搜索筛选 | [filters.ts](../src/utils/filters.ts) 在客户端计算 |
| 代码展示 | [CodeComparison](../src/components/CodeComparison.tsx) 使用 Prism.js，显示预先编写的输出 |
| 持久化 | [storage.ts](../src/utils/storage.ts) 使用 Local Storage 保存收藏和语言偏好 |

## 数据流

构建前，同步器尝试把外部 handbook 的 YAML 转成 `src/data/idioms.json`，并保留未迁移旧条目。
`src/data/languages.json` 在本仓库维护。handbook 缺失时允许使用已提交快照，详见[数据契约](DATA_FORMAT.md)。

运行时，`new URL(..., import.meta.url)` 解析构建后的 JSON 资源地址，数据进入 Context，
页面执行客户端搜索、筛选和语言选择。不要把历史设计中的 `/data/*.json` 路径当作实际部署地址。

搜索覆盖标题、描述、标签、分类、语言名称/ID、实现代码和说明。
不同筛选组之间是 AND，同组内多选是 OR；结果卡片展示命中原因。

## 路由与托管

| 路径 | 页面 |
| --- | --- |
| `/` | 习语列表、搜索和筛选 |
| `/idiom/:id` | 习语详情、实现对比和收藏 |
| `/language/:id` | 语言信息及相关习语 |
| `/favorites` | 收藏列表 |
| `*` | 未找到页面 |

当前自动部署目标是 GitHub Pages；Vercel、Netlify 是可选平台。
静态资源前缀由 `GHP_BASE` 控制。修改子路径部署时也要核对 BrowserRouter 的路径处理；
当前 Router 没有配置 basename，复制 404.html 只能提供 HTML 回退，不能证明页面路由正确。
详见[部署指南](DEPLOYMENT.md)。

## 当前能力与后续方向

已实现习语浏览、搜索筛选、语言对比、静态输出展示、本地收藏和响应式布局。
在线代码执行、账户、AI 解释、完整主题切换和国际化仍在 [README 路线图](../README.md#路线图)中。
虚拟滚动、Service Worker、真实用户性能监控也不是当前架构的一部分。

性能指标和 WCAG AA 是验证目标；已存在相关实现不等于全站达标，验证方式见[测试指南](TESTING.md)。
