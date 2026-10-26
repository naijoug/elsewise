# Elsewise 项目约定

@/Users/guojian/.codex/RTK.md

个人工作区的外部账号操作须先读取并遵守
`/Users/guojian/Workspace/naijoug/AGENTS.md`；临时检出也使用此规范。

## 项目边界

Elsewise 使用 Astro 静态生成页面、React 局部交互与 TypeScript，内容来自静态 JSON，偏好保存在浏览器 Local Storage。
`v2/` 是生产应用；`src/` 保留内容、类型、存储兼容工具与旧实现回归，不再是生产页面入口。
当前功能是习语浏览、搜索筛选、语言对比和收藏；在线执行代码、账户、AI 解释属于路线图。
运行环境使用 Node 22.x（最低 22.12.0），包管理器使用 npm 和已提交的 package-lock.json。

## 按任务查阅

| 任务 | 入口 |
| --- | --- |
| 架构、路由、状态边界 | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| 习语、语言、同步器 | [docs/DATA_FORMAT.md](docs/DATA_FORMAT.md) |
| 测试或选择验证范围 | [docs/TESTING.md](docs/TESTING.md) |
| 构建、托管、发布 | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| UI 可访问性 | [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) |

只读取当前任务需要的文档和代码。`.kiro/specs/bytebite/` 是历史规格与实施记录，
其中未实现的需求、旧接口和已勾选任务不代表当前任务的范围或验证结果。
命令以 package.json 为准，类型以 src/types/index.ts 为准，部署以实际工作流为准。
发现文档与实现不一致时，说明差异；不要自动把历史需求扩成新功能。

## 数据修改

- 习语源文件是相邻 handbook 仓库的 `data/features/*.yaml`，位置和覆盖规则见数据文档。
- `src/data/idioms.json` 是提交到仓库的生成快照；修改习语时编辑 YAML，再同步并检查差异。
- `src/data/languages.json` 在本仓库维护。
- `npm run build` 会尝试同步并可能改写快照；handbook 缺失时会保留现有数据。
  UI 任务可使用该快照继续；内容任务不能把回退或构建成功描述为主数据已更新。

## 工作方式与完成标准

- 保留用户已有的未提交修改；仅修改和提交当前任务涉及的文件。
- 使用现有组件、测试辅助工具和配置；ESLint 使用 eslint.config.js，格式使用 .prettierrc。
- 已授权的本地修改、测试与相关失败修复连续完成；只有缺失信息会实质影响结果时才询问。
- 用户已明确给出的任务要求优先于文档中的默认流程，并遵守实际工具和环境权限。
- 完成请求涉及的实现、相应验证和必要文档更新。验证通过后，仅因新改动、失败或未解决疑点扩大或重复检查。
- 发布按用户已授权的目标执行；需要补充授权时先准备可审查结果，不把本地验证停在审批之前。
- 最终说明改动、验证结果和未验证部分。因某条文档约束受阻时，指出具体文件、原文和适用原因。

## 文档与代码不一致时

- 当仓库文档与现有代码不一致时，遵循现有代码中的约定；用户明确要求的变更优先。
- 在最终回复中逐项指出本次任务发现的每一处文档与代码不一致，注明文档位置、对应代码位置、具体差异及本次采用的处理方式。只报告实际核实的差异，不把未检查的部分描述为一致。
