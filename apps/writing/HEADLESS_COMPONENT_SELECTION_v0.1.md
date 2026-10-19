# Big Academy Writing — Headless UI Selection v0.1

**日期**：2026-10-19  
**性质**：基于《Writing-headless-UI-selection-brief.md》、Big Academy Writing 已批准规则及官方文档的选型与实施建议；当前为待编码落地的技术决策，不是 UI 组件运行时验收报告。  
**建议首选**：**React Aria Components**（`react-aria-components`，Adobe，Apache-2.0）  
**备选**：**Ark UI React**（`@ark-ui/react`，MIT）  
**参考工具**：Radix Primitives、Base UI（不与首选并列安装）

## 1. 为什么首选 React Aria Components

Writing 面向 K12，既要可完全替换的视觉，也要键盘/读屏/触控及中英文；长期还有其他教育产品的表单、日期、表格、树、列表和国际化。React Aria Components 官方提供 **50+ 可样式化组件**，强调鼠标、触控、键盘、屏幕阅读器交互，并具备本地化字符串、日期与数字格式处理、多日历/数字系统和 RTL 支持。它的 React Components + 低层 Hooks 双层架构适合复杂、非标准的教具 UI。官方持续发布 v1.x 版本，2026-09 Release 已出现 NavigationTree；仍须项目安装时锁定实际依赖版本。基于这些事实，这是最契合本项目风险分布的选择。它**不替代产品业务逻辑、教学内容翻译或应用级 i18n 文案表**。

- 官方：<https://react-aria.adobe.com/>；React Aria 文档 <https://react-aria.adobe.com/Tabs>；国际化质量 <https://react-aria.adobe.com/quality>。
- 商用：Apache-2.0 为宽松开源许可，允许商用；保留要求的 copyright/license/notice，注意修改文件的标注义务。不是 MIT，但不是商业收费许可。
- 样式归 Big Academy 所有：`DESIGN.md` → CSS Variables/Tokens → 本地 BA 组件封装 → Coding Agent → 浏览器视觉 QA。
- 只创建真正必要的 BA Components，不把库的 50+ 原语照抄一遍。

## 2. 候选对比（定性，不是实验室跑分）

| 标准 | React Aria Components | Ark UI | Base UI | Radix Primitives |
|---|---|---|---|---|
| 视觉控制 | 完全可自定义；组件与 Hooks | 无头，完全换皮 | 无样式/CSS自由 | 无样式/CSS自由 |
| 键盘、读屏、焦点 | **强**：官方跨平台/AT 测试说明 | 强：Zag.js 状态机/WAI-ARIA | 强：WAI-ARIA/多平台测试 | 强：WAI-ARIA + 实测 |
| 触控/平板 | 官方作为核心能力 | 强，含移动滑动组件 | 强，Drawer/虚拟键盘进展活跃 | 基础良好，特定组合需自测 |
| i18n 基础 | **完整**：I18nProvider、日期/数字与 RTL | LocaleProvider、日期/数字工具 | 更偏 RTL/组件 locale，应用层需自补 | 方向提供器与各组件语言处理，应用层需自补 |
| 常见控件丰富度 | **50+**：日期、表、树、列表等 | **40+**：DatePicker、Steps、TreeView 等 | **35+**：表单/弹层/选项/抽屉；未见内置 DatePicker | 精选常用组件，复杂集合类要补 |
| Agent 文档与接口 | 丰富示例、类型、Hooks，复杂度较高 | 文档、LLMs.txt、MCP 官方入口 | 类型与 LLMS.txt，API 直观 | 社区和例子广泛 |
| 维护活跃度（2026-10） | 官方 GitHub releases 2026-09 | 当前文档 v5.39.3 | 官网发布 2026-10 v1.9 | 官网上线文档/仓库活跃 |
| 许可 | **Apache-2.0** | **MIT** | **MIT** | **MIT** |
| 与 Writing 匹配 | **首选** | 最强备选 | 好，但通用国际化需要额外方案 | 好，但全面 K12 组件覆盖稍弱 |

> 判断基于官方文档与公开发版情况，**未**对四库做本地实际 bundle size、Safari/iPad、VoiceOver、低端平板性能横向实测。上线前须做技术 spike 验收，不能将本表当成体验测试结论。

官方来源：
- React Aria <https://react-aria.adobe.com/quality>、<https://react-aria.adobe.com/Tabs>、<https://github.com/adobe/react-spectrum/releases>、<https://www.npmjs.com/package/react-aria-components>
- Ark UI <https://ark-ui.com/docs/overview/about>、<https://ark-ui.com/docs/utilities/locale>
- Base UI <https://base-ui.com/react/overview/about>、<https://base-ui.com/react/components>、<https://base-ui.com/react/overview/releases>
- Radix <https://www.radix-ui.com/primitives>、<https://www.radix-ui.com/primitives/docs/utilities/direction-provider>

## 3. 改选 Ark UI 的条件

如果以后 Big Academy 核心应用转向 Vue/Svelte/Solid，或需要共享一套 DOM 状态机模型跨框架，优先重新评估 Ark UI。它的 React/Solid/Vue/Svelte 和 `LocaleProvider`、DatePicker/TreeView/Steps/Toast 等覆盖让它成为合理备选。**当前单一 React 前端不因“以后可能迁移”先增加框架兼容负担。**

## 4. 本次明确的覆盖 gap

1. **Alex 学习进度与课程状态**：没有任何 Headless 库替代 `Pages`/`Skip`/`Home`/`P5`/`P7`。必须适配唯一真实课程状态机。
2. **E-01 斜向阶梯、Milestone 与 Confetti**：是业务 UI 自定义组合；动画须尊重 reduced motion、触控、键盘等。
3. **P6 六层汉堡计划编辑器**：有真实输入语义，但单层背景/标题/聚焦下划线是自研复合 UI，非现成 Form。
4. **P5 长文、批注锚定、光标避让、Word Grid 插词**：React Aria TextField 支撑基本输入/表单语义；**不会自动解决富文本锚定、selection/caret、跨元素插词和滚动**，需单独测试。
5. **中英文课文与教学内容**：I18nProvider 管语言/格式/辅助文本，但教学文案仍需 Big Academy 自有字典、源数据字段与 QA。
6. **阅读/听力/音频/Voice/数学公式/各教育任务专用组件**：本次不提前建设，未来按实际功能增补。

## 5. 技术约束与质量门禁

- React + TypeScript + 单一 Headless 基座 `react-aria-components`；**不**把 `@react-spectrum/*` 品牌主题组件当成同类无样式底座；不同时引入 Base UI/Radix/Ark。
- `I18nProvider` 指定 `en-US`/`zh-CN`，同步到 DOM `lang`/`dir`；Big Academy 负责自己的 `messages` 与课文翻译，使用当前源状态单向驱动，不能增加第二套语言权威。
- Tokens 由 `src/design-system/tokens.css` 作为运行时代码，DESIGN.md 说明其语义和选择理由；样式尽量消费 Tokens，不直接散落私有色值。
- 保留 HTML 原生 textarea/input 的编辑能力；根据实际需要组合 React Aria TextField/Label，而非强制用 aria Tabs 实现任务进度。**“任务进度条”不是普通 Tab**，必须遵从 Alex 的前进权限。
- 保留依赖许可/Notice，指定 package lock；组件通过触控、键盘、读屏、字体放大、中文长标签、iPad 兼容性验证。浏览器截图不等于读屏验收。
- `prefers-reduced-motion` 下以静态状态提示替代粒子；Milestone Confetti 的 UI receipt 不改变解锁业务权威。

## 6. 推荐最小实施顺序

1. 在**全新、空白 React 工程**中锁定 `react-aria-components` 版本并验证样板可运行；不复制前一版单文件 HTML 的 UI/CSS。
2. 实装 5–7 个真实需要的 BA Primitives；见 `COMPONENT_SCOPE_v0.1.md`。
3. 构建共享 Top Bar、Coach+独立 Footer、Word Grid、P6 Layer、E-01 Lesson/Milestone。
4. 接入 Alex 唯一业务引擎/状态语义；回归四态、Skip、首次庆祝收据、失效恢复。
5. 每个组件演示 default/focus/disabled/error/filled/readonly（若适用），至少验证 1440×900、1024×768、834×1112；再决定两份核心规范 v1.0 是否冻结。

**给设计师的一句话：** 你定义产品体验与视觉，React Aria 提供可靠的标准交互底座，Agent 负责封装真实 Big Academy 组件和测试；不把课内业务规则交给组件库。