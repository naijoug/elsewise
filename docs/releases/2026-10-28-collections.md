# 集合与查找基础（2026-10-28）

## 本批范围

新增顺序集合、键值映射两章，各覆盖 12 门语言；共 24 个双语实现。现有 8 个基础章、其余文档和 21 个旧习语的 ID 不变；文档总计 30 章、228 个实现。两章在基础语法之后的“集合与查找”模块，共享现有语言选择、学习、收藏与双语路由。

来源账本：[collections-source-coverage.json](../collections-source-coverage.json)；审阅与边界：[collections-source-review.md](../collections-source-review.md)。没有修改外部 handbook 或旧生成快照。

## 发布前验证

- Node 22.23.4；根回归 239、v2 回归 85 通过；lint、格式、TypeScript 和静态构建通过。
- 根路径及 `/elsewise/` 均生成 138 个 HTML 页面，4438 个内部链接目标检查无缺失。
- 最终 Pages 首页 HTML 25644 bytes，gzip 7471 bytes。这是产物尺寸记录，不是性能提升或真实用户加载速度结论；首页不包含新增实现代码，代码仍在静态详情正文中。
- dot 云 Chromium 桌面约 1165 CSS px、窄窗口约 532 CSS px及150%浏览器缩放下约355 CSS px：中英文、深浅色、目录/语言折叠、关联文档、选择持久化、学习/收藏标记与撤销已验收。缩放不是触屏设备仿真。
- 增加 CI 浏览器用例，覆盖两章的12种实现、来源、关联跳转、双语与两种主题；最终运行结果须以该提交的 CI/Pages 工作流为准，不能将此发布前记录当作工作流已完成。

## 验证边界及文档差异

未运行24个多语言示例、未测试真实iPhone/Safari，也未宣称通读各语言完整手册。浏览器测试验证网站，不等于编译所有示例。

`docs/DATA_FORMAT.md` 原顶部只列 practical-docs/english-content；代码 `v2/src/lib/feature-content.ts` 已包含 foundations。本批在文档顶部补充 foundations 与 collections 的本仓权威源、统一加载入口，保留旧同步边界。

`AGENTS.md` 引用用户 Mac 上的外部规范路径；本批遵照用户明确要求仅在 dot 云电脑工作，未访问用户电脑，采用仓库内准则与本会话授权。
