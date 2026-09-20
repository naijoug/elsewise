# 快速部署入口

当前自动发布目标为 GitHub Pages，完整步骤和已知子路径限制见[部署指南](DEPLOYMENT.md)。

默认根路径的本地生产验证与预览：

```bash
npm ci
npm run pre-deploy
npm run preview
```

`pre-deploy` 已包含一次生产构建与产物检查，无需再串联 build 或 verify-build。
若需要自动预览和 HTTP 冒烟检查，选择 `npm run test:all`。
Pages 项目子路径需按[Pages 指南](DEPLOYMENT.md#github-pages-自动发布)设置 GHP_BASE 并验收页面路由。

- [数据来源与同步回退](DATA_FORMAT.md#来源与同步边界)
- [发布检查清单](DEPLOYMENT_CHECKLIST.md)
- [Vercel 可选方案](DEPLOYMENT.md#vercel-可选方案)
- [Netlify 可选方案](DEPLOYMENT.md#netlify-可选方案)
