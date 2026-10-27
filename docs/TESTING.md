# 第二代验证入口

`npm run pre-deploy` 是生产入口：Node22检查、原代码lint/格式/单元回归、`npm run test:v2`、静态构建及产物校验。CI/Pages继续执行 `npm run test:e2e` 的desktop/mobile两项目；已更新为静态路由200、独立404、延迟索引、偏好迁移、多语言与无JS正文。旧SPA的全量数据失败场景改为搜索索引失败重试。

`build-manifest.json`可核对发布SHA。任何测试数字以当次日志为准；旧版本通过记录不算重建后的验收。

以下原实现测试说明保留作维护参考。

---

# 验证指南

本地按改动范围选择检查；CI 保留 lint、格式、全部 Vitest 测试和构建门禁。
检查通过后，仅在新改动、失败或未解决疑点出现时重复或扩大范围。

## 按改动选择检查

| 改动 | 本地检查与完成证据 |
| --- | --- |
| 纯文档 | 核对链接、命令、路径及与代码的一致性；无需为文字修改运行全套测试 |
| 搜索、筛选、存储逻辑 | 受影响测试、相关 lint；涉及类型边界时执行 TypeScript 检查 |
| UI 交互 | 相关组件/页面测试；布局、焦点或响应式变化时检查实际页面 |
| 习语数据 | 编辑 YAML，执行同步，检查具体条目差异和同步日志，再检查页面展示 |
| 同步器 | `npm run test:run -- scripts/syncTechCards.test.mjs`；覆盖成功和失败路径 |
| 构建、部署、依赖、公共配置 | `npm run pre-deploy`；若修改预览或 HTTP 检查流程，使用 `npm run test:all` |

常用的局部检查示例：

```bash
npm run test:run -- src/utils/filters.test.ts
npm run test:run -- src/components/SearchResultSummary.test.tsx
npm exec -- eslint src/utils/filters.ts
npm exec -- prettier --check src/utils/filters.ts
npm exec -- tsc -b
```

## 验证入口

以下命令是按需要选择的入口，不是要求依次执行的清单。

| 命令 | 范围与副作用 |
| --- | --- |
| `npm run test:run` | 全部 Vitest 测试，一次执行 |
| `npm run validate` | lint → 格式 → Vitest → 数据同步 → TypeScript → Vite 构建 |
| `npm run pre-deploy` | Node 版本检查 → production 环境的 validate → 构建产物检查，只构建一次 |
| `npm run verify-build` | 检查已有 dist 的 HTML、JS、CSS 和两份非空 JSON 数组，不重新构建 |
| `npm run test:all` | pre-deploy → 启动本地预览 → HTTP 冒烟检查 → 关闭本次启动的进程 |
| `npm run test:smoke` | 检查已运行的预览服务器，默认 `http://localhost:4173` |
| `npm run test:e2e` | Playwright 对已有 dist 执行 Chromium 桌面/移动端端到端测试，自动启停本地测试服务器 |

build 可能重写 `src/data/idioms.json`；确认生成差异属于当前任务。源仓库缺失时会回退，
所以 validate 通过也不能证明数据已经更新。详见[数据同步边界](DATA_FORMAT.md#来源与同步边界)。

## 测试能力的边界

- 单元与组件测试使用 Vitest、jsdom 和 React DOM；复用 [renderComponent.tsx](../src/test/renderComponent.tsx)，未引入 React Testing Library。
- 同步器测试使用临时目录和自建 fixture，并在结束后清理，不改真实 handbook。
- HTTP 冒烟脚本检查状态码、HTML 标记、静态资源和 SPA 回退。它不执行浏览器交互，不能证明搜索、收藏和语言切换正确。
- HTTP 检查默认期待 SPA 路由返回 200，适用于本地预览或配置了 rewrite 的托管。浏览器测试服务器模拟 Pages 深链接返回 HTTP 404 并提供 HTML 回退，检查应用实际渲染与交互。它不能替代上线后的真实域名验收。
- Playwright 测试覆盖生产启动、资源加载、搜索筛选、全部在用语言的高亮、收藏及语言偏好持久化、导航/深链接刷新、损坏偏好和数据失败重试。CI 测根路径，Pages 发布前测实际部署前缀。
- 当前未配置覆盖率 provider 或覆盖率门槛；不宣称 80% 覆盖率。保留的 `test:coverage` 命令需要先安装与 Vitest 版本匹配的 provider 才能使用，不属于当前门禁。
- WCAG 达标和性能目标需要对应测量，不能从单元测试、HTTP 响应时间或构建体积推断。

## 结果记录

交付时说明执行的命令、通过/失败情况和没有验证的部分。区分既有失败与本次改动导致的失败。
浏览器、性能或可访问性报告应记录提交、日期、环境、目标 URL/页面和结果。
文档中的旧测试数量和构建大小只代表记录时的状态，不要求每次改动刷新历史记录。

## 生产浏览器验收

首次安装浏览器：`npx playwright install chromium`（Linux CI 使用 `--with-deps`）。
先执行一次 `npm run pre-deploy`，再执行 `npm run test:e2e`；后者只验证已有 dist，不重新构建。
子路径部署在这两个命令前均设置同一个 `GHP_BASE=/elsewise/`；Pages 的完整示例见部署指南。
测试端口为 127.0.0.1:4176，不复用其他进程。失败截图和 trace 保存在被 Git 忽略的 `test-results/`。
`test:smoke` 保持 HTTP 检查用途；旧的 `test:e2e -- URL` 用法应改为 `test:smoke -- URL`。
