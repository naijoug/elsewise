# 构建与验证脚本

从仓库根目录运行以下命令。环境使用 Node 22.x（最低 22.12.0）。

| 入口 | 行为 |
| --- | --- |
| `npm run sync:tech-cards` | 校验 handbook YAML、转换 ready 实现、合并旧条目并写入习语快照 |
| `npm run pre-deploy` | 版本检查 → production validate → 产物检查；一次构建，失败即停止并输出原因 |
| `npm run verify-build` | 检查 dist 中非空 HTML/JS/CSS 与两份可解析的非空 JSON 数组 |
| `npm run test:smoke` | 对运行中的服务进行 HTTP 冒烟检查，默认 localhost:4173 |
| `npm run test:e2e` | test:smoke 的兼容别名；脚本文件仍为 e2e-test.sh |
| `npm run test:all` | pre-deploy → 本地预览 → HTTP 检查 → 清理本次预览进程 |

完整验证范围和能力边界见[验证指南](../docs/TESTING.md)。这些入口按需选择，不要重复串联。
所有验证脚本以非零退出码表示检查失败；未配置的安全响应头会提示而不判失败。

## 数据同步

源目录默认 `../books/tech-cards-handbook`，可通过 `TECH_CARDS_HANDBOOK_DIR` 指定绝对路径。
缺失源目录时允许沿用已提交快照，构建成功不代表内容已同步。
合并规则、YAML 例子与删除边界见[数据文档](../docs/DATA_FORMAT.md)。

## 检查已运行的服务

```bash
npm run test:smoke -- http://localhost:4173
```

HTTP 脚本不运行浏览器，也不能验证搜索、收藏等交互。它默认期待 200 SPA rewrite，
GitHub Pages 的 404 回退需单独验收。`test:all` 使用本地默认根路径构建并自动清理其预览进程，
不终止其他会话的服务器；端口占用时失败并显示日志。

## 修改脚本

命令契约维护在 package.json，CI 与本地尽量复用入口。
涉及流程变更时验证失败会停止、错误日志可见、不会使用过期产物，以及资源缺失确实报错。
不把 JSON 可解析或 HTTP 200 描述为字段完整、浏览器功能正确或正式环境达标。
