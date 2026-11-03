# 阅读型视觉系统（2026-10-29）

依据：用户提供的 50 知识点 / 12 语言目录截图，及发布版本 73a52a5 的云浏览器窄屏审阅。

## 已观察问题
- 顶栏和正文不同最大宽度；蓝灰底色、蓝色选中和大量蓝灰边框缺乏视觉层级。
- 顶部明暗文字按钮与语言文字链接风格不一致。
- 列表行过多边框与留白，主链接、摘要、覆盖信息层级不够明确。

## 设计决定
暖白与墨灰阅读表面，单一低饱和绿色强调。统一页宽与左对齐；顶部当前导航采用细下划线；语言链接和主题图标采用统一 44px 触点；目录取消外层圆角卡片，章节细线分隔，条目以排版区分主次。移动章节仍为可横滚的一行；窄屏保留筛选及全部内容，不裁剪正文。

语义色留在 styles.css，阅读组件样式集中在 reading-theme.css。主题图标使用内联 SVG，不增加图标包或网络字体。中英文、学习记录、收藏和路由不改变数据契约。

## 验收要求
完整原测试；双语×深浅×桌面/375px截图；搜索/语言筛选选中态与深色详情截图；计算样式对比度及顶栏页宽、主题触点检查。CI 使用真实 Chromium。实体 iPhone/Safari 与屏幕阅读器不在云 Chromium 证据范围内。

## 用户追加：常用操作只保留图标

在实际标注的 HTTP GET 详情上，将收藏、标记学会、恢复默认、复制代码统一为 44px 内联 SVG 图标操作；目录学会与重置使用同一模式。语言名称与知识章节文字保留，不将内容导航图标化。鼠标 hover 和键盘 focus 可见本地化提示；ARIA 名称、按下状态、复制成功/失败 live feedback 与原存储契约保持。复制按钮成功后显示勾选图标，不能把点击尝试当成已复制。

### Directory saved-topic follow-up

The user explicitly removed the directory's learned/not-learned filters. The directory now offers All and an icon-only saved-topic filter, plus a bookmark on each topic. These use the existing favorites identity/storage (including historical aliases), not learned records. Existing learned records and detail controls remain intact; old `learning` query parameters fall back to the unfiltered directory. The new `saved=1` filter survives reload, back and locale switching. Saved topics can be removed directly, including from the saved view.
