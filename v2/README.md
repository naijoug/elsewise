# Elsewise 静态生产应用

Astro + React + TypeScript。根目录 `npm ci` 会安装本目录锁定依赖；使用根目录 `npm run dev`、`npm run pre-deploy`、`npm run preview`。

输出为根 `dist/`，GitHub Pages使用 `GHP_BASE=/elsewise/`。保留`src/`的数据、类型、存储兼容和旧逻辑回归；不再将旧Vite入口部署到Pages。

本目录组件测试：`npm run test:v2`。完整范围与本轮证据见 `docs/releases/2026-10-26-astro-v2.md`。
