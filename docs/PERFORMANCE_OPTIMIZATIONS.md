# 性能说明与历史测量

当前架构见 [ARCHITECTURE.md](ARCHITECTURE.md)。本文记录可调查的机制、测量方法和旧结果，
不要求每次修改都做性能优化或重跑完整基准。

## 当前机制

| 机制 | 入口与边界 |
| --- | --- |
| 页面懒加载 | [App.tsx](../src/App.tsx) 使用 lazy 与 Suspense；实际请求大小需在浏览器中测量 |
| 依赖拆包 | [vite.config.ts](../vite.config.ts) 将 React 相关依赖与其他 vendor 分开 |
| 计算和组件缓存 | 相关组件使用 memo/useMemo/useCallback；仅在依赖未变时复用，不代表所有重渲染都被消除 |
| 搜索防抖 | [useDebounce.ts](../src/hooks/useDebounce.ts)；搜索与筛选语义见 [filters.ts](../src/utils/filters.ts) |
| 数据资源 | [dataLoader.ts](../src/utils/dataLoader.ts) 并行 fetch 两份构建后的 JSON |
| 测量工具 | [performance.ts](../src/utils/performance.ts) 提供标记与测量辅助函数 |

生成的源 JSON 保持可读格式。输出大小、传输压缩和缓存效果取决于构建产物及托管配置，
不能从“执行过同步”推断数据压缩或内容更新。同步边界见 [DATA_FORMAT.md](DATA_FORMAT.md)。
`chunkSizeWarningLimit` 只是构建警告阈值，不是已达到的性能指标。

## 如何验证

先确定要改善的页面、指标和用户场景，再测量对应改动。验证入口见 [TESTING.md](TESTING.md)。

- 生产构建及输出检查使用 `npm run pre-deploy`，同一产物无需重复构建。
- 页面性能在浏览器或性能工具中测量，记录提交、日期、URL、浏览器、设备、网络、冷/热缓存和结果。
- 单独区分首屏加载、交互耗时、代码高亮耗时与产物体积。
- 历史目标包括 FCP < 1.5s、LCP < 2.5s、代码高亮 < 200ms；当前没有证明这些目标全站达标的报告。
- HTTP 冒烟检查中的响应时间不等于 FCP、LCP 或浏览器交互时间。

## 历史记录：2026-09-08 19:01 CST

以下保留旧文档记录，未重新测量；原记录未包含提交、Node 版本、设备或网络环境。
它不代表当前 checkout 的验证状态。

| 历史产物 | 原始体积 | gzip 体积 |
| --- | --- | --- |
| languages JSON | 4.75 kB | 1.58 kB |
| idioms JSON | 69.68 kB | 17.70 kB |
| 主 CSS | 28.94 kB | 6.26 kB |
| contexts JS | 40.51 kB | 10.54 kB |
| vendor JS | 59.84 kB | 17.96 kB |
| react-vendor JS | 226.02 kB | 72.33 kB |

旧记录报告 25 个测试文件、182 个测试通过；输出包含 24 个 JS、2 个 CSS，目录大小约 2.0M。
该目录大小与逐文件 gzip 体积口径不同。旧校验器的“数据存在”结果也不能证明当时每份 JSON 都已输出。

## 待评估方向

虚拟滚动、Service Worker、真实用户性能监控与进一步的 bundle 分析尚未作为当前能力交付。
仅在具体任务或测量显示收益时推进，避免无依据地增加缓存、memo 或依赖。
