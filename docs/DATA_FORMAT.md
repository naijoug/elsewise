# 数据格式文档

本文档详细说明 ByteBite 项目中使用的数据格式和结构。

## 📋 目录

- [概述](#概述)
- [编程习语数据格式](#编程习语数据格式)
- [编程语言数据格式](#编程语言数据格式)
- [数据验证规则](#数据验证规则)
- [示例](#示例)
- [最佳实践](#最佳实践)

## 概述

ByteBite 使用 JSON 格式加载网站数据，包括：

- **编程习语** (`src/data/idioms.json`): 包含所有编程习语及其在不同语言中的实现
- **编程语言** (`src/data/languages.json`): 包含所有支持的编程语言信息

其中 `src/data/idioms.json` 现在由 `npm run sync:tech-cards` 在构建前从 `../books/tech-cards-handbook/data/features/*.yaml` 同步生成；同 ID 的习语以 tech-cards-handbook 为准，尚未迁移到 handbook 的旧 ByteBite 数据会暂时保留。新增或修改跨语言特性时，优先编辑 tech-cards-handbook 的 YAML 主数据，不要直接手改生成后的 `idioms.json`。

这些数据文件在构建时被打包到应用中，在运行时通过 HTTP 请求加载。

## 编程习语数据格式

### 文件位置

`src/data/idioms.json`

### 数据结构

```typescript
interface Idiom {
  id: string;                    // 唯一标识符
  title: string;                 // 习语标题
  description: string;           // 习语描述
  category: string;              // 分类
  difficulty: Difficulty;        // 难度级别
  paradigms: string[];           // 相关编程范式
  tags: string[];                // 标签
  implementations: Implementation[]; // 各语言实现
}

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface Implementation {
  languageId: string;            // 语言 ID（必须在 languages.json 中存在）
  code: string;                  // 代码示例
  explanation: string;           // 代码说明
  output?: string;               // 输出示例（可选）
  designRationale?: string;      // 设计理念（可选）
  pros?: string[];               // 优点列表（可选）
  cons?: string[];               // 缺点列表（可选）
  references?: Reference[];      // 参考链接（可选）
}

interface Reference {
  title: string;                 // 链接标题
  url: string;                   // 链接地址
}
```

### 字段详细说明

#### Idiom 字段

| 字段 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `id` | string | ✅ | 唯一标识符，使用 kebab-case | `"array-map"` |
| `title` | string | ✅ | 习语的中文标题 | `"数组映射"` |
| `description` | string | ✅ | 简短描述（1-2句话） | `"将数组中的每个元素通过函数转换为新值"` |
| `category` | string | ✅ | 分类名称 | `"数据处理"` |
| `difficulty` | string | ✅ | 难度：`beginner`、`intermediate` 或 `advanced` | `"beginner"` |
| `paradigms` | string[] | ✅ | 相关的编程范式 | `["函数式", "面向对象"]` |
| `tags` | string[] | ✅ | 相关标签，用于搜索和筛选 | `["数组", "转换", "高阶函数"]` |
| `implementations` | array | ✅ | 各语言的实现，至少 2 个 | 见下文 |

#### Implementation 字段

| 字段 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `languageId` | string | ✅ | 语言 ID，必须在 `languages.json` 中存在 | `"javascript"` |
| `code` | string | ✅ | 代码示例，使用 `\n` 表示换行 | `"const x = [1, 2, 3];\nx.map(n => n * 2);"` |
| `explanation` | string | ✅ | 代码说明，解释代码的工作原理 | `"使用 map 方法对数组进行转换"` |
| `output` | string | ❌ | 代码的预期输出 | `"[2, 4, 6]"` |
| `designRationale` | string | ❌ | 设计理念，解释为什么这种语言选择这种实现方式 | `"JavaScript 的 map 方法是函数式编程的核心"` |
| `pros` | string[] | ❌ | 这种实现的优点 | `["简洁", "不可变性"]` |
| `cons` | string[] | ❌ | 这种实现的缺点 | `["性能开销"]` |
| `references` | array | ❌ | 参考文档链接 | 见下文 |

#### Reference 字段

| 字段 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `title` | string | ✅ | 链接的标题 | `"Array.prototype.map()"` |
| `url` | string | ✅ | 完整的 URL | `"https://developer.mozilla.org/..."` |

### 完整示例

```json
{
  "id": "array-map",
  "title": "数组映射",
  "description": "将数组中的每个元素通过函数转换为新值，生成新数组",
  "category": "数据处理",
  "difficulty": "beginner",
  "paradigms": ["函数式"],
  "tags": ["数组", "转换", "高阶函数"],
  "implementations": [
    {
      "languageId": "javascript",
      "code": "const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log(doubled);",
      "explanation": "使用内置的 map 方法对数组进行转换",
      "output": "[2, 4, 6, 8, 10]",
      "designRationale": "JavaScript 的 map 方法是函数式编程的核心，返回新数组而不修改原数组",
      "pros": ["简洁", "不可变性", "链式调用"],
      "references": [
        {
          "title": "Array.prototype.map()",
          "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map"
        }
      ]
    },
    {
      "languageId": "python",
      "code": "numbers = [1, 2, 3, 4, 5]\ndoubled = [n * 2 for n in numbers]\nprint(doubled)",
      "explanation": "使用列表推导式进行数组转换",
      "output": "[2, 4, 6, 8, 10]",
      "designRationale": "Python 的列表推导式是最 Pythonic 的方式，比 map 函数更直观",
      "pros": ["可读性强", "性能好", "简洁"]
    }
  ]
}
```

## 编程语言数据格式

### 文件位置

`src/data/languages.json`

### 数据结构

```typescript
interface Language {
  id: string;                    // 唯一标识符
  name: string;                  // 语言名称
  version: string;               // 版本号
  paradigms: string[];           // 支持的编程范式
  typeSystem: TypeSystem;        // 类型系统
  description: string;           // 语言描述
  features: string[];            // 核心特性
  officialDocs: string;          // 官方文档链接
  icon?: string;                 // 图标 URL（可选）
}

type TypeSystem = 'static' | 'dynamic' | 'gradual';
```

### 字段详细说明

| 字段 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `id` | string | ✅ | 唯一标识符，使用小写 | `"javascript"` |
| `name` | string | ✅ | 语言的正式名称 | `"JavaScript"` |
| `version` | string | ✅ | 当前主流版本 | `"ES2023"` |
| `paradigms` | string[] | ✅ | 支持的编程范式 | `["面向对象", "函数式"]` |
| `typeSystem` | string | ✅ | 类型系统：`static`、`dynamic` 或 `gradual` | `"dynamic"` |
| `description` | string | ✅ | 语言的简短描述（1-2句话） | `"一种轻量级、解释型的编程语言"` |
| `features` | string[] | ✅ | 核心特性列表（3-5个） | `["原型继承", "闭包", "异步编程"]` |
| `officialDocs` | string | ✅ | 官方文档的 URL | `"https://developer.mozilla.org/..."` |
| `icon` | string | ❌ | 语言图标的 URL | `"/icons/javascript.svg"` |

### 完整示例

```json
{
  "id": "javascript",
  "name": "JavaScript",
  "version": "ES2023",
  "paradigms": ["面向对象", "函数式", "事件驱动"],
  "typeSystem": "dynamic",
  "description": "一种轻量级、解释型的编程语言，主要用于Web开发",
  "features": [
    "原型继承",
    "闭包",
    "异步编程",
    "动态类型",
    "一等函数"
  ],
  "officialDocs": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript"
}
```

## 数据验证规则

### 通用规则

1. **JSON 格式**: 所有数据文件必须是有效的 JSON
2. **UTF-8 编码**: 使用 UTF-8 编码保存文件
3. **无 BOM**: 不要包含 BOM (Byte Order Mark)
4. **缩进**: 使用 2 个空格缩进

### Idiom 验证规则

1. **唯一 ID**: 每个习语的 `id` 必须唯一
2. **ID 格式**: 使用 kebab-case（小写字母和连字符）
3. **最少实现**: 每个习语至少包含 2 种语言的实现
4. **语言 ID**: 所有 `languageId` 必须在 `languages.json` 中存在
5. **难度值**: `difficulty` 只能是 `beginner`、`intermediate` 或 `advanced`
6. **非空字段**: 必需字段不能为空字符串
7. **数组长度**: `tags` 至少包含 1 个标签，`paradigms` 至少包含 1 个范式

### Language 验证规则

1. **唯一 ID**: 每个语言的 `id` 必须唯一
2. **ID 格式**: 使用小写字母（可以包含数字）
3. **类型系统**: `typeSystem` 只能是 `static`、`dynamic` 或 `gradual`
4. **URL 格式**: `officialDocs` 必须是有效的 URL
5. **特性数量**: `features` 建议包含 3-5 个特性

### 代码示例规则

1. **可运行**: 代码应该是可运行的（包含必要的导入和声明）
2. **简洁**: 通常 5-20 行代码最合适
3. **格式**: 使用 `\n` 表示换行，使用 `\t` 或空格表示缩进
4. **注释**: 适当添加注释，但不要过多
5. **语法**: 遵循该语言的标准语法和风格指南

## 示例

### 添加新习语的完整流程

1. **确定习语信息**:
   - ID: `string-interpolation`
   - 标题: 字符串插值
   - 分类: 字符串处理
   - 难度: beginner

2. **编写实现**（至少 2 种语言）:
   - JavaScript (ES6 模板字符串)
   - Python (f-strings)
   - Go (fmt.Sprintf)

3. **添加到 idioms.json**:

```json
{
  "id": "string-interpolation",
  "title": "字符串插值",
  "description": "在字符串中嵌入变量或表达式的值",
  "category": "字符串处理",
  "difficulty": "beginner",
  "paradigms": ["过程式"],
  "tags": ["字符串", "格式化", "模板"],
  "implementations": [
    {
      "languageId": "javascript",
      "code": "const name = 'Alice';\nconst age = 30;\nconst message = `Hello, ${name}! You are ${age} years old.`;\nconsole.log(message);",
      "explanation": "使用模板字符串（反引号）和 ${} 语法进行字符串插值",
      "output": "Hello, Alice! You are 30 years old.",
      "designRationale": "ES6 引入的模板字符串提供了更清晰的字符串插值语法",
      "pros": ["语法简洁", "支持多行", "可以包含表达式"],
      "references": [
        {
          "title": "Template literals",
          "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals"
        }
      ]
    },
    {
      "languageId": "python",
      "code": "name = 'Alice'\nage = 30\nmessage = f'Hello, {name}! You are {age} years old.'\nprint(message)",
      "explanation": "使用 f-string（格式化字符串字面量）进行字符串插值",
      "output": "Hello, Alice! You are 30 years old.",
      "designRationale": "Python 3.6+ 的 f-string 是最简洁和高效的字符串格式化方式",
      "pros": ["简洁", "高性能", "可读性强"]
    },
    {
      "languageId": "go",
      "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tname := \"Alice\"\n\tage := 30\n\tmessage := fmt.Sprintf(\"Hello, %s! You are %d years old.\", name, age)\n\tfmt.Println(message)\n}",
      "explanation": "使用 fmt.Sprintf 函数和格式化占位符进行字符串格式化",
      "output": "Hello, Alice! You are 30 years old.",
      "designRationale": "Go 使用 C 风格的格式化字符串，强调显式和类型安全",
      "pros": ["类型安全", "性能好"],
      "cons": ["语法较冗长", "需要记忆格式化占位符"]
    }
  ]
}
```

### 添加新语言的完整流程

1. **收集语言信息**:
   - 官方网站和文档
   - 当前稳定版本
   - 核心特性和设计理念

2. **添加到 languages.json**:

```json
{
  "id": "elixir",
  "name": "Elixir",
  "version": "1.15",
  "paradigms": ["函数式", "并发"],
  "typeSystem": "dynamic",
  "description": "基于 Erlang VM 的函数式编程语言，专注于可扩展性和容错性",
  "features": [
    "不可变数据",
    "模式匹配",
    "Actor 并发模型",
    "管道操作符",
    "宏系统"
  ],
  "officialDocs": "https://elixir-lang.org/docs.html"
}
```

3. **为现有习语添加实现**:
   - 选择 5-10 个适合的习语
   - 为每个习语添加 Elixir 实现

## 最佳实践

### 编写习语

1. **选择有价值的习语**:
   - 常见的编程任务
   - 能展示语言特性差异
   - 有教育意义

2. **提供多样化的实现**:
   - 至少 3 种不同类型的语言（静态/动态、编译/解释）
   - 展示不同的编程范式

3. **编写清晰的说明**:
   - 解释代码的工作原理
   - 说明设计理念和权衡
   - 提供参考文档链接

### 编写代码示例

1. **保持简洁**:
   - 专注于核心概念
   - 避免不必要的复杂性
   - 5-20 行代码最合适

2. **确保可运行**:
   - 包含必要的导入
   - 使用完整的语法
   - 提供预期输出

3. **遵循最佳实践**:
   - 使用该语言的惯用写法
   - 遵循命名规范
   - 添加适当的注释

### 维护数据质量

1. **定期审查**:
   - 检查过时的版本信息
   - 更新失效的链接
   - 改进不清晰的说明

2. **保持一致性**:
   - 使用统一的术语
   - 保持相似的代码风格
   - 统一的描述格式

3. **测试验证**:
   - 验证 JSON 格式
   - 检查所有链接
   - 确保代码可运行

## 工具和脚本

### JSON 验证

使用在线工具验证 JSON 格式：
- [JSONLint](https://jsonlint.com/)
- [JSON Formatter](https://jsonformatter.org/)

### 本地验证

```bash
# 从 tech-cards-handbook 主数据同步并验证生成后的 JSON
npm run sync:tech-cards

# 运行完整验证
npm run validate
```

### 格式化

```bash
# 格式化所有文件
npm run format

# 只格式化数据文件（通常由 sync:tech-cards 生成后再检查）
npx prettier --check "src/data/*.json"
```

## 常见问题

### Q: 代码中的换行符应该如何处理？

A: 使用 `\n` 表示换行。例如：
```json
"code": "const x = 1;\nconst y = 2;\nconsole.log(x + y);"
```

### Q: 如何处理代码中的引号？

A: 在 JSON 字符串中，使用 `\"` 转义双引号，或使用单引号（如果语言支持）：
```json
"code": "const message = \"Hello, world!\";"
```
或
```json
"code": "const message = 'Hello, world!';"
```

### Q: 是否需要为每个习语提供所有语言的实现？

A: 不需要。每个习语至少需要 2 种语言的实现。可以逐步添加更多语言。

### Q: 如何决定习语的难度级别？

A: 
- **beginner**: 基础语法和常见操作
- **intermediate**: 需要理解语言特性和设计模式
- **advanced**: 涉及复杂概念、性能优化或高级特性

### Q: 可以添加伪代码吗？

A: 不建议。所有代码应该是特定语言的真实代码，可以实际运行。

## 贡献

如果你发现数据格式文档有任何问题或需要改进，请：

1. 提交 Issue 说明问题
2. 提交 PR 改进文档
3. 在讨论区提出建议

---

感谢你阅读本文档！如有疑问，请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 或提交 Issue。
