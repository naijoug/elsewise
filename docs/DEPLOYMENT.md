# 部署指南

当前仓库的自动发布目标是 **GitHub Pages**。Vercel 与 Netlify 提供可选托管配置，
没有由当前 GitHub Actions 自动部署到这两个平台的集成。

## 环境与数据

- Node 22.x，最低 22.12.0；版本线见 `.nvmrc`，支持范围见 `package.json` 的 engines。
- 使用 `npm ci` 安装已锁定的依赖；根 postinstall 会对独立 `v2/package-lock.json` 执行 npm ci。
- 发布文件来自 `dist/`，由 `v2/` 中的 Astro 静态生成。
- 习语来源、`TECH_CARDS_HANDBOOK_DIR`、同步回退和生成文件提交规则见[数据指南](DATA_FORMAT.md)。

只克隆 Elsewise 的构建可使用已提交快照。若本次发布包含习语更新，必须在可用的源目录同步后检查并提交 JSON，
并记录源提交。构建成功或同步输出总数不能单独证明发布了最新内容。

## 本地准备

对默认根路径部署，只需选择一次完整验证入口：

```bash
npm ci
npm run pre-deploy
npm run preview
```

`pre-deploy` 依次检查 Node、运行 production 环境的 validate、检查输出产物；只构建一次，失败时保留日志并停止。
之后的 preview 使用已构建的 dist，无需再执行 build。若需要自动启动预览并做 HTTP 冒烟检查，
用 `npm run test:all` 替代 `pre-deploy` 和手动 preview。

纯 UI 或逻辑修改的本地检查可以更小，详见[验证指南](TESTING.md)。正式发布按[目标相关检查清单](DEPLOYMENT_CHECKLIST.md)验收。

## GitHub Pages 自动发布

[deploy.yml](../.github/workflows/deploy.yml) 在 main 推送或手动 dispatch 时运行：

1. checkout 本仓库，使用 `.nvmrc` 指定的 Node 版本线安装依赖。
2. 普通仓库根据仓库名设置 `GHP_BASE=/<仓库名>/`；用户/组织主页仓库使用 `/`。
3. 运行 production 环境的完整预部署检查和构建。
4. 保留 Astro 生成的独立 `404.html`，绝不能用首页覆盖；Chromium 验收静态深链、桌面和移动端交互。
5. 浏览器测试通过后上传，并通过 Pages Action 发布。

仓库 Settings → Pages 的构建来源需设为 GitHub Actions，并允许工作流使用 Pages 和 OIDC 权限。
当前工作流不需要 `VERCEL_TOKEN`、`VERCEL_ORG_ID` 或 `VERCEL_PROJECT_ID`。

## Elsewise 更名与已有检出

项目由 ByteBite 更名为 **Elsewise（异曲）**，仓库目标为 `naijoug/elsewise`。
已有检出可保持本地文件夹名，更新远端即可：

```bash
git remote set-url origin git@github.com:naijoug/elsewise.git
```

默认 Pages 地址随仓库改名变为 `https://naijoug.github.io/elsewise/`。
仓库重命名不等于新代码已经发布；须用新前缀重新构建并部署。
GitHub 仓库旧链接与 Pages 旧站点是不同资源，不应依赖旧 Pages 地址自动跳转。
同域名下从 `/bytebite/` 迁到 `/elsewise/` 不改变 Local Storage 的源，
应用会自动读取旧收藏和语言偏好，详见[架构说明](ARCHITECTURE.md)。

历史验收记录与原始版权署名保留原名，避免改写历史。

## 验证 Pages 新前缀

本地复现普通项目的构建前缀：

```bash
GHP_BASE=/elsewise/ npm run pre-deploy
npx playwright install chromium
GHP_BASE=/elsewise/ npm run test:e2e
GHP_BASE=/elsewise/ npm run preview
```

资源前缀和静态页面链接统一来自构建时的 `BASE_URL`；生产不再使用 BrowserRouter。
预览与浏览器测试必须传入与构建一致的 `GHP_BASE`；`test:e2e` 使用已有产物，不重新构建。
发布前应在目标路径检查首页、详情、收藏和直接刷新。已知详情路由直接返回静态 HTML（200，缺少尾斜杠由宿主重定向）；未知路由使用独立404页面（404）。

[ci.yml](../.github/workflows/ci.yml) 在 main/develop 推送和对应 PR 时检查 lint、格式、测试、构建、输出文件和桌面/移动端浏览器交互。
PR 使用 preview 环境构建并上传 artifact，不会创建在线预览站点或发布预览链接。
CI 构建和 Pages 发布构建的路径/环境可能不同，应以最终发布产物的检查为准。

## 历史可选托管说明（Astro 迁移后未重新验收）

以下 Vercel/Netlify 旧 SPA 配置不属于本次已验收发布范围；不要据此声称可直接发布第二代。

## Vercel 可选方案

通过 Vercel 的 Git 导入配置项目，使用 [vercel.json](../vercel.json)：

- 安装：`npm ci`；构建：`npm run build:production`；输出：`dist`。
- Node 版本使用 package.json engines 指定的 22.x。
- 根路径部署保持 `GHP_BASE` 未设置；配置已包含 SPA rewrite 和静态资源缓存响应头。
- Git 集成的生产分支和预览部署由 Vercel 项目设置控制，不代表本仓库已配置 GitHub Actions Vercel 发布。

如另外实现 CLI 或 Actions 发布，再按选定流程配置 Vercel 凭据；无需为 Pages 发布准备这些凭据。

## Netlify 可选方案

通过 Netlify 的 Git 导入配置项目，使用 [netlify.toml](../netlify.toml)：

- Node 22；构建：`npm run build:production`；输出：`dist`。
- 安装依赖使用锁文件；本地和自定义流水线使用 `npm ci`。
- 根路径部署保持 `GHP_BASE` 未设置；配置已包含 200 SPA rewrite、缓存和响应头。
- 自动发布与预览由 Netlify 项目设置控制。

平台托管构建会再次生成产物，不能把本地检查当作远程产物已经验收。

## 环境变量

| 名称 | 用途 |
| --- | --- |
| `VITE_ENV` | 在 Vite 配置中控制 source map；production 时关闭，preview 时开启 |
| `VITE_APP_TITLE` | HTML 页面标题；开发与生产环境分别在对应 `.env` 文件维护 |
| `GHP_BASE` | 资源和路由前缀，以 `/` 开头和结尾，缺省 `/`；预览和浏览器测试须使用同一值 |
| `TECH_CARDS_HANDBOOK_DIR` | 构建机器上的 handbook 目录，不是浏览器变量 |

`.env.production` 存在不代表 `process.env.VITE_ENV` 在配置求值前已设置；使用 `build:production` 或 `pre-deploy` 明确传入。
`.env.example` 中的 API、账户、分析等条目是未来预留项，未配置这些功能不阻塞当前静态站点发布。

## 故障定位与回滚

| 问题 | 优先检查 |
| --- | --- |
| Node 不匹配 | engines、`.nvmrc` 与托管实际版本 |
| 数据没更新 | 是否出现 keeping existing 警告、源路径和已提交 JSON 差异 |
| 资源加载失败 | GHP_BASE、构建后的资源 URL 和上传文件 |
| 子路径页面错误 | BrowserRouter 路径处理、站点前缀和直接刷新行为 |
| 校验失败 | 查看失败步骤的原始输出，只重跑受影响检查 |

需要回滚时，先确定要恢复的行为和目标版本。在 Pages 流程中撤销相关代码更改后重新通过检查发布；
`git revert <commit>` 是撤销一个提交，不等同于将整个站点恢复到该提交状态。
Vercel/Netlify 可使用平台历史部署回滚，并核对仓库状态以免下一次发布覆盖。
回滚范围和发布目标按用户已授权的操作执行。

## 发布身份与静态产物

`dist/build-manifest.json` 包含 version=2、当前 GitHub Actions 的 GITHUB_SHA、base、所有静态内容路由与实现数量。上线后须对照该 commit 与 Actions 成功运行，而不是仅确认仓库已推送。`npm run verify-build` 只检查输出，避免源文件存在掩盖缺失产物。
