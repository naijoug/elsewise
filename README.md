# Elsewise · 异曲

**不同语言，同一种巧思。**

通过对比不同编程语言的实现方式，学习编程概念与语言设计。项目原名 ByteBite。

## 当前功能

- 浏览习语，按关键词搜索，按分类、范式、难度和语言筛选。
- 搜索覆盖标题、描述、标签、分类、语言名称/ID、实现代码和说明；卡片展示命中原因。
- 多语言代码对比、Prism.js 高亮、实现说明和预先编写的输出展示。
- 使用浏览器 Local Storage 保存收藏和语言选择。
- 响应式布局，以及键盘、语义化标签等可访问性支持。

不同筛选组之间是 AND，同组内多选是 OR。结果摘要可移除单个条件或清除全部条件。
支持的语言和习语以 [languages.json](src/data/languages.json) 与 [idioms.json](src/data/idioms.json) 为准。

## 快速开始

使用 Node **22.x，最低 22.12.0**；本地、CI 和托管使用同一版本线。使用 npm 和已提交的锁文件。

```bash
git clone https://github.com/naijoug/elsewise.git
cd elsewise
# 使用 nvm 时：nvm install && nvm use
npm ci
npm run dev
```

开发服务器默认地址为 `http://localhost:5173`。
单独克隆本仓库即可使用已提交的数据；修改习语时需要 handbook 主数据，见[数据指南](docs/DATA_FORMAT.md)。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 开发服务器 |
| `npm run test:run -- <测试文件>` | 运行指定测试 |
| `npm run test` | Vitest 监听模式 |
| `npm run lint` / `npm run format:check` | 代码和格式检查 |
| `npm run sync:tech-cards` | 从 handbook 同步习语快照 |
| `npm run build:production` | 同步数据、检查类型并构建生产资源 |
| `npm run preview` | 预览已有 dist，默认端口 4173 |
| `npm run validate` | lint、格式、测试、同步与构建 |
| `npm run pre-deploy` | 一次完整生产验证及产物检查 |
| `npm run test:all` | 生产验证加本地 HTTP 冒烟检查 |

这些是按任务选择的入口，无需依次执行。完整命令定义见 [package.json](package.json)，验证范围见[测试指南](docs/TESTING.md)。

## 架构与文档

当前是 React 19 + TypeScript 的客户端 SPA，使用 React Router 7、Tailwind CSS 4、Prism.js，
通过 rolldown-vite 构建为静态资源。部署工作流当前发布到 GitHub Pages。

| 要做的事 | 文档 |
| --- | --- |
| 了解路由、状态和数据流 | [当前架构](docs/ARCHITECTURE.md) |
| 修改习语或添加语言 | [数据格式与同步](docs/DATA_FORMAT.md) |
| 提交代码或内容贡献 | [贡献指南](docs/CONTRIBUTING.md) |
| 选择测试与解释验证结果 | [验证指南](docs/TESTING.md) |
| 构建或部署到目标平台 | [部署指南](docs/DEPLOYMENT.md) |
| 修改键盘、焦点或响应式交互 | [可访问性指南](docs/ACCESSIBILITY.md) |
| 调查性能或查看旧测量记录 | [性能说明](docs/PERFORMANCE_OPTIMIZATIONS.md) |
| 使用开发 Agent | [项目约定](AGENTS.md) |

## 路线图

以下功能尚未作为当前能力交付，不是日常修改的隐含范围：

- 在线代码执行、账户与社区贡献功能。
- AI 辅助代码解释。
- 更多语言、完整深色主题和多语言界面。
- 按实际性能需要评估虚拟滚动、离线缓存和真实用户性能监控。

## 参与项目

通过 [GitHub Issues](https://github.com/naijoug/elsewise/issues) 报告问题或讨论功能。
提交贡献前阅读[贡献指南](docs/CONTRIBUTING.md)。项目使用 [MIT 许可证](LICENSE)。

灵感来源：[Rosetta Code](https://rosettacode.org/)、[Learn X in Y minutes](https://learnxinyminutes.com/)、[Programming Idioms](https://programming-idioms.org/)。
