> 历史快照：2026-09-20 归档。以下内容保留原记录，包含已过时的 Vercel 集成和验证声明，不是执行指令。当前流程见[部署指南](../DEPLOYMENT.md)。

# ByteBite 部署配置总结

## ✅ 已完成的配置

### 1. 构建配置

- ✅ Vite 生产构建优化
  - 代码分割（React、Prism、Vendor）
  - 现代浏览器目标
  - 可选的 Source Maps
  - Chunk 大小优化

- ✅ 环境变量配置
  - `.env.example` - 环境变量模板
  - `.env.development` - 开发环境配置
  - `.env.production` - 生产环境配置

### 2. 部署平台配置

- ✅ **Vercel** (`vercel.json`)
  - 自动构建配置
  - SPA 路由重写
  - 静态资源缓存策略
  - 安全响应头

- ✅ **Netlify** (`netlify.toml`)
  - 构建命令和输出目录
  - Node.js 版本指定
  - SPA 重定向规则
  - 静态资源缓存
  - 安全响应头

### 3. CI/CD 配置

- ✅ **GitHub Actions CI** (`.github/workflows/ci.yml`)
  - 自动代码检查（ESLint）
  - 自动格式检查（Prettier）
  - 自动运行测试
  - 自动构建验证
  - PR 预览构建
  - 构建产物上传

- ✅ **GitHub Actions Deploy** (`.github/workflows/deploy.yml`)
  - 自动部署到生产环境
  - 推送到 main 分支触发
  - 手动触发支持
  - Vercel 集成
  - 部署状态通知

### 4. 测试和验证脚本

- ✅ **syncTechCards.mjs** - tech-cards 主数据同步
  - 从 `books/tech-cards-handbook/data/features/*.yaml` 同步习语内容
  - 生成或更新 `src/data/idioms.json`
  - 保留尚未迁移到 handbook 的旧 ByteBite 数据

- ✅ **verify-build.sh** - 构建验证
  - 检查构建产物完整性
  - 显示文件大小统计
  - 验证数据文件存在

- ✅ **pre-deploy-check.sh** - 部署前检查
  - Node.js 版本检查
  - 代码质量检查
  - 测试执行
  - 构建验证
  - 数据文件检查
  - 环境配置检查

- ✅ **e2e-test.sh** - 端到端测试
  - 页面加载测试
  - 内容验证
  - 静态资源检查
  - SPA 路由测试
  - 性能测试
  - 安全头检查

- ✅ **test-all.sh** - 完整测试套件
  - 运行所有测试类型
  - 自动启动/停止预览服务器
  - 综合测试报告

### 5. NPM 脚本

```json
{
  "dev": "启动开发服务器",
  "sync:tech-cards": "从 tech-cards 主数据同步习语数据",
  "build": "标准构建",
  "build:preview": "预览环境构建",
  "build:production": "生产环境构建",
  "preview": "预览生产构建",
  "lint": "代码检查",
  "lint:fix": "自动修复代码问题",
  "format": "格式化代码",
  "format:check": "检查代码格式",
  "test": "运行测试（监听模式）",
  "test:run": "运行测试（单次）",
  "test:coverage": "测试覆盖率",
  "test:e2e": "端到端测试",
  "test:all": "运行所有测试",
  "validate": "完整验证（lint + format + test + build，build 前同步数据）",
  "verify-build": "验证构建",
  "pre-deploy": "部署前检查"
}
```

### 6. 文档

- ✅ **DEPLOYMENT.md** - 完整部署指南
  - 前置要求
  - 构建配置
  - 平台部署步骤
  - CI/CD 配置
  - 环境变量
  - 故障排查

- ✅ **DEPLOYMENT_CHECKLIST.md** - 部署检查清单
  - 代码质量检查
  - 测试检查
  - 构建检查
  - 配置检查
  - 性能检查
  - 安全检查
  - 部署后验证

- ✅ **QUICK_DEPLOY.md** - 快速部署指南
  - 常用命令
  - 快速部署流程
  - tech-cards 数据同步提醒
  - 故障排查
  - 回滚步骤

- ✅ **scripts/README.md** - 脚本文档
  - 脚本使用说明
  - 参数说明
  - 示例用法

## 📦 构建产物

生产构建后的文件结构：

```
dist/
├── index.html                          # 主 HTML 文件
├── assets/
│   ├── index-[hash].js                 # 主应用代码
│   ├── index-[hash].css                # 主样式文件
│   ├── react-vendor-[hash].js          # React 库
│   ├── prism-vendor-[hash].js          # 代码高亮库
│   ├── vendor-[hash].js                # 其他第三方库
│   ├── idioms-[hash].json              # 习语数据
│   └── languages-[hash].json           # 语言数据
└── [其他页面组件的懒加载文件]
```

## 🚀 部署流程

### 自动部署（推荐）

1. 提交代码到 main 分支
2. GitHub Actions 自动运行 CI/CD
3. 自动部署到生产环境

### 手动部署

```bash
# 0. 如果刚改过 tech-cards 主数据，先确认同步数量
npm run sync:tech-cards

# 1. 运行完整检查（含 lint、format、test、build 和数据同步）
npm run pre-deploy

# 2. 构建生产版本
npm run build:production

# 3. 验证构建
npm run verify-build

# 4. 部署
vercel --prod  # 或 netlify deploy --prod
```

## 🔧 配置要求

### GitHub Secrets

需要在 GitHub 仓库设置中配置以下 Secrets：

- `VERCEL_TOKEN` - Vercel API Token
- `VERCEL_ORG_ID` - Vercel 组织 ID
- `VERCEL_PROJECT_ID` - Vercel 项目 ID

### 环境变量

在部署平台配置以下环境变量：

- `VITE_ENV=production`
- 其他自定义变量（参考 `.env.example`）

## 📊 性能指标

当前构建性能：

- **总大小**: ~1.8MB（包含 source maps）
- **Gzip 后**: ~350KB
- **最大文件**: react-vendor (~226KB)
- **构建时间**: ~220ms

目标性能指标：

- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## 🔒 安全配置

已配置的安全响应头：

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📝 维护建议

### 定期任务

- [ ] 每月更新依赖包
- [ ] 每季度审查安全漏洞
- [ ] 每季度检查性能指标
- [ ] 每半年审查部署流程

### 监控

建议添加以下监控：

- 错误追踪（Sentry）
- 性能监控（Web Vitals）
- 用户分析（Google Analytics）
- 正常运行时间监控（UptimeRobot）

## 🆘 故障排查

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 如果刚改过习语内容，先运行 `npm run sync:tech-cards` 确认同步数量
   - 清理 node_modules 和 dist
   - 重新安装依赖

2. **部署后页面空白**
   - 检查浏览器控制台错误
   - 验证路由配置
   - 检查静态资源路径

3. **环境变量未生效**
   - 确认变量名以 VITE_ 开头
   - 重新构建项目
   - 检查平台环境变量配置

## 📚 相关文档

- [完整部署指南](../DEPLOYMENT.md)
- [部署检查清单](../DEPLOYMENT_CHECKLIST.md)
- [快速部署指南](../QUICK_DEPLOY.md)
- [脚本文档](../../scripts/README.md)
- [主 README](../../README.md)

## ✨ 下一步

部署配置已完成！现在可以：

1. 配置 GitHub Secrets
2. 推送代码到 main 分支
3. 观察自动部署流程
4. 验证生产环境

祝部署顺利！🚀
