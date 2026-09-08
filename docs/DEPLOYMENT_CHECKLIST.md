# ByteBite 部署检查清单

在部署到生产环境之前，请确保完成以下所有检查项。

## 📋 部署前检查

### 代码质量

- [ ] 所有代码已提交到 Git
- [ ] 代码通过 ESLint 检查 (`npm run lint`)
- [ ] 代码格式符合 Prettier 规范 (`npm run format:check`)
- [ ] 没有 TypeScript 编译错误 (`tsc -b`)
- [ ] 所有 TODO 和 FIXME 已处理或记录

### 测试

- [ ] 所有单元测试通过 (`npm run test:run`)
- [ ] 测试覆盖率达到预期
- [ ] 关键功能已手动测试
- [ ] 移动端响应式已测试
- [ ] 跨浏览器兼容性已验证（Chrome, Firefox, Safari, Edge）

### 构建

- [ ] 生产构建成功 (`npm run build:production`)
- [ ] 构建产物已验证 (`npm run verify-build`)
- [ ] 构建大小在合理范围内（< 2MB）
- [ ] 代码分割正常工作
- [ ] Source maps 配置正确

### 数据和内容

- [ ] 已从 tech-cards 主数据同步生成本地数据（`npm run sync:tech-cards`，或由 `npm run validate` / `npm run build:production` 间接执行）
- [ ] 所有数据文件完整且有效
- [ ] `src/data/idioms.json` 包含所有必需字段
- [ ] `src/data/languages.json` 包含所有必需字段
- [ ] 代码示例已验证正确性
- [ ] 没有占位符或测试数据

### 配置

- [ ] 环境变量已正确配置
- [ ] .env.production 文件已更新
- [ ] API 端点配置正确（如果适用）
- [ ] 分析工具配置正确（如果适用）
- [ ] 错误追踪配置正确（如果适用）

### 性能

- [ ] Lighthouse 性能分数 > 90
- [ ] 首次内容绘制 (FCP) < 1.5s
- [ ] 最大内容绘制 (LCP) < 2.5s
- [ ] 累积布局偏移 (CLS) < 0.1
- [ ] 首次输入延迟 (FID) < 100ms
- [ ] 图片已优化
- [ ] 字体已优化

### 可访问性

- [ ] Lighthouse 可访问性分数 > 95
- [ ] 键盘导航正常工作
- [ ] 屏幕阅读器兼容性已测试
- [ ] 颜色对比度符合 WCAG 2.1 AA 标准
- [ ] 所有图片有 alt 文本
- [ ] 表单元素有正确的标签

### SEO

- [ ] 页面标题和描述已优化
- [ ] Meta 标签已配置
- [ ] Open Graph 标签已配置（社交媒体分享）
- [ ] robots.txt 已配置
- [ ] sitemap.xml 已生成（如果适用）

### 安全

- [ ] 依赖包已更新到最新稳定版本
- [ ] 没有已知的安全漏洞 (`npm audit`)
- [ ] 敏感信息未暴露在代码中
- [ ] HTTPS 已启用
- [ ] 安全响应头已配置

### 部署平台

#### Vercel

- [ ] Vercel 项目已创建
- [ ] 环境变量已在 Vercel Dashboard 配置
- [ ] 自定义域名已配置（如果适用）
- [ ] GitHub 集成已启用
- [ ] 部署钩子已配置（如果需要）

#### Netlify

- [ ] Netlify 站点已创建
- [ ] 环境变量已在 Netlify Dashboard 配置
- [ ] 自定义域名已配置（如果适用）
- [ ] GitHub 集成已启用
- [ ] 构建钩子已配置（如果需要）

### CI/CD

- [ ] GitHub Actions 工作流已测试
- [ ] GitHub Secrets 已配置
  - [ ] VERCEL_TOKEN
  - [ ] VERCEL_ORG_ID
  - [ ] VERCEL_PROJECT_ID
- [ ] CI 工作流在 PR 上正常运行
- [ ] 部署工作流在 main 分支上正常运行

### 监控和分析

- [ ] 错误监控已设置（Sentry 等）
- [ ] 性能监控已设置
- [ ] 用户分析已设置（Google Analytics 等）
- [ ] 日志记录已配置

### 文档

- [ ] README.md 已更新
- [ ] DEPLOYMENT.md 已更新
- [ ] API 文档已更新（如果适用）
- [ ] 变更日志已更新
- [ ] 贡献指南已更新（如果适用）

## 🚀 部署步骤

### 自动部署（推荐）

1. 确保所有检查项已完成
2. 运行预部署检查（会覆盖 lint、format、test、build、构建产物和数据文件存在性检查）：
   ```bash
   npm run pre-deploy
   ```
3. 提交并推送到 main 分支：
   ```bash
   git add .
   git commit -m "chore: prepare for deployment"
   git push origin main
   ```
4. GitHub Actions 将自动运行 CI/CD 流程
5. 监控部署进度
6. 验证部署成功

### 手动部署

#### Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署到生产环境
vercel --prod
```

#### Netlify

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署到生产环境
netlify deploy --prod
```

## ✅ 部署后验证

- [ ] 网站可以正常访问
- [ ] 所有页面正常加载
- [ ] 搜索功能正常工作
- [ ] 搜索能匹配标题、描述、标签、分类、语言名称/ID、代码或实现说明
- [ ] 筛选功能正常工作（筛选组之间 AND、组内 OR，移动端筛选面板首次打开后选项可见）
- [ ] 代码对比视图正常显示
- [ ] 收藏功能正常工作
- [ ] 移动端显示正常
- [ ] 没有控制台错误
- [ ] 性能指标符合预期
- [ ] 分析工具正常收集数据

## 🔄 回滚计划

如果部署后发现问题：

### Vercel

1. 访问 Vercel Dashboard
2. 选择项目
3. 在 Deployments 页面找到上一个稳定版本
4. 点击 "Promote to Production"

### Netlify

1. 访问 Netlify Dashboard
2. 选择站点
3. 在 Deploys 页面找到上一个稳定版本
4. 点击 "Publish deploy"

### Git

```bash
# 回滚到上一个提交
git revert HEAD
git push origin main

# 或者回滚到特定提交
git revert <commit-hash>
git push origin main
```

## 📞 支持

如果在部署过程中遇到问题：

1. 查看部署日志
2. 检查 GitHub Actions 运行日志
3. 查看浏览器控制台错误
4. 参考 DEPLOYMENT.md 故障排查部分
5. 联系团队成员

## 📝 部署记录

记录每次部署的信息：

| 日期 | 版本 | 部署者 | 变更内容 | 状态 |
|------|------|--------|----------|------|
| YYYY-MM-DD | v1.0.0 | Name | Initial release | ✅ |

---

**注意**: 这个检查清单应该在每次部署前完整执行。不要跳过任何步骤！
