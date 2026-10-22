# 贡献指南

欢迎提交内容、代码、文档或问题反馈。讨论时保持尊重，说明问题、复现方法和预期行为。
[GitHub Issues](https://github.com/naijoug/elsewise/issues) 用于报告问题和讨论较大的功能变更。

## 开发准备

使用 Node 22.x（最低 22.12.0）和 npm。已有 nvm 时可使用仓库的 `.nvmrc`。

```bash
npm ci
npm run dev
```

以当前代码和[架构说明](ARCHITECTURE.md)为依据。历史 `.kiro/specs` 不作为每次贡献的必读材料。

## 内容贡献

习语的权威来源是外部 handbook YAML。按[数据格式与同步](DATA_FORMAT.md)编辑源文件，
执行同步并审查 JSON 差异；不要直接手改生成的 `src/data/idioms.json` 来替代源修改。
源仓库缺失时可继续开发 UI，但不能宣称习语更新已完成。

推荐提供至少两种语言以支持对比；同步器的最低导出条件是一个 ready 实现。
代码示例要包含必要导入，解释实际行为，并如实记录运行输出。
新增语言时在本仓库编辑 `src/data/languages.json`，核对高亮映射和 grammar 后补充对应 YAML 实现。
字段、示例和验证规则统一维护在数据文档中。

## 代码约定

- 使用现有函数组件、Hooks、TypeScript 类型和通用组件。
- ESLint 规则来自 [eslint.config.js](../eslint.config.js)，格式来自 [.prettierrc](../.prettierrc)。
- 样式优先使用现有 Tailwind 约定；运行时计算的样式按具体需要处理。
- 组件/类型使用 PascalCase，函数/变量使用 camelCase；文件命名沿用相邻模块。
- 测试沿用 Vitest、jsdom 与 [React DOM 辅助工具](../src/test/renderComponent.tsx)。
- 保留已有未提交修改，避免无关的格式化、重构或生成数据变更。

## 验证与完成

按[验证指南](TESTING.md)选择检查。例如搜索逻辑修改运行对应测试，纯文档修改核对事实与链接。
布局或交互变化需要检查相应页面和可访问性行为。

完整检查选择 `npm run validate`；发布准备选择 `npm run pre-deploy`；
需要启动本地预览并做 HTTP 检查时选择 `npm run test:all`。这些入口不必顺序串联。
CI 保留全套代码、测试和构建检查。

完成意味着请求范围内的变更、相关验证和必要文档已处理。报告实际检查结果，
说明既有失败、环境限制或未验证部分；不要把历史测量当作新证据。

## 提交与 Pull Request

在工作分支上修改；Agent 新建分支默认使用 `codex/` 前缀，已有分支遵循当前协作安排。
仅暂存相关路径，不使用一揽子 `git add .` 包含其他任务的改动。
提交信息使用 `feat`、`fix`、`docs`、`refactor`、`test`、`chore` 等语义化前缀。

PR 说明包含：

- 具体问题与修改后的行为。
- 相关 Issue 或必要背景。
- 实际执行的验证与结果，未验证项标明原因。
- UI 改动适用时附截图。
- 内容改动注明 handbook 源提交与本仓库生成差异。

无需为了勾选模板而增加无意义测试，或重复更新没有受影响的文档。
合并或推送 main 会触发发布流程，按已授权目标操作，详见[部署指南](DEPLOYMENT.md)。
