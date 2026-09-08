# 贡献指南

感谢你考虑为 ByteBite 做贡献！我们欢迎所有形式的贡献，无论是新功能、Bug 修复、文档改进还是新的编程习语。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [添加新的编程习语](#添加新的编程习语)
- [添加新的编程语言](#添加新的编程语言)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)

## 行为准则

参与本项目即表示你同意遵守我们的行为准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请通过 [GitHub Issues](https://github.com/yourusername/bytebite/issues) 报告：

1. 使用清晰的标题描述问题
2. 提供详细的复现步骤
3. 说明预期行为和实际行为
4. 提供截图（如果适用）
5. 说明你的环境（浏览器、操作系统等）

### 提出新功能

我们欢迎新功能建议！请：

1. 先检查是否已有类似的建议
2. 清楚地描述功能和使用场景
3. 解释为什么这个功能对用户有价值
4. 如果可能，提供设计草图或示例

### 改进文档

文档改进同样重要：

- 修正拼写或语法错误
- 改进说明的清晰度
- 添加缺失的文档
- 更新过时的信息

## 添加新的编程习语

这是最常见的贡献类型！按照以下步骤添加新习语：

### 1. 选择习语

选择一个有教育价值的编程习语，例如：

- 常见的数据结构操作（排序、过滤、映射）
- 设计模式（单例、工厂、观察者）
- 并发和异步编程模式
- 错误处理策略
- 文件和 I/O 操作
- 网络请求处理

### 2. 编辑主数据文件

ByteBite 的习语数据由 `npm run sync:tech-cards` 从 `../books/tech-cards-handbook/data/features/*.yaml` 同步生成到 `src/data/idioms.json`。新增或修改跨语言习语时，优先编辑 tech-cards-handbook 的 YAML 主数据；不要直接手改生成后的 `src/data/idioms.json`，否则下一次构建会覆盖你的改动。

主数据仍应能同步成下面这样的习语对象：

```json
{
  "id": "unique-idiom-id",
  "title": "习语标题",
  "description": "简短的描述，说明这个习语是做什么的",
  "category": "分类名称",
  "difficulty": "beginner|intermediate|advanced",
  "paradigms": ["面向对象", "函数式"],
  "tags": ["标签1", "标签2", "标签3"],
  "implementations": [
    {
      "languageId": "javascript",
      "code": "// 你的代码示例\nconst example = 'hello';",
      "explanation": "解释这段代码的工作原理",
      "output": "预期的输出结果（可选）",
      "designRationale": "解释为什么这种语言选择这种实现方式",
      "pros": ["优点1", "优点2"],
      "cons": ["缺点1", "缺点2"],
      "references": [
        {
          "title": "参考文档标题",
          "url": "https://example.com/docs"
        }
      ]
    }
  ]
}
```

### 3. 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识符，使用 kebab-case |
| `title` | string | ✅ | 习语的中文标题 |
| `description` | string | ✅ | 简短描述（1-2句话） |
| `category` | string | ✅ | 分类（如：数据处理、错误处理、并发） |
| `difficulty` | string | ✅ | 难度：beginner、intermediate 或 advanced |
| `paradigms` | string[] | ✅ | 相关的编程范式 |
| `tags` | string[] | ✅ | 相关标签，便于搜索 |
| `implementations` | array | ✅ | 至少包含 2 种语言的实现 |

### 4. 实现字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `languageId` | string | ✅ | 语言 ID（必须在 languages.json 中存在） |
| `code` | string | ✅ | 代码示例，使用 `\n` 换行 |
| `explanation` | string | ✅ | 代码说明 |
| `output` | string | ❌ | 代码输出示例 |
| `designRationale` | string | ❌ | 设计理念说明 |
| `pros` | string[] | ❌ | 这种实现的优点 |
| `cons` | string[] | ❌ | 这种实现的缺点 |
| `references` | array | ❌ | 参考文档链接 |

### 5. 代码示例最佳实践

- **简洁性**: 代码应该简短且专注于核心概念
- **可读性**: 使用清晰的变量名和适当的注释
- **完整性**: 代码应该是可运行的（包含必要的导入）
- **实用性**: 展示真实世界的用例
- **多样性**: 尽量为每个习语提供 3-5 种语言的实现

### 6. 示例

下面示例展示同步后的 JSON 形状；实际贡献时请把等价内容写入 `../books/tech-cards-handbook/data/features/*.yaml`，再运行 `npm run sync:tech-cards` 生成 ByteBite 数据。

```json
{
  "id": "array-filter",
  "title": "数组过滤",
  "description": "从数组中筛选出满足条件的元素",
  "category": "数据处理",
  "difficulty": "beginner",
  "paradigms": ["函数式"],
  "tags": ["数组", "过滤", "高阶函数"],
  "implementations": [
    {
      "languageId": "javascript",
      "code": "const numbers = [1, 2, 3, 4, 5];\nconst evens = numbers.filter(n => n % 2 === 0);\nconsole.log(evens);",
      "explanation": "使用 filter 方法筛选偶数",
      "output": "[2, 4]",
      "designRationale": "JavaScript 的 filter 方法返回新数组，保持不可变性",
      "pros": ["简洁", "函数式", "链式调用"],
      "references": [
        {
          "title": "Array.prototype.filter()",
          "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter"
        }
      ]
    },
    {
      "languageId": "python",
      "code": "numbers = [1, 2, 3, 4, 5]\nevens = [n for n in numbers if n % 2 == 0]\nprint(evens)",
      "explanation": "使用列表推导式筛选偶数",
      "output": "[2, 4]",
      "designRationale": "Python 的列表推导式是最 Pythonic 的方式",
      "pros": ["可读性强", "性能好"]
    }
  ]
}
```

## 添加新的编程语言

要添加新的编程语言支持：

### 1. 编辑语言数据

编辑 `src/data/languages.json`，添加新语言：

```json
{
  "id": "language-id",
  "name": "语言名称",
  "version": "版本号",
  "paradigms": ["面向对象", "函数式"],
  "typeSystem": "static|dynamic|gradual",
  "description": "语言的简短描述",
  "features": ["特性1", "特性2", "特性3"],
  "officialDocs": "https://官方文档链接"
}
```

### 2. 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识符，使用小写 |
| `name` | string | ✅ | 语言的正式名称 |
| `version` | string | ✅ | 当前主流版本 |
| `paradigms` | string[] | ✅ | 支持的编程范式 |
| `typeSystem` | string | ✅ | 类型系统：static、dynamic 或 gradual |
| `description` | string | ✅ | 语言描述（1-2句话） |
| `features` | string[] | ✅ | 核心特性列表（3-5个） |
| `officialDocs` | string | ✅ | 官方文档链接 |

### 3. 添加语法高亮支持

如果 Prism.js 不支持该语言，需要：

1. 检查 [Prism.js 支持的语言列表](https://prismjs.com/#supported-languages)
2. 如果支持，在 `src/components/CodeComparison.tsx` 中导入语言定义
3. 如果不支持，考虑使用相似语言的高亮或贡献到 Prism.js

### 4. 为现有习语添加实现

添加新语言后，应该为至少 5-10 个现有习语添加该语言的实现。

## 代码规范

### TypeScript/React

- 使用函数组件和 Hooks
- 使用 TypeScript 类型注解
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

```typescript
// ✅ 好的示例
interface Props {
  title: string;
  onSelect: (id: string) => void;
}

export const MyComponent: React.FC<Props> = ({ title, onSelect }) => {
  return <div>{title}</div>;
};

// ❌ 避免
export const MyComponent = (props: any) => {
  return <div>{props.title}</div>;
};
```

### 样式

- 使用 Tailwind CSS 工具类
- 避免内联样式
- 保持响应式设计

```tsx
// ✅ 好的示例
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6">
  <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
    点击
  </button>
</div>

// ❌ 避免
<div style={{ display: 'flex', padding: '16px' }}>
  <button style={{ background: 'blue' }}>点击</button>
</div>
```

### 命名规范

- 组件：PascalCase（`MyComponent.tsx`）
- 函数/变量：camelCase（`getUserData`）
- 常量：UPPER_SNAKE_CASE（`MAX_ITEMS`）
- 类型/接口：PascalCase（`UserData`）
- 文件名：kebab-case 或 PascalCase

## 提交规范

使用语义化的提交信息：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例

```
feat(idioms): 添加数组排序习语

添加了数组排序习语，包含 JavaScript、Python、Go 和 Rust 的实现。

Closes #123
```

```
fix(search): 修复搜索结果不更新的问题

当用户快速输入时，搜索结果没有正确更新。
现在使用防抖处理搜索输入。

Fixes #456
```

## Pull Request 流程

### 1. Fork 和克隆

```bash
# Fork 仓库（在 GitHub 上点击 Fork 按钮）

# 克隆你的 fork
git clone https://github.com/your-username/bytebite.git
cd bytebite

# 添加上游仓库
git remote add upstream https://github.com/original-owner/bytebite.git
```

### 2. 创建分支

```bash
# 更新主分支
git checkout main
git pull upstream main

# 创建特性分支
git checkout -b feature/your-feature-name
```

### 3. 开发和测试

```bash
# 安装依赖
npm install

# 开发
npm run dev

# 同步 tech-cards-handbook 主数据到 ByteBite JSON（改动习语时运行）
npm run sync:tech-cards

# 运行测试
npm run test:run

# 检查代码质量
npm run lint
npm run format:check

# 完整验证
npm run validate
```

### 4. 提交更改

```bash
# 添加更改
git add .

# 提交（使用语义化提交信息）
git commit -m "feat(idioms): 添加新的习语"

# 推送到你的 fork
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

1. 访问你的 fork 在 GitHub 上的页面
2. 点击 "New Pull Request"
3. 填写 PR 描述：
   - 清楚地描述你的更改
   - 引用相关的 Issue（如果有）
   - 添加截图（如果是 UI 更改）
   - 说明测试情况

### 6. PR 模板

```markdown
## 描述
简要描述这个 PR 的目的和内容

## 更改类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 相关 Issue
Closes #123

## 测试
- [ ] 已添加/更新单元测试
- [ ] 所有测试通过
- [ ] 已在浏览器中手动测试

## 截图（如果适用）
[添加截图]

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已运行 `npm run validate`
- [ ] 已更新相关文档
- [ ] 提交信息清晰且符合规范
```

### 7. 代码审查

- 响应审查意见
- 进行必要的修改
- 保持讨论专业和友好

### 8. 合并后

```bash
# 更新你的主分支
git checkout main
git pull upstream main

# 删除特性分支
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## 开发环境设置

### 推荐的 IDE 设置

**VS Code 扩展**:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

**VS Code 设置** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 常见问题

### Q: 我应该添加什么样的习语？

A: 选择有教育价值、常用且能展示语言特性差异的习语。避免过于简单或过于复杂的示例。

### Q: 代码示例应该多长？

A: 通常 5-20 行代码最合适。太短可能不够说明问题，太长会影响可读性。

### Q: 我不熟悉某种语言，可以只添加部分实现吗？

A: 可以！你可以先添加你熟悉的语言实现，其他人可以补充其他语言。

### Q: 如何测试我的更改？

A: 如果改动了习语主数据，先运行 `npm run sync:tech-cards` 确认能生成 `src/data/idioms.json`；再运行 `npm run dev` 启动开发服务器，在浏览器中测试。提交前确保运行 `npm run validate` 通过所有检查。

### Q: PR 多久会被审查？

A: 我们尽量在 1-3 个工作日内审查 PR。复杂的 PR 可能需要更长时间。

## 获取帮助

如果你有任何问题：

- 查看 [GitHub Issues](https://github.com/yourusername/bytebite/issues)
- 查看现有的 PR 了解流程
- 在 Issue 中提问

## 致谢

感谢所有贡献者！你们的贡献让 ByteBite 变得更好。

---

再次感谢你的贡献！🎉
