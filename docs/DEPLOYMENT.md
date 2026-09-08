# ByteBite 部署指南

本文档介绍如何部署 ByteBite 应用到生产环境。

## 目录

- [前置要求](#前置要求)
- [构建配置](#构建配置)
- [部署到 Vercel](#部署到-vercel)
- [部署到 Netlify](#部署到-netlify)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [环境变量](#环境变量)
- [生产构建测试](#生产构建测试)

## 前置要求

- Node.js 20.x 或更高版本
- npm（项目脚本以 `package-lock.json` 和 `npm run ...` 为准）
- Git 版本控制
- Vercel 或 Netlify 账户（用于部署）

## 数据同步边界

ByteBite 的习语数据不是直接在 `src/data/idioms.json` 中手写维护的；部署前应先从 `books/tech-cards-handbook/data/features/*.yaml` 同步生成本地数据：

```bash
npm run sync:tech-cards
```

`npm run build`、`npm run build:preview`、`npm run build:production` 和 `npm run validate` 都会通过构建链路执行这一步。若刚修改过 tech-cards 主数据，建议先单独运行一次 `npm run sync:tech-cards`，确认输出的习语数量符合预期，再进入部署检查。

## 构建配置

### 本地构建

```bash
# 开发构建
npm run build

# 预览环境构建
npm run build:preview

# 生产环境构建
npm run build:production
```

### 构建输出

构建后的文件将输出到 `dist/` 目录：

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   ├── react-vendor-[hash].js
│   ├── prism-vendor-[hash].js
│   └── vendor-[hash].js
└── data/
    ├── idioms.json
    └── languages.json
```

## 部署到 Vercel

### 方式一：通过 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署到预览环境：
```bash
vercel
```

4. 部署到生产环境：
```bash
vercel --prod
```

### 方式二：通过 Git 集成

1. 在 [Vercel Dashboard](https://vercel.com/dashboard) 导入项目
2. 选择 GitHub 仓库
3. Vercel 会自动检测 Vite 项目并使用 `vercel.json` 配置
4. 点击 "Deploy" 开始部署

### Vercel 环境变量设置

在 Vercel Dashboard 的项目设置中添加环境变量：

- `VITE_ENV`: `production`
- 其他自定义环境变量（参考 `.env.example`）

## 部署到 Netlify

### 方式一：通过 Netlify CLI

1. 安装 Netlify CLI：
```bash
npm install -g netlify-cli
```

2. 登录 Netlify：
```bash
netlify login
```

3. 初始化站点：
```bash
netlify init
```

4. 部署：
```bash
netlify deploy --prod
```

### 方式二：通过 Git 集成

1. 在 [Netlify Dashboard](https://app.netlify.com/) 点击 "Add new site"
2. 选择 "Import an existing project"
3. 连接 GitHub 仓库
4. Netlify 会自动使用 `netlify.toml` 配置
5. 点击 "Deploy site"

### Netlify 环境变量设置

在 Netlify Dashboard 的 Site settings > Environment variables 中添加：

- `VITE_ENV`: `production`
- 其他自定义环境变量

## GitHub Actions CI/CD

项目包含两个 GitHub Actions 工作流：

### CI 工作流 (`.github/workflows/ci.yml`)

在每次推送和 PR 时自动运行：

- 代码检查（ESLint）
- 格式检查（Prettier）
- 运行测试
- 构建项目
- 上传构建产物

### 部署工作流 (`.github/workflows/deploy.yml`)

在推送到 `main` 分支时自动部署到生产环境。

#### 配置 GitHub Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加：

**Vercel 部署所需：**
- `VERCEL_TOKEN`: Vercel API Token
- `VERCEL_ORG_ID`: Vercel 组织 ID
- `VERCEL_PROJECT_ID`: Vercel 项目 ID

获取这些值：
1. 访问 [Vercel Tokens](https://vercel.com/account/tokens)
2. 创建新 Token
3. 在项目设置中找到 Org ID 和 Project ID

## 环境变量

### 创建环境变量文件

```bash
# 复制示例文件
cp .env.example .env.local
```

### 可用的环境变量

参考 `.env.example` 文件中的说明。

### 环境变量优先级

1. `.env.production` - 生产环境
2. `.env.local` - 本地开发（不提交到 Git）
3. `.env` - 默认值

## 生产构建测试

### 1. 验证构建

```bash
# 运行完整验证（lint + format + test + sync + build）
npm run validate
```

### 2. 本地预览生产构建

```bash
# 构建项目
npm run build

# 启动预览服务器
npm run preview
```

访问 `http://localhost:4173` 查看生产构建。

### 3. 检查构建产物

```bash
# 查看构建文件大小
ls -lh dist/assets/

# 分析包大小（可选）
npx vite-bundle-visualizer
```

### 4. 性能测试

使用 Lighthouse 测试生产构建：

```bash
# 安装 Lighthouse CLI
npm install -g lighthouse

# 运行 Lighthouse
lighthouse http://localhost:4173 --view
```

目标指标：
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## 部署检查清单

在部署到生产环境前，确保：

- [ ] 习语主数据已同步（`npm run sync:tech-cards`，或由 `npm run validate` / `npm run build:production` 间接执行）
- [ ] 所有测试通过
- [ ] 代码已通过 lint 检查
- [ ] 代码格式符合规范
- [ ] 生产构建成功
- [ ] 本地预览正常工作
- [ ] 环境变量已正确配置
- [ ] 数据文件完整且有效
- [ ] 性能指标达标
- [ ] 可访问性测试通过
- [ ] 移动端响应式正常

## 回滚策略

### Vercel 回滚

1. 访问 Vercel Dashboard
2. 选择项目
3. 在 Deployments 页面找到之前的部署
4. 点击 "Promote to Production"

### Netlify 回滚

1. 访问 Netlify Dashboard
2. 选择站点
3. 在 Deploys 页面找到之前的部署
4. 点击 "Publish deploy"

## 监控和日志

### Vercel

- 访问 Vercel Dashboard > 项目 > Analytics 查看性能数据
- 查看 Functions 日志（如果使用 Serverless Functions）

### Netlify

- 访问 Netlify Dashboard > 站点 > Analytics 查看流量数据
- 查看 Deploy logs 了解构建详情

## 故障排查

### 构建失败

1. 检查 Node.js 版本是否匹配
2. 清除缓存：`rm -rf node_modules dist && npm install`
3. 检查环境变量是否正确设置
4. 查看构建日志中的错误信息

### 部署后页面空白

1. 检查浏览器控制台错误
2. 确认路由配置正确（SPA 重定向）
3. 检查静态资源路径
4. 验证 base URL 配置

### 性能问题

1. 检查包大小是否过大
2. 确认代码分割正常工作
3. 验证缓存策略
4. 使用 CDN 加速静态资源

## 更多资源

- [Vite 部署文档](https://vitejs.dev/guide/static-deploy.html)
- [Vercel 文档](https://vercel.com/docs)
- [Netlify 文档](https://docs.netlify.com/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
