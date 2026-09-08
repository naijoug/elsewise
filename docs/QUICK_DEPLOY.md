# 快速部署指南

## 🚀 一键部署

```bash
# 运行完整的部署前检查、生产构建和构建产物验证
npm run pre-deploy && npm run build:production && npm run verify-build
```

`pre-deploy` 和 `build:production` 都会通过构建链路执行 `npm run sync:tech-cards`，从 `books/tech-cards-handbook/data/features/*.yaml` 同步生成 `src/data/idioms.json`。如果刚改过 tech-cards 主数据，先单独运行一次同步并确认输出的习语数量符合预期。

## 📦 常用命令

### 开发

```bash
npm run dev              # 启动开发服务器
npm run sync:tech-cards  # 从 tech-cards 主数据同步习语数据
npm run build            # 构建项目
npm run preview          # 预览生产构建
```

### 测试和验证

```bash
npm run test:run         # 运行测试
npm run lint             # 代码检查
npm run format:check     # 格式检查
npm run validate         # 完整验证（lint + format + test + build，build 前会同步数据）
```

### 部署

```bash
npm run build:production # 生产构建
npm run verify-build     # 验证构建
npm run pre-deploy       # 部署前检查
```

## 🔧 部署平台

### Vercel

```bash
# 首次部署
vercel

# 部署到生产环境
vercel --prod

# 查看部署状态
vercel ls
```

### Netlify

```bash
# 首次部署
netlify init

# 部署到生产环境
netlify deploy --prod

# 查看部署状态
netlify status
```

## 📋 部署流程

### 方式一：自动部署（推荐）

1. 提交代码到 main 分支
2. GitHub Actions 自动运行 CI/CD
3. 自动部署到生产环境

```bash
git add .
git commit -m "feat: your feature description"
git push origin main
```

### 方式二：手动部署

1. 运行部署前检查
```bash
npm run sync:tech-cards  # 可选：刚改过 tech-cards 主数据时先单独确认同步数量
npm run pre-deploy
```

2. 构建生产版本
```bash
npm run build:production
```

3. 验证构建
```bash
npm run verify-build
```

4. 部署到平台
```bash
# Vercel
vercel --prod

# 或 Netlify
netlify deploy --prod
```

## ⚡ 快速修复

### 构建失败

```bash
# 清理并重新安装
rm -rf node_modules dist
npm install
npm run sync:tech-cards
npm run build
```

### 测试失败

```bash
# 运行测试并查看详细输出
npm run test:run -- --reporter=verbose
```

### 格式问题

```bash
# 自动修复格式
npm run format
```

### Lint 错误

```bash
# 自动修复 lint 错误
npm run lint:fix
```

## 🔄 回滚

### Git 回滚

```bash
# 回滚到上一个提交
git revert HEAD
git push origin main
```

### 平台回滚

**Vercel**: Dashboard > Deployments > 选择之前的版本 > Promote to Production

**Netlify**: Dashboard > Deploys > 选择之前的版本 > Publish deploy

## 📊 监控

### 检查构建大小

```bash
npm run build
npm run verify-build
```

### 性能测试

```bash
npm run preview
# 在另一个终端运行
lighthouse http://localhost:4173 --view
```

## 🆘 故障排查

### 问题：构建成功但页面空白

**解决方案**:
1. 检查浏览器控制台错误
2. 确认路由配置正确
3. 验证 base URL 设置

### 问题：环境变量未生效

**解决方案**:
1. 确认变量名以 `VITE_` 开头
2. 重新构建项目
3. 检查部署平台的环境变量配置

### 问题：部署后样式丢失

**解决方案**:
1. 检查 CSS 文件是否正确生成
2. 验证静态资源路径
3. 清除浏览器缓存

## 📚 更多信息

- 完整部署指南: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 部署检查清单: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- 脚本文档: [scripts/README.md](../scripts/README.md)
