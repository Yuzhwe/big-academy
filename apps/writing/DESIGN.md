# Big Academy Writing — DESIGN.md

**Reconciliation:** The global spec from `docs/unified-design-and-token-audit` is now also at `/DESIGN.md` (copy in `docs/reference/unified-design/`). This file is the Writing working draft already on the lesson-slice lineage. Approved `[A]` items in `/DESIGN.md` win if the two disagree. Neither file is visual sign-off of the running UI.

**版本**：v0.2 · DRAFT（Code-First / Component Registry pilot，2026-10-19）  
**不是**已经冻结的 v1.0。以 `PRODUCT.md` v1.0 之前的 `PHASE1_ALIGNMENT_REPORT_v0.3.md` 为业务状态权威索引；Alex 原始 HTML 仍为功能源。  
**本轮架构**：**DESIGN.md + CSS Design Tokens + React Aria Components + 最小 Big Academy Components**。组件实施范围见 `COMPONENT_SCOPE_v0.1.md`；具体库证据见 `HEADLESS_COMPONENT_SELECTION_v0.1.md`。

## 1. 已批准 `[A]`

1. **仅 A · Warm Frame + White Canvas**。学习纸白底，Warm Frame 为轻暖色，不使用深棕页框或深棕阶梯背景。不制作 A/B 对比。
2. 课中 Top Bar：**取消折叠菜单**；左返回 + Lesson 名称和必要标签；任务编号和完成状态的**组合整体绝对几何中心对齐**，不被左侧长标题推偏。响应式收缩标签、处理超长名称；不隐藏关键信息或课内可达性。
3. 左 Writing Paper + 右 Coach 双栏；Coach 内容独立滚动；Back + 一个 Check/Next/Hand in 主操作位于 Coach 外，固定在右栏底部。
4. Word Grid 在左写作区，根据任务实际状态展示；多词组 Tab 切换实际词汇；Tablet 在左区使用 On-demand Overlay，不盖住光标、最后一行或 Coach/Footer。
5. P6 汉堡层各自是**单一视觉表面**，Label 和输入同层颜色；聚焦整层变色、可编辑区出现下划线；无嵌套白色输入框。
6. E-01 Lesson 卡左上始终显示 Lesson 数字编号。Milestone 每 Unit 末尾，完成态以 Alex 课程 Lesson 状态统一计算，首次新达成返回自动一次 Confetti；点击已完成 Mile 手动重播。
7. 默认普通线条 **0.5 CSS px**，功能性 focus-ring 可更粗；移除无功能装饰标题。

## 2. Tokens — 约束、确定与候选

| Token | 值 | 状态 | 使用方式 |
|---|---|---|---|
| `--ba-brand-dark` | `#133547` | `[A]` 原有品牌色 | Paper 正文、信息标题 |
| `--ba-writing-accent` | `#B25415` | `[A]` Writing 操作方向（对比度已检） | 白底强调、白字 CTA；对纯白 `5.03:1`，普通文字 AA 通过 |
| `--ba-paper` | `#FFFFFF` | `[A]` | 活动白纸 |
| `--ba-border-weight` | `0.5px` | `[A]` 视觉描边默认 | 普通分隔线；不能套到键盘 focus |
| `--ba-surface-warm` | `#FEF9EF` | `[E]` 初始视觉候选 | A 轻暖页面背景，**待你视觉审核** |
| `--ba-choice-border` | `#C9B8B2` | `[R-ACTIVITY]` 候选 | Choice/Grid 一般描边 |
| `--ba-success` | `#14AE5C` | `[R-ACTIVITY]` 候选 | Check 正确状态，待对比度校验 |
| `--ba-error` | `#9B4F36` | `[R-ACTIVITY]` 候选 | 错误/高亮；不把原 Demo 品牌色盖过 Writing accent |

视觉提示词推荐 Dosis/Jost/Douyin Sans/Noto Sans SC。**2026-10-19 设计师确认的优先级高于本段早期候选：**英文标题与所有数字只用 Dosis ExtraBold 800；英文正文 Jost；中文标题抖音美好体；中文正文 Noto Sans SC。仓库不打包未授权字体。Douyin Sans 未随仓库分发，页面使用系统 fallback。Dosis、Jost、Noto Sans SC 通过 Google Fonts 样式表加载，失败时回退到可读系统字体。这仍不是视觉签核。

## 3. 组件组织

- Behavior layer：React Aria Components；i18n Provider，Tabs / Dialog / Popover / Radio/Checkbox / TextField / Button。
- Visual layer：`tokens.css` + 本项目 BA Components（参照 `COMPONENT_SCOPE_v0.1.md`）。
- Product layer：只读取 Alex 课程状态；Headless 组件不拥有课程进度、Skip、评分或解锁。
- 自定义：E-01 Staircase、UnitMilestone/Confetti、LessonTopBar、WordGrid、Hamburger、Coach 布局；不把业务流程硬塞到 Tabs。

## 4. 待审核 `[Q]`

- A 版 E-01 的浅暖舞台细节、卡片层次、里程碑比例/位置。
- Top Bar 的高度、图标、居中任务组件宽度与溢出策略；Tablet 834×1112、1024×768 的长名称状态。
- P6 focus 主色的实际 WCAG 对比度；P3/P4 特定反馈颜色与动效时长。
- 中文系统字体安装/fallback 和完整字号阶梯；Word Grid Overlay 高度与无障碍焦点恢复。
- 多个 Milestone 同次新达成时庆祝协调、Skill Skip 撤销后再达成的 auto-play 资格；Level Goal 的实际达成式。

## 5. Design Gate

仅当基础 Tokens 一致、真实 React Aria 集成、代表性的 BA Components 状态对比、Alex 源产品流程回归、1440×900 / 1024×768 / 834×1112 浏览器对比及设计师视觉签核完成后，才考虑冻结 v1.0。`DESIGN.md` 不是代码的替代品，代码也不应自动宣称批准新视觉细节。

## 6. 组件代码与设计源（v0.2 新增）

- 本项目允许 **不依赖 Figma 设计文件即可移交给 Agent**：以本 `DESIGN.md` 传递设计意图，`tokens.css` 提供实际数值，`contracts/components.json` 提供稳定 ID / Props / Events / States，未来的 `*.tsx` 和 `*.stories.tsx` 为实际渲染和交互证据。
- 组件 ID 约定：`BA-UI-001`～`BA-UI-007` 基础层，`BA-WR-001`～`BA-WR-006` Writing 专属层；正式视觉引用组件 ID，而不是只凭中文名称或页面坐标定位。
- **现状**：`BA-UI-001`、`BA-UI-006`、`BA-WR-001` 为 `implemented`，使用临时 foundation theme，不是 `validated`，也未经视觉签核。`BA-WR-002`、`BA-WR-003`、`BA-WR-004`、`BA-WR-005`、`BA-WR-006` 为 `implemented`，`visualStatus: candidate-warm-frame`，不是 `validated`。`BA-UI-002`、`BA-UI-003`、`BA-UI-004`、`BA-UI-005`、`BA-UI-007` 仍为 `planned`。绝不可把 implemented 改写成 validated。详细边界见 `CODE_FIRST_COMPONENT_WORKFLOW_v0.1.md`、`docs/PILOT_RUNTIME.md` 与 `docs/HIFI_RUNTIME.md`。
- Figma/示意图仍可作为探索和审核证据，但 **不是项目构建运行的必要依赖**；最终审美仍需要设计师对浏览器中的实际组件和页面签核。