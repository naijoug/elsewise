# ByteBite 部署脚本

本目录包含用于构建、验证和部署 ByteBite 应用的脚本。习语内容以 `books/tech-cards-handbook/data/features/*.yaml` 为主数据，部署前通过 `npm run sync:tech-cards` 同步到 `src/data/idioms.json`；`npm run build`、`npm run build:production` 和 `npm run validate` 会在构建链路中自动执行同步。

## 可用脚本

### 1. verify-build.sh

验证生产构建是否完整和有效。

**用法：**
```bash
npm run verify-build
# 或
bash scripts/verify-build.sh
```

**检查项：**
- dist 目录是否存在
- index.html 是否存在
- assets 目录是否存在
- JavaScript 和 CSS 文件数量
- 数据文件是否存在
- 构建总大小
- 最大的文件列表

### 2. pre-deploy-check.sh

运行完整的部署前检查清单。

**用法：**
```bash
npm run pre-deploy
# 或
bash scripts/pre-deploy-check.sh
```

**检查项：**
1. Node.js 版本 (>= 20)
2. ESLint 代码检查
3. Prettier 格式检查
4. 单元测试
5. 生产构建（构建前会同步 tech-cards 主数据）
6. 构建输出验证
7. 本地数据文件存在性检查
8. 环境配置检查

**退出码：**
- `0`: 所有检查通过
- `1`: 至少一项检查失败

### 3. e2e-test.sh

执行端到端测试，验证部署的应用是否正常工作。

**用法：**
```bash
# 测试本地预览服务器（默认）
npm run test:e2e

# 测试自定义 URL
bash scripts/e2e-test.sh https://your-app.vercel.app

# 测试生产环境
bash scripts/e2e-test.sh https://bytebite.com
```

**测试项：**
1. 首页加载 (HTTP 200)
2. 页面包含应用标题
3. 页面包含根元素
4. JavaScript 模块加载
5. CSS 样式表加载
6. 静态资源可访问
7. SPA 路由正常工作
8. 404 处理正确
9. 响应时间 (< 2s)
10. 安全响应头配置

**退出码：**
- `0`: 所有测试通过
- `1`: 至少一项测试失败

**示例工作流：**
```bash
# 1. 构建项目
npm run build

# 2. 启动预览服务器
npm run preview &

# 3. 等待服务器启动
sleep 3

# 4. 运行 E2E 测试
npm run test:e2e

# 5. 停止预览服务器
pkill -f "vite preview"
```

## 部署工作流

### 本地部署前检查

```bash
# 1. 运行完整的预部署检查（含数据同步、lint、format、test、build）
npm run pre-deploy

# 2. 如果所有检查通过，构建生产版本
npm run build:production

# 3. 验证构建
npm run verify-build

# 4. 本地预览
npm run preview
```

### CI/CD 集成

这些脚本已集成到 GitHub Actions 工作流中：

- `.github/workflows/ci.yml` - 在每次推送和 PR 时运行检查
- `.github/workflows/deploy.yml` - 在推送到 main 分支时部署

## 故障排查

### 构建验证失败

如果 `verify-build.sh` 失败：

1. 确保已运行 `npm run build`
2. 检查 dist 目录是否存在
3. 查看构建日志中的错误信息

### 预部署检查失败

如果 `pre-deploy-check.sh` 失败：

1. 查看哪一项检查失败
2. 运行对应的 npm 脚本查看详细错误：
   - `npm run lint` - 代码检查
   - `npm run format:check` - 格式检查
   - `npm run test:run` - 测试
   - `npm run build` - 构建
3. 修复问题后重新运行检查

## 添加新检查

要添加新的检查项到 `pre-deploy-check.sh`：

1. 在脚本中添加新的检查步骤
2. 使用 `check_result` 函数报告结果
3. 更新本 README 文档

示例：
```bash
echo "9️⃣  Checking custom requirement..."
if [ your_check_condition ]; then
  check_result 0 "Custom check passed"
else
  check_result 1 "Custom check failed"
fi
echo ""
```

## 维护

这些脚本应该随着项目需求的变化而更新。在添加新的构建步骤或部署要求时，请相应更新脚本。
