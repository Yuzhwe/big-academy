# Big Academy Writing — Minimum Component Scope v0.1

**目标**：本次高保真开发只创建所需最小组件，不为“设计系统完整”而预建无关的 DatePicker/Table/Tree/Toast。与 `HEADLESS_COMPONENT_SELECTION_v0.1.md`、`DESIGN.md` 配合。状态 `[SCOPE]`＝下一轮开发必须实现，**不是已经写完**。

## 1. BA 基础组件（可跨课程复用）

| 组件 | Headless/DOM 依据 | 使用场景 | 最低验证 |
|---|---|---|---|
| `BAButton` / `BAIconButton` | React Aria Button | 返回、CTA、Back / Check / Next / Hand in、WordChip | 聚焦、disabled、触控≥44px、装载状态、键盘触发 |
| `BATabs` | React Aria Tabs | 多组 Word Grid；Level 切换（若为真正选择控件） | 左右键、聚焦、active 面板与实际数据同步、溢出 |
| `BAChoice` | React Aria RadioGroup/CheckboxGroup **按 Alex 任务性质选择** | P3 单选/多选；不要假设每题同一模式 | 错误后重新作答、读屏反馈、对错/disabled |
| `BAField` | React Aria TextField + HTML input/textarea | P6 layer 编辑、P5 普通写作输入 | 标签关联、焦点可见、IME 中文输入、已保存草稿 |
| `BAOverlay` | React Aria Dialog/Popover | Tablet Word Grid 与 My Plan 按需浮层 | 触控关闭、Escape、焦点进出、caret 不被遮蔽、不覆盖 Coach/Footer |
| `BATaskProgress` | 自定义原生 buttons + `ol` / 进度语义，**不自动当 Tabs** | Top Bar 居中任务编号/完成/跳过/锁定 | `Pages.canOpen`，中心几何准确，长题列表、读屏已完成/锁定 |
| `BAStatus` | HTML 语义 + Token 样式 | Lesson 的 Locked/Continue/Review、任务反馈与 Mile 状态 | 不只用颜色表达、读屏名称、不同底色对比度 |

## 2. Writing 专属组合组件（不是全局 Headless Primitive）

| 组件 | 组成 | 关键要求 |
|---|---|---|
| `LessonTopBar` | BAIconButton + title/meta + BATaskProgress | **无折叠菜单**；左返回与 Lesson 信息；进度组件以整条 Bar 的中心线为准；长标题适配 |
| `LessonWorkspace` | 语义布局 + CoachPanel + **独立 Footer** | 白纸左、Coach 独立滚、Footer 在 Coach 容器外固定底部；全 A 视觉 |
| `WordGrid` | BATabs + BAButton/Chip + BAOverlay | 分组切词表；Tablet On-demand，焦点/插词/光标保留 |
| `HamburgerLayer` | BAField + 分层卡结构 | Label + 编辑内容**同一色层**；整层聚焦色 + 编辑下划线，无内嵌白框 |
| `StairLessonCard` | BAButton + BAStatus | 左上 Lesson **数字编号始终显示**；Start/Continue/Review/Locked；遵从课程真实状态 |
| `UnitMilestone` | 原生 button（已达成）+ 状态 + Confetti adapter | 每 Unit 后、最后 Unit 后另有 Goal；**首次新达成返回自动一次**；已达成点击手动无限重播；不改权限 |

> Level Goal 可以先作为 `UnitMilestone` 同系列的单独非交互/语义组件实现，**不要用 Unit 完成条件强行推导 Level Goal**；精确完成判定仍 Pending Alex。

## 3. 验收与“不做”

- [ ] 实际仓库完成 React Aria 安装、导入、版本锁定，非假接口/裸 DOM 冒充库组件。
- [ ] `DESIGN.md` 的稳定决策落入 `tokens.css` / BA 组件样式；设计师检查 A 视觉。候选未批准色值不能冒充确定 Token。
- [ ] 任务进度不能点击越过 Alex 的 `Pages.canOpen`；UI 不维护另一份解锁逻辑。
- [ ] `BAOverlay` 在 834 和 1024 Tablet 与中文 IME、虚拟键盘下可用。
- [ ] Mile 完成与 Confetti receipt 分离，刷新不重复自动播；手动重播有效；reduced motion 反馈有效。
- [ ] 不要求一次性开发整个 Big Academy Design System；不预建 Calendar、Tree、Table 或复杂编辑器，除非实际本次页面需要。

**状态**：本清单为最小开发范围，**实施/运行 QA 尚未开始**。