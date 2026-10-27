# 对照文档与双语站点（2026-10-27）

当前生产首页是任务优先的对照文档工作台：按文件、数据格式、网络、函数、类型、对象、资源、并发分组；同一任务只有一个文档与逐语言实现。首批新章节为 UTF-8 文件读写、JSON、HTTP GET，每项覆盖 12 门已注册语言。此前 16 个概念保留稳定 ID 与来源，不再显示通用/特色分类徽章；未收录不等于不支持。目录不是完整语言手册。

中文保留原路径，英文位于 `/en/`；正文、界面、搜索索引分别生成，代码语言选择与界面语言独立。原 `/idiom/:id`、`/feature/:id`、`/language/:id` 不变；`/idioms/` 现在直接显示习语目录，不再跳转首页。学习键、收藏键、主题和语言偏好仍共享同源且不带 locale；旧 ByteBite 回退逻辑保留。

`v2/src/data/practical-docs.json` 是本仓库新编写的任务内容；`english-content.json` 是既有内容的翻译层，不替代未知外部 handbook 权威源，生成快照未修改。官方目录/所选章节核查记录见 `official-docs-coverage.json`。所有新示例明确未执行；依赖、平台、编码及错误处理边界逐语言记录。Astro 构建期高亮、摘要 island、延迟代码索引架构保持。

以下旧章节若提及 SPA、尚未国际化、首页习语或旧别名重定向，仅是历史实现，以上述说明和当前 `v2/` 为准。

---

# 数据格式与同步

本文是习语内容、语言信息和同步行为的维护入口。前端类型定义见 [src/types/index.ts](../src/types/index.ts)，
转换与校验逻辑见 [syncTechCards.mjs](../scripts/syncTechCards.mjs)。

## 来源与同步边界

| 数据 | 维护位置 | 网站使用方式 |
| --- | --- | --- |
| 习语主数据 | handbook 仓库的 `data/features/*.yaml` 或 `*.yml` | 同步生成并提交 `src/data/idioms.json` |
| 语言元数据 | `src/data/languages.json` | 在本仓库直接维护 |
| 未迁移旧习语 | 现有 `src/data/idioms.json` 快照 | CLI 同步暂时保留，新增内容应迁入 YAML |

默认 handbook 位于本仓库相邻路径 `../books/tech-cards-handbook`，相对仓库根目录解析。
也可指定绝对路径：

```bash
TECH_CARDS_HANDBOOK_DIR=/absolute/path/to/tech-cards-handbook npm run sync:tech-cards
```

普通同步命令：

```bash
npm run sync:tech-cards
git diff -- src/data/idioms.json
```

CLI 的边界如下：

- handbook 存在时校验 YAML 并生成 JSON；同 ID 的生成内容整体替换旧条目。
- 旧 JSON 中未匹配到生成 ID 的条目会保留。因此删除 YAML 或修改 ID 不会自动删除旧快照条目；删除内容时需明确处理保留策略并检查差异。
- handbook 缺失但存在非空快照时，输出 `keeping existing src/data/idioms.json` 警告并沿用快照。
- handbook 缺失且没有可用快照时失败。回退仅检查快照是否为非空数组，不做完整字段验证。
- `Synced N Elsewise idioms` 的 N 是合并后的总数，可能包含旧条目，不能当作本次新增或从 YAML 生成的数量。
- `build`、`build:preview`、`build:production`、`validate`、`pre-deploy` 会通过构建链调用同步，可能改写 JSON。

UI 开发和只克隆 Elsewise 的 CI 可以使用已提交快照。内容任务需要可用的 YAML 主数据；
不能把回退或构建成功报告为主数据已更新。修改源内容后，应核对输出条目的代码与字段，并分别提交源仓库和本仓库的相关差异。

## 编辑一个习语

在 handbook 的 `data/features/` 下新增或修改 YAML。以下是可同步的源格式示例，JSON 是输出格式：

```yaml
id: array-double
source: tech-cards-handbook
title: 数组元素翻倍
description: 将数组中的每个数字乘以二。
category: 数据处理
difficulty: beginner
paradigms: [函数式]
tags: [数组, 映射]
coverage:
  required: [javascript, python]
implementations:
  javascript:
    status: ready
    code: |
      const values = [1, 2, 3];
      console.log(JSON.stringify(values.map(value => value * 2)));
    explanation: map 返回转换后的新数组。
    output: '[2,4,6]'
  python:
    status: ready
    code: |
      values = [1, 2, 3]
      print([value * 2 for value in values])
    explanation: 使用列表推导式构造新列表。
    output: '[2, 4, 6]'
```

同步后检查具体差异，再在页面查看。提供可运行的例子，包含必要导入，并说明语言版本、输出与重要权衡。
一般推荐两种及以上语言进行对比；一种语言的有效特性也可导出，后续逐步补充。

## 同步器的校验与转换

| 字段或条件 | 当前行为 |
| --- | --- |
| `id` | 非空 kebab-case；YAML 源文件之间不能重复 |
| `title`、`description`、`category` | 非空字符串 |
| `difficulty` | `beginner`、`intermediate`、`advanced` |
| `paradigms`、`tags` | 至少一个非空字符串 |
| `implementations` | 以语言 ID 为键的对象；提及的语言须存在于 languages.json |
| `status` | `ready`、`draft`、`todo`；缺省为 draft，仅 ready 导出 |
| ready 实现的 `code`、`explanation` | 非空字符串 |
| 导出的实现数量 | 至少一个 ready 实现；两种以上是内容质量建议，不是当前硬性门槛 |
| `coverage.required` | 实现必须 ready；`coverage.notApplicable` 中给出原因可豁免 |
| `coverage.optional` | 标记可选语言，不要求其实现存在或 ready |

`coverage.notApplicable` 是语言 ID 到原因的映射。原因应清楚说明为何不适用；
当前脚本只判断原因值是否为真，尚未严格校验 coverage 的全部结构。

输出 `implementations` 为数组，每项包含 `languageId`、`code`、`explanation`。
支持可选字段 `output`、`errorOutput`、`designRationale`、`pros`、`cons`、`references`。
参考链接使用 `{ title, url }`；链接可访问性和代码能否执行需要单独验证，同步成功不代表通过这些检查。

同步器还会保留习语的 `source`（缺省为 `tech-cards-handbook`）和实现的 `sourceCard` 溯源字段；
目前前端类型没有声明这两个元数据字段，页面也不依赖它们。
生成 JSON 使用两空格缩进和结尾换行；不要为压缩体积手改生成文件。

## 添加语言

直接编辑 [languages.json](../src/data/languages.json)。字段与前端契约如下：

| 字段 | 类型与含义 |
| --- | --- |
| `id` | 唯一的小写语言标识，如 javascript、csharp、cpp |
| `name`、`version` | 名称和示例对应的语言版本 |
| `paradigms` | 范式字符串数组 |
| `typeSystem` | static、dynamic 或 gradual |
| `description`、`features` | 简介和核心特性数组 |
| `officialDocs` | 官方文档 URL |
| `icon` | 可选图标地址 |

新增语言时，核对 [CodeComparison.tsx](../src/components/CodeComparison.tsx) 中的语言映射和实际加载的 Prism grammar，
再给相关 YAML 增加实现。语言元数据文件尚无完整的独立运行时校验器，类型定义不能代替数据验证。

## 验证

修改同步逻辑时运行：

```bash
npm run test:run -- scripts/syncTechCards.test.mjs
```

测试使用临时 fixture。内容改动则要在真实源目录同步、审查生成差异，并检查受影响页面。
更广的验证按[验证指南](TESTING.md)选择。
