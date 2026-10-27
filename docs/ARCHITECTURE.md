# 对照文档与双语站点（2026-10-27）

当前生产首页是任务优先的对照文档工作台：按文件、数据格式、网络、函数、类型、对象、资源、并发分组；同一任务只有一个文档与逐语言实现。首批新章节为 UTF-8 文件读写、JSON、HTTP GET，每项覆盖 12 门已注册语言。此前 16 个概念保留稳定 ID 与来源，不再显示通用/特色分类徽章；未收录不等于不支持。目录不是完整语言手册。

中文保留原路径，英文位于 `/en/`；正文、界面、搜索索引分别生成，代码语言选择与界面语言独立。原 `/idiom/:id`、`/feature/:id`、`/language/:id` 不变；`/idioms/` 现在直接显示习语目录，不再跳转首页。学习键、收藏键、主题和语言偏好仍共享同源且不带 locale；旧 ByteBite 回退逻辑保留。

`v2/src/data/practical-docs.json` 是本仓库新编写的任务内容；`english-content.json` 是既有内容的翻译层，不替代未知外部 handbook 权威源，生成快照未修改。官方目录/所选章节核查记录见 `official-docs-coverage.json`。所有新示例明确未执行；依赖、平台、编码及错误处理边界逐语言记录。Astro 构建期高亮、摘要 island、延迟代码索引架构保持。

以下旧章节若提及 SPA、尚未国际化、首页习语或旧别名重定向，仅是历史实现，以上述说明和当前 `v2/` 为准。

---

# 第二代生产架构（2026-10-26）

生产入口现为 `v2/`：Astro静态生成目录、习语详情、语言目录/详情、收藏壳与404；React岛只承载搜索筛选、语言选择、复制、收藏与主题。Prism只在构建期使用。目录props只有摘要，代码搜索索引在首次输入时加载；详情只包含当前习语代码。

继续复用 `src/data` 快照和 `src/utils/storage.ts`，保留 `elsewise_preferences` 及旧 `bytebite_preferences` 回退键。主内容仍来自外部handbook，构建保留快照不等于更新权威内容。未提供账户或在线执行；示例输出不是实时结果。

根 `build`/`validate`/`pre-deploy` 已接入静态生产流水线；`build:legacy`仅供旧实现回归，不用于Pages。以下内容保留作原SPA实现文档，提到BrowserRouter或全量客户端加载的部分不再描述生产架构。

---

# 当前架构

## 运行方式

Elsewise 是客户端渲染的 SPA。Vite 生成静态资源，浏览器加载 React 后渲染页面；
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

品牌名称、中文名、标语与仓库链接统一维护在 `src/config/brand.ts`。
HTML 标题读取 `.env.development` / `.env.production` 的 `VITE_APP_TITLE`。
偏好使用 `elsewise_preferences`；新键不存在时读取并归一化 `bytebite_preferences`，
再尝试写入新键。迁移写入失败仍返回旧偏好；旧键保留用于回滚，新键始终优先。
清除偏好会同时移除两个键。迁移仅适用于同源站点，跨域迁移需另行导出与导入。

## 路由与托管

| 路径 | 页面 |
| --- | --- |
| `/` | 习语列表、搜索和筛选 |
| `/idiom/:id` | 习语详情、实现对比和收藏 |
| `/languages` | 编程语言目录 |
| `/language/:id` | 语言信息及相关习语 |
| `/idioms` | 兼容旧链接，重定向到首页 |
| `/favorites` | 收藏列表 |
| `*` | 未找到页面 |

当前自动部署目标是 GitHub Pages；Vercel、Netlify 是可选平台。
静态资源、BrowserRouter basename 和错误恢复地址共享 `GHP_BASE` 对应的 `BASE_URL`。
页内链接使用 React Router，Pages 的深链接由 404.html 回退；发布工作流先验证最终产物的浏览器行为。
详见[部署指南](DEPLOYMENT.md)。

## 当前能力与后续方向

已实现习语浏览、搜索筛选、语言对比、静态输出展示、本地收藏和响应式布局。
在线代码执行、账户、AI 解释、完整主题切换和国际化仍在 [README 路线图](../README.md#路线图)中。
虚拟滚动、Service Worker、真实用户性能监控也不是当前架构的一部分。

性能指标和 WCAG AA 是验证目标；已存在相关实现不等于全站达标，验证方式见[测试指南](TESTING.md)。

## 启动与发布验证

Prism core 初始化后按依赖顺序加载语言 grammar；使用自动分包，避免把所有 Prism 模块强制合入 vendor 后提前执行副作用。
无法高亮的代码交给 React 作为纯文本渲染。Local Storage 中的字段会校验和归一化，损坏的偏好不阻断启动。
浏览器发布测试直接加载 dist，覆盖启动、搜索筛选、代码高亮、收藏持久化、导航和错误恢复。

## Get 学习记录

知识点（习语 ID）级别的 Get 与收藏独立。目录卡片和详情可标记/撤销；目录的全部、已学会、未学会与搜索、分类、语言及收藏条件取交集，重置筛选不删除学习记录。语言详情的进度仅统计该目录，不把未收录实现当作未学会。

浏览器键 `elsewise_learned_v1` 存储 `{ version: 1, ids: string[] }`，不改写收藏和语言偏好键。SSR 用空状态再安全水合；同源标签页 storage 事件和 pageshow 更新显示。损坏格式不会使页面崩溃，重新标记建立记录；写入失败时保留当前页面内状态并明确提示可能丢失，不声称持久化或跨设备同步。清除浏览器数据会清除这些本地记录。
