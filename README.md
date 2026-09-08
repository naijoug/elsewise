# ByteBite 🍔

> 编程语言对比学习平台 - 通过对比不同编程语言的实现方式来学习和理解编程概念

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)

## ✨ 功能特性

- 🔍 **智能搜索**: 按标题、描述、标签、分类、语言名称/ID、代码或实现说明关键词搜索编程习语，并在结果中展示命中原因
- 🎯 **灵活筛选**: 按范式、难度、分类和语言筛选内容，支持一键清除或移除单个条件
- 📊 **代码对比**: 并排展示多种语言的实现，支持2-4列动态布局
- 🎨 **语法高亮**: 使用 Prism.js 提供清晰的代码高亮
- 💾 **收藏功能**: 本地保存喜欢的习语，方便后续查看
- 📱 **响应式设计**: 完美支持桌面端和移动端
- 🌐 **12种语言**: 支持 JavaScript、TypeScript、Python、Go、Rust、Java、C#、Ruby、PHP、Swift、Kotlin、C++
- ⚡ **性能优化**: 代码分割、懒加载、虚拟化渲染
- ♿ **无障碍访问**: 符合 WCAG 2.1 AA 标准

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/bytebite.git
cd bytebite

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器（默认运行在 http://localhost:5173）
npm run dev

# 在新终端运行测试（监听模式）
npm run test

# 运行单次测试
npm run test:run

# 运行完整验证（lint + format + test + build）
npm run validate
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 完整验证（lint + format + test + build）
npm run validate
```

## 🔎 搜索与筛选说明

搜索框会在同一次查询中匹配：习语标题、描述、标签、分类、语言名称/ID、实现代码和实现说明。结果卡片会显示“匹配：标题 / 实现语言”等命中原因，帮助你判断为什么该习语被召回。

筛选面板支持分类、范式、难度和实现语言多选；多个筛选组之间是 AND 关系，同一筛选组内部是 OR 关系。结果摘要区会把当前搜索和筛选条件展示为 chip，可移除单个条件，也可以一键清除全部条件。移动端点击“显示筛选面板”后会直接展开筛选选项。

## 📁 项目结构

```
bytebite/
├── src/
│   ├── components/          # React 组件
│   │   ├── common/          # 通用组件（Button, Card, Badge 等）
│   │   ├── layout/          # 布局组件（Header, Footer, Layout）
│   │   ├── CodeComparison.tsx    # 代码对比视图
│   │   ├── LanguageSelector.tsx  # 语言选择器
│   │   ├── IdiomList.tsx         # 习语列表和空状态
│   │   ├── IdiomCard.tsx         # 习语卡片
│   │   ├── IdiomSearchControls.tsx # 搜索输入和移动端筛选入口
│   │   ├── SearchResultSummary.tsx # 结果数量与活跃条件 chip
│   │   ├── FilterPanel.tsx       # 筛选面板
│   │   └── SearchBar.tsx         # 可复用搜索栏
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx           # 首页
│   │   ├── IdiomDetailPage.tsx    # 习语详情页
│   │   ├── LanguagePage.tsx       # 语言详情页
│   │   ├── FavoritesPage.tsx      # 收藏页
│   │   └── NotFoundPage.tsx       # 404 页面
│   ├── contexts/            # React Context
│   │   └── AppContext.tsx         # 全局应用状态
│   ├── hooks/               # 自定义 Hooks
│   │   ├── usePreferences.ts      # 用户偏好管理
│   │   └── useDebounce.ts         # 防抖 Hook
│   ├── utils/               # 工具函数
│   │   ├── filters.ts             # 搜索和筛选逻辑
│   │   ├── dataLoader.ts          # 数据加载
│   │   ├── storage.ts             # Local Storage 管理
│   │   ├── performance.ts         # 性能优化工具
│   │   └── accessibility.ts       # 无障碍工具
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── data/                # 静态数据文件
│   │   ├── idioms.json            # 编程习语数据
│   │   └── languages.json         # 编程语言数据
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── scripts/                 # 构建和部署脚本
│   ├── e2e-test.sh               # 端到端测试
│   ├── pre-deploy-check.sh       # 部署前检查
│   ├── test-all.sh               # 完整测试套件
│   └── verify-build.sh           # 构建验证
├── .github/workflows/       # GitHub Actions CI/CD
├── docs/                    # 文档
│   ├── CONTRIBUTING.md           # 贡献指南
│   └── DATA_FORMAT.md            # 数据格式文档
├── public/                  # 静态资源
├── .eslintrc.cjs           # ESLint 配置
├── .prettierrc             # Prettier 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── vite.config.ts          # Vite 配置
├── vitest.config.ts        # Vitest 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目依赖

```

## 🛠️ 技术栈

### 核心技术

- **框架**: [React 19.2](https://reactjs.org/) with TypeScript
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **路由**: [React Router v7](https://reactrouter.com/)
- **代码高亮**: [Prism.js](https://prismjs.com/)

### 开发工具

- **代码质量**: ESLint + Prettier
- **测试**: Vitest + React Testing Library
- **类型检查**: TypeScript 5.9
- **状态管理**: React Context API
- **数据持久化**: Browser Local Storage

## 📝 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run build:preview` | 构建预览版本 |
| `npm run build:production` | 构建生产版本（带环境变量） |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run lint:fix` | 自动修复 ESLint 问题 |
| `npm run format` | 格式化代码 |
| `npm run format:check` | 检查代码格式 |
| `npm run test` | 运行测试（监听模式） |
| `npm run test:run` | 运行单次测试 |
| `npm run test:coverage` | 生成测试覆盖率报告 |
| `npm run test:e2e` | 运行端到端测试 |
| `npm run test:all` | 运行所有测试 |
| `npm run validate` | 完整验证（lint + format + test + build） |
| `npm run pre-deploy` | 部署前检查 |
| `npm run verify-build` | 验证构建产物 |

## 🚢 部署

### 快速部署

```bash
# 1. 运行部署前检查
npm run pre-deploy

# 2. 构建生产版本
npm run build:production

# 3. 验证构建
npm run verify-build

# 4. 本地预览
npm run preview
```

### 支持的平台

项目已配置好以下平台的部署：

- **Vercel**: 零配置部署，推荐用于生产环境
- **Netlify**: 使用 `netlify.toml` 配置
- **GitHub Pages**: 通过 GitHub Actions 自动部署

详细部署指南请参考：
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - 完整部署指南
- [QUICK_DEPLOY.md](./docs/QUICK_DEPLOY.md) - 快速部署指南
- [DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md) - 部署检查清单

### 环境变量

创建 `.env.local` 文件配置环境变量：

```bash
# 应用环境
VITE_ENV=development

# API 端点（如果需要）
# VITE_API_URL=https://api.example.com
```

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](./docs/CONTRIBUTING.md) 了解如何：

- 添加新的编程习语
- 添加新的编程语言
- 改进现有实现
- 报告 Bug
- 提出新功能建议

### 快速贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📚 文档

- [数据格式文档](./docs/DATA_FORMAT.md) - 了解如何添加新的习语和语言
- [贡献指南](./docs/CONTRIBUTING.md) - 如何为项目做贡献
- [部署指南](./docs/DEPLOYMENT.md) - 详细的部署说明
- [性能优化](./docs/PERFORMANCE_OPTIMIZATIONS.md) - 性能优化策略
- [无障碍访问](./docs/ACCESSIBILITY.md) - 无障碍功能说明

## 🧪 测试

项目使用 Vitest 和 React Testing Library 进行测试：

```bash
# 运行所有测试
npm run test:run

# 生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e

# 运行完整测试套件
npm run test:all
```

测试覆盖范围：
- ✅ 单元测试：工具函数、数据处理逻辑
- ✅ 组件测试：UI 组件交互和渲染
- ✅ 集成测试：完整用户流程
- ✅ 端到端测试：关键用户场景

## 📊 性能

- ⚡ 首次内容绘制 (FCP) < 1.5s
- ⚡ 最大内容绘制 (LCP) < 2.5s
- ⚡ 交互时间 (TTI) < 3.5s
- ⚡ 代码高亮渲染 < 200ms

性能优化策略详见 [PERFORMANCE_OPTIMIZATIONS.md](./docs/PERFORMANCE_OPTIMIZATIONS.md)

## ♿ 无障碍访问

ByteBite 致力于为所有用户提供良好的体验：

- ✅ 符合 WCAG 2.1 AA 标准
- ✅ 完整的键盘导航支持
- ✅ 屏幕阅读器友好
- ✅ 高对比度支持
- ✅ 语义化 HTML

详见 [ACCESSIBILITY.md](./docs/ACCESSIBILITY.md)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [React](https://reactjs.org/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Prism.js](https://prismjs.com/) - 代码高亮
- 所有贡献者和支持者

## 📊 项目统计

- 支持的编程语言: 12 种
- 编程习语数量: 20+ 个
- 代码示例: 60+ 个
- 测试覆盖率: 80%+

## 🗺️ 路线图

### 已完成 ✅
- [x] 核心功能实现（浏览、搜索、筛选、对比）
- [x] 12 种编程语言支持
- [x] 响应式设计和移动端优化
- [x] 收藏功能
- [x] 性能优化
- [x] 无障碍访问支持
- [x] 完整的测试套件

### 计划中 🚧
- [ ] 在线代码执行功能
- [ ] 用户账户系统
- [ ] 社区贡献功能
- [ ] 更多编程语言支持（Scala、Haskell、Clojure 等）
- [ ] AI 辅助代码解释
- [ ] 深色模式
- [ ] 多语言界面（英文、日文等）

## 📮 联系方式

- 项目主页: [https://github.com/yourusername/bytebite](https://github.com/yourusername/bytebite)
- 问题反馈: [GitHub Issues](https://github.com/yourusername/bytebite/issues)

## 💡 灵感来源

ByteBite 的灵感来自于：
- [Rosetta Code](http://rosettacode.org/) - 多语言编程任务解决方案
- [Learn X in Y minutes](https://learnxinyminutes.com/) - 快速学习编程语言
- [Programming Idioms](https://programming-idioms.org/) - 编程习语对比

---

用 ❤️ 和 ☕ 制作
