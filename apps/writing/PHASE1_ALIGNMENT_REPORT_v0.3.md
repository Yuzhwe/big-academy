# Big Academy Writing — Phase 1 Specification Alignment

**版本**：v0.3 · 2026-10-19（Milestone Confetti A + React Aria Components 选型）  
**阶段结论**：**Phase 1 产品及视觉权威基本对齐，Milestone 首次庆祝规则已确认，React Aria Components 作为本次开发选型已提出；进入 Phase 2 组件与视觉基线准备。Top Bar 和 UI 组件实际实现尚未验收；PRODUCT.md / DESIGN.md v1.0 未冻结。**  
**本轮边界**：更新已批准 Milestone 庆祝频次；研究无头库并建立 DESIGN.md v0.1 DRAFT 与少量 token 草案。**不使用旧版前端作为新 A 版实施底稿；本轮未安装 React 依赖或完成 React 组件测试。**

## 1. 依据、来源可信度与优先级

| 代号 | 依据 | 实际证据与界限 |
|---|---|---|
| `[P-ALEX]` | `l2_opinion_paragraph_unit(1)(1).html` | **已取得真实代码**，约 4706 行；`CFG`/`SCR`、`Pages`、`Skip`、`P5`、`P7`、`Home`、`Stairs` 等可检查。这里的结论主要是**源代码级确认**，不等于 52 屏全部运行时验收。 |
| `[R-ENTRY]` | `Writing-staircase-prompt.md` | E-01 `writing-entry-home` 的**用户提供的复现说明**。其中称“源码实读”，但对应 React/资产目录**没有作为源码上传**；“已锁”只在该 Demo 的语境成立。 |
| `[R-ACTIVITY]` | `Writing-activity-style-prompt.md` | 课内 `writing-lesson-shell` 的**用户提供的复现说明**；明确 P1/P7 是占位、完整 Hamburger 和评分不在其 Demo 内；真实 JSX/CSS 尚未取得。 |
| `[R-REVIEW]` | `Writing_Activity_Style_Review_2026-10-19.md` | 早期对照分析，不是设计决策的独立权威。其中“可以比较深棕 B”**已经被后续用户决定废止**。 |
| `[A-USER]` | 本次对话中用户**明确批准**的规则 | 权威针对视觉、布局、UX 的最新决定；若涉及产品状态，遵循 Alex 原型逻辑。具体决定参见 §2。 |
| `[E]` / `[Q]` | 推导建议 / 待决定 | 只能作为提案或检查项，不能暗中升级为已批准业务规则。 |

**优先关系（按职责，不是简单的文件时间排序）**：
- **业务行为、评分、提交、学习进度**：`[P-ALEX]`；用户批准的 UX 改进不可静默改写业务模型。
- **最新布局、视觉方向与体验取舍**：`[A-USER]` 高于两份 Demo 复现提示词中的“已锁”。
- **未确认的尺寸、颜色、动效**：从 `[R-ENTRY]` / `[R-ACTIVITY]` 继承为**候选参考**，仍需设计审核及对比度/响应式验收。
- **参考示例 URL、假数据、Showcase 状态**：不作为生产环境或学生权限的真相。

## 2. 已确认决策登记（正式纳入下一阶段）

| 决策 ID | 决策内容 | 状态 | 权威与落实方式 |
|---|---|---|---|
| UX-01 | **仅保留 A · Warm Frame + White Canvas**；不要深棕色的大面积页面/阶梯舞台，不制作 B 版本。 | `[A-USER]` | 最新用户决定；替代此前 A/B 对比的探索建议。 |
| UX-02 | 学习活动为白色纸张，常规描边默认 **0.5 CSS px**；界面不增加无功能装饰标题。 | `[A-USER]` | 既有设计决定。键盘焦点线、必要状态边框不受 0.5px 的机械限制。 |
| UX-03 | **Top Bar 取消折叠菜单**；保留左上返回、Lesson 名称与必要标签、任务编号及完成状态；**任务进度/完成信息组件整体水平居中**。 | `[A-USER]` | 最新决定；清除源 `Shell.top()` 的 Index/Menu 表现和 Demo 的菜单/退出占位。精确中心组合几何仍需视觉验收，不能删掉必要的导航可达性。 |
| UX-04 | Desktop/Tablet 为左 Activity/Paper、右 Coach 双栏；**右侧 Footer 在 Coach 容器外固定底部**，Coach 内容独立滚动。 | `[A-USER]` | 既有 UX 审核结论；不能把 Footer 放回可滚 Coach。 |
| UX-05 | Footer 保留 Back + **一个**随任务变化的主操作位置，使用 **Check / Next / Hand in**，原型例外需保留。 | `[A-USER]` + `[P-ALEX]` | 不用 Demo 的通用“Next disabled”覆盖原型特殊提交/重试。 |
| UX-06 | Word Grid 在左 Writing Area 内，仅按任务显示；**多组 Tab 切换实际词组**；Tablet **B · On-demand Overlay**。 | `[A-USER]` | 关闭后释放写作空间；展开不得遮蔽光标、最后一行或盖住右侧 Footer。 |
| UX-07 | P6 Hamburger 六层共享各层完整背景；标签与可编辑内容**同层、没有白色嵌套输入框**；聚焦整层变化 + 输入下划线。 | `[A-USER]` | 焦点文字/底色需要对比度验收；不能仅靠颜色传达状态。 |
| UX-08 | E-01 纳入同一可交互交付，不另算 52 Activity Screens；**每张 Lesson 卡片左上角显示 Lesson 编号**。 | `[A-USER]` | 从最新 UI 决策导入，任何状态都持续显示编号，Locked 不能用锁图标替代编号。 |
| UX-09 | E-01 学习操作 **Start / Continue / Review / Locked**；只有确有保存的未完成学习工作才用 Continue，不能仅从 `current` 推断。 | `[A-USER]` | UI 动作文案；内部可能仍有 `skipped` 状态，不新增第五操作动作。 |
| UX-10 | **完成上一 Lesson 后解锁下一 Lesson**；Skill Skip 的完成与撤销**按照 Alex 原型**，不新造跳过规则。 | `[A-USER]` + `[P-ALEX]` | `Pages.done()`、`Pages.canOpen()`、`Home.liveState()`、`Skip.checkFailed()` 等作为基准。 |
| UX-11 | 中英内容优先单语界面，实际系统的源文本/辅助内容需逐页确认，不能直接删除教学层的必要翻译。 | `[R-ENTRY]` + `[R-ACTIVITY]` 候选 | 属于两个 Demo 共同视觉约束，尚**不是**新确认的全局语种产品改动。 |
| UX-12 | P1 的 Save / Print 在 Alex 决策前保留；P7 正式测评不得变成占位。 | `[P-ALEX]` + 既有 `[A-USER]` | P1 `Ribbon.saveTxt`/`window.print`；P7 `P7.render/submit`。 |
| UX-13 | **每个 Unit 所有 Lessons 后固定插入一个 Milestone**；最后 Unit 同时保留 Unit Milestone 和单独 Level Goal。 | `[A-USER]` | Milestone = Unit 完成，Goal = Level 完成；不作为课程入口。 |
| UX-14 | **所有 Unit 类型的 Milestone 用同一达成判定**：以该 Unit 的真实 Lesson 状态 `done/skipped` 全部满足为准；合法 Skill Skip 按现有课程规则计入，且不建立第二份进度。 | `[A-USER]` + `[P-ALEX]` | 与 `Home.unitState(u)==='done'` / `Stairs.build` 的 `st.every(...)` 一致；**不要把 `Home.unitDone(id)` 类型分支照搬成 Milestone 视觉规则**。 |
| UX-15 | **Milestone 新达成后的首次返回 E-01 阶梯页自动播放一次 Confetti；以后的返回不自动重播，点击已完成 Milestone 可以随时手动重播**。 | `[A-USER]` | 完成取源课程状态；“已自动庆祝”只是 UI 效果收据，不计入学习进度、解锁权限。多个同时新达成仍 `[Q]`。 |

**说明**：`UX-03` 中“整体水平居中”的具体子元素分组目前按“任务编号＋完成状态整体居中”编入布局合同；Lesson 名称与标签靠左区域组合是设计推导。若你希望四项共同居中，Phase 2 改这一项即可，不改产品逻辑。

## 3. 产品内容与交互契约（来自实际 Alex 源码）

| 模块 | 代码锚点（原始 HTML 近似行号） | 对齐结果 |
|---|---|---|
| 原型范围 | `CFG`/`LESSONS`/`SCR`、模板 `P1`–`P7` | **9 Lessons / 52 Activity Screens**；S1 / S2 是额外交互类型，不可简单计为新活动页。 |
| 活动完成 | `Pages.done()` L2955–2973 | 按 screen.kind 分支：task/model、apply/check、plan、draft、revise 等不同判定；不能统一为“有文字＝完成”。 |
| 页面推进 | `Pages.firstOpen()`、`Pages.canOpen()` L2972–2973 | 所有课程页面遵守源进度约束；强制解锁只限 Demo/特权分支。 |
| Skill Skip | `Skip.state()`、`Skip.skipped()`、`Skip.checkFailed()` L2861–2896 | 源认可的 `mastered_skipped` / `skipped` 计为完成；Check 失败后可以撤销。 |
| Lesson 状态 | `Home.liveState()`、`Home.liveDone()` L4162–4169 | 保留 `locked/current/available/done/skipped` 真实状态，再映射 UI 动作；不要建立第二个 E-01 状态仓库。 |
| 课壳 | `Shell.top()` L3837 起 | 源顶部包含 Index、Menu、标题、进度；**其多余菜单视觉被最新 UX-03 覆盖**。 |
| P5 提交 | `P5.handIn()` 约 L3500–3516 | 低于 60 词首次提示、可二次提交；约 80 词是建议目标。保留反馈、revision、第二次提交、完成流程。 |
| P7 测评 | `P7.render()`、`P7.submit()` 约 L3650–3740 | 有独立题目分页、未答警告/提交、评分反馈及 Skill Skip 相关撤销；不是 shell Demo 的空卡。 |
| P1 导出 | P1 约 L3126 | Save my paragraph / Print 功能存在且产品是否保留仍待 Alex，不得静默删除。 |
| 返回阶梯 | `Home.remember()`/`openLesson()`/`backToPath()` L4213–4230 | 一条 E-01 → Lesson → E-01 路径；回到同 Lesson 卡片；浏览器刷新后的返回焦点持久性**尚未证实**。 |

## 4. Conflict Register（对齐冲突与处理）

| ID | 优先级 | 两份 Demo / 原型的差异 | Phase 1 裁定 | 尚需验证 |
|---|---|---|---|---|
| C-01 | P0 | `[R-ENTRY]` 深褐晚霞 `#411C0A→#B39C6B`；`[R-ACTIVITY]` 深木框 `#4E3B24`。 | **不采用**；最新用户 `[A]` 唯一方案 A 轻暖框/白画布，**E-01 同样不能深棕**。 | Phase 2 为 E-01 制作相容的浅暖色卡片场景。 |
| C-02 | P0 | `[P-ALEX]` 当前 `Shell.top` 的 Index/Menu；`[R-ACTIVITY]` 又有菜单、More、Exit 和 Report。 | **删除折叠菜单的 UI 布局**，保留返回 + Lesson/必要标签 + 中央任务进度/完成状态；不破坏真实回到路径。 | 严格几何居中、长文案和单/多任务数的状态。 |
| C-03 | P0 | `[R-ACTIVITY]` 以 P1/P7 占位和简化自动完成作为 Demo；`[P-ALEX]` 完整任务。 | **完全遵循 Alex 真实任务流程**。 | 按 P1–P7 模板逐屏回归。 |
| C-04 | P0 | `[R-ACTIVITY]` 泛化为“未完成统一禁用 Next；P5 非空完成”；Alex 有特殊提交、警告、重试。 | 仅用 Demo 的**视觉状态**，不采用其状态机。 | P5 短文字二次 Hand in、P7 未回答提交警告。 |
| C-05 | P0 · RESOLVED | `[R-ENTRY]` 在下一个 Unit 前做可选 Mile；`[P-ALEX] Stairs.build()` 在每 Unit Lessons 后插 Mile。 | `[A-USER]` **每个 Unit 完成后固定 Milestone**，**最后一 Unit 后仍同时保留 Milestone + Goal**；UI 顺序采用 Alex。 | Phase 2 仅验证相邻 Mile/Goal 布局不重叠，非产品决策开放项。 |
| C-06 | P1 · RESOLVED | `[R-ENTRY]` 可由里程碑之后是否有可用 Lesson 推断已完成，与 Alex 的 Unit 学习状态不同。 | `[A-USER]` **不使用 Demo 后续 Lesson 推断**；Milestone 对所有 Unit 类型统一读取课程已有 Lesson `done/skipped` 完成状态（等同 `Home.unitState(u)==='done'`）。 | 验证 Skill Skip 选中、撤销及非 G2-O Unit 预览状态；不更改原先的 `prereqOk()` 权限。 |
| C-07 | P1 | `[R-ENTRY]` `current` 显示 Start，`continueLesson` 只在文案表出现；用户已经批准 Continue。 | Continue 只由真实、可恢复的未完成内容推导。 | 恢复进度、Review 行为与 SKIP 状态提示。 |
| C-08 | P1 | `[R-ENTRY]` Showcase 人为把一个 Locked 变 Available；Alex 支持 `S.unlockAll` Demo。 | 仅测试隔离使用，不影响正常学生解锁或深链。 | 验证通过地址栏进入 Locked 不可绕过。 |
| C-09 | P1 | `[R-ACTIVITY]` 最小宽 1024px，固定 150px P5 guide；Tablet 已批准 834px 及 B 浮层。 | 拒绝最小宽/常驻窄栏；继续使用左侧 on-demand overlay。 | 834×1112、1024×768、放大 200%、键盘/焦点。 |
| C-10 | P1 | `[R-ACTIVITY]` P6 金/绿/红 Focus 白字；部分亮底白字对比不足。 | 共享层结构固定，色卡仅候选；白字须另选足够深的焦点底色或改深字。 | 各层 idle/focus/error 的实际配色和焦点线。 |
| C-11 | P1 | `[R-ENTRY]` Demo URL `?demo=writing-lesson-shell&lesson=...`、`writing-ui-lang` vs Alex `Home.openLesson` 和 `S.zh`。 | 直接采用最终单路由/状态权威，不搬 Demo 的 URL 与第二份 locale store。 | 浏览器 Back、刷新、跨页恢复。 |
| C-12 | P2 | 视觉示例中 `已锁` 的各类字号、卡片尺寸、纸内 20px 与字体文件。 | 标为**可继承的视觉候选**，不等于本项目批准最终数值。 | 对照 Figma、字体许可/可用性、响应式及可访问性。 |
| C-13 | P2 · PARTIALLY RESOLVED | `[R-ACTIVITY]` 答题奖励 Ribbons+Confetti ×3；`[R-ENTRY]` Mile 有一次性 Confetti。 | `[A-USER]` 新达成 Mile **仅首次回阶梯自动播放一次**；以后只有点击已完成 Mile 才重播；与课内庆祝分离。 | 多个 Milestone 同时完成的播放策略及 Reduced Motion 替代反馈另行 QA。 |

## 5. Milestone：产品逻辑已确认 `[A-USER]`（2026-10-19）

**最终用户确认的七项输入（按用户原意，不从 Demo 擅自补充）：**

1. **每个 Unit 结束后都需要一个 Milestone**。
2. **Milestone 代表 Unit 完成**。
3. **最后一个 Unit 后同时保留 Milestone 和 Level Goal**；前者代表 Unit 完成，后者代表 Level 完成。
4. **使用课程已有完成状态**，而非为 Milestone 建立第二套持久化或解锁模型。
5. **Genre / Skill / Process Unit 用相同的 Milestone 达成条件**。
6. **Skill Skip 继续按 Alex 原型计入完成**。
7. **新达成 Milestone 后首次回到阶梯页，自动播放一次 Confetti**；**以后每次返回不自动重播**；**手动点击已完成 Milestone 可随时播放 Confetti**。（用户在后续回合选择 A，覆盖先前的重播频次待决。）

### 5.1 权威与实际源码映射

| 维度 | 规则及实现锚点 | 来源/状态 |
|---|---|---|
| 节点位置 | `Stairs.build(lv,live)`：Start → 对每 Unit 的 Landing → Lessons → **Mile** → 最后 **Goal**。不按 E-01 Demo 的可选 `Mile`/下一 Unit 前插法。 | `[A-USER]` + `[P-ALEX]`（约 L4389–4399） |
| Milestone 达成 | 用已有 `Home.lessonStates(u)`；只有**所有** Lesson 状态均 `done`/`skipped`，才为 Achieved。源码 `Home.unitState(u)` 的 `done` 正是这个统一结果。 | `[A-USER]` + `[P-ALEX]`（约 L4179–4187） |
| Skill Skip | 源认可的 `Skip.skipped()`/`Pages.done()` 和 `Home.lessonStates` 自动体现在 Milestone 达成中；如果 `Skip.checkFailed(skill)` 撤销，重新推导状态。 | `[A-USER]` + `[P-ALEX]`（约 L2861–2893） |
| 特殊提醒：不要混淆两个 API | `Home.unitDone(id)` 是课程**先修权限辅助判定**：可玩 Unit `liveDone()`，非可玩 Skill 可能按 `mastered()`，其他不可玩类型返回 `false`。它不是通用 Milestone 视觉完成判定。Milestone 统一用 `Home.unitState(u) === 'done'` / 原有 `Stairs.build` 同一规则，**不改变 `unitDone` / `prereqOk` 本身**。 | `[P-ALEX]` 源码差异 + `[A-USER]` 统一要求 |
| 终点 | 最后的 Unit Milestone 与 Level Goal 分开、相邻保留。**Level Goal 语义**为 Level 完成。 | `[A-USER]`；Goal 精确完成公式仍 `[Q]` |
| 庆祝 | 新达成 Milestone 后**首次**返回阶梯页自动播放一次 Confetti；后续重复返回不自动播放。已完成 Milestone 可点击手动重播。**Confetti 不应改变 Lesson/Unit/Level 完成状态**，也不是解锁权威。 | `[A-USER]`；播放频次已确认，仅并发及撤销后的再次达成需定 |
| 不可操作状态 | 未完成 Milestone 不得借点击庆祝或导航进入不可用课程。已完成 Mile 的点击用于庆祝，而非变更学习进度。 | `[E]` 安全默认/产品约束；需 UI 验收 |

### 5.2 建议的状态/触发模型（不创建额外业务权限）

- **Upcoming：** 未达到 Unit 完成条件；视觉上显示尚未达成，不自动庆祝。
- **Achieved：** 课程既有数据判定 Unit 完成；视觉上显示已达成，点击后重播 Confetti。
- **Transition to Achieved：** 在完成本 Unit 后**首次**返回阶梯页，且该已达成 Milestone **尚未自动庆祝过**，触发**一次**自动 Confetti。这是 `[A-USER]` 最终选择 A 的行为，不是每次返回都自动重播。
- 从已达成转为未达成（例如来源允许的撤销）时，按课程权威重新渲染。不要把一次庆祝记录当作 Unit 完成证明。再次重新达成是否重新获得自动庆祝资格为 `[Q]`。
- **建议实现 `[E]`：** 为每个 `levelId:unitId` 持久记录 `celebratedMilestoneIds` 或 `firstReturnCelebratedAt`，只用于避免重复的自动 Confetti。其写入应在正确播放/处理首次自动庆祝时发生；不触碰 Alex 的完成状态。首次打开已经历史完成的 Level 时避免把它们错误算作“刚刚达成”，应通过离开 Lesson 前后的 canonical `unitState` 变化或最新达成事件确认。手动点击只重播，不清空收据。无动画偏好时可标记处理并以静态成功反馈替代。
- `prefers-reduced-motion` 下建议不播大量粒子，保留可感知的已达成反馈；彩纸数量、速度与样式属于 `[E]`，不能借此修改用户确认的庆祝语义。

### 5.3 仍需补充的边界条件（不阻止 Milestone 主结构设计）

| ID | 尚待确认内容 | 无须假定的原因 |
|---|---|---|
| **Q-M04 · CLOSED** | **自动 Confetti 仅新达成后首次返回播放；历史已完成节点重复返回不自动播放。** | 用户明确选择 A；已完成节点点击仍可重播。 |
| Q-M05 | **多个 Milestone 同时达成**：自动逐个播放、合并一次庆祝，还是只对本次新增成就播放？ | 原型可能存在跳过带来的批量完成；避免一次渲染出现大量粒子。 |
| Q-M06 | **Level Goal 精确完成公式及庆祝**：是否 all Unit Milestones achieved，以及 Goal 是否单独庆祝？ | 用户已确认其“Level 完成”的含义，但未指定判定公式和动画行为。 |

**已经关闭的旧问题：** `Q-M01`（最后 Unit 后保留 Mile + Goal）、`Q-M02`（不同 Unit 类型统一达成条件）、`Q-M03`（达成后自动庆祝与已完成节点点击重播）。**不再把这三项列为未决。**

## 6. 色彩与视觉 QA（已计算的静态检查）

WCAG 相对亮度对比度：普通文字 AA ≥ **4.5:1**；大号文字 ≥ 3:1；重要非文字 UI 边界一般 ≥ 3:1（对相邻背景测量）；最终须连同实际叠层与半透明状态检查。

| 配色组合 | 比值 | 判定 |
|---|---:|---|
| `#B25415` / `#FFFFFF` | **5.03:1** | AA 普通文字通过；主按钮白字安全基线。 |
| `#B25415` / `#FEF9EF` | **4.80:1** | AA 普通文字通过。 |
| `#B25415` / `#FEF5E1` | **4.64:1** | AA 普通文字通过。 |
| `#B25415` / `#FFF1C2` | **4.46:1** | AA 普通文字**不通过**。 |
| `#B25415` / `#4E3B24` | **2.11:1** | 既不满足普通文字 AA，也不满足 3:1 关键边界；B 版已弃用。 |
| `#FFFFFF` / `#14AE5C`（新 Prompt 成功绿） | **2.90:1** | 普通文字不通过；白色勾图标的关键状态也须核查。 |
| `#FFFFFF` / `#C98D2A`（P6 参考金） | **2.87:1** | 普通文字及重要边界风险；不可机械复刻白字聚焦。 |
| `#133547` / `#FEF9EF` | **12.29:1** | 深蓝正文与 A 暖白底强对比。 |

**合并原则**：A 方案的背景/交互主色已经决定。`#9B4F36`、色卡及尺寸可归入 `DESIGN.md` 的**组件备选 palette**；不能因此让产品回到深棕木框。

## 7. 当前待决登记与进入下一阶段的门槛

| ID | 类型 | 责任 | 何时解决 | 未决不解决时的保底 |
|---|---|---|---|---|
| Q-M05 / Q-M06 | Milestone 多节点同时新达成时的播放策略、Level Goal 精确完成/奖励规则，以及撤销后再次达成的资格 | UI Designer + Alex（如涉及学习奖励逻辑） | Phase 2 / 交互测试前 | Milestone **首次返回一次**与点击重播已定，不重新开放；多节点并发先采用串行/合并的 `[E]` 候选，等待 UX 验证。 |
| Q-H01 | Top Bar“居中组件”的分组与长标题的真实宽度 | UI Designer | Phase 2 | 中央对齐任务编号+完成状态，左侧返回+Lesson 名称/必要标签。 |
| Q-V01 | 课内与 E-01 的统一浅暖色 token、Coach 与主按钮最终样式 | UI Designer | Phase 2 | 沿用已批准 A 方向，尺寸先候选；不要再出现深棕底。 |
| Q-V02 | Word Grid 精确 8 色中未成对的 light token、状态对比度、Tab 焦点 | UI Designer + QA | Phase 2/3 | 只使用实际有配对 light/mid 的 Tab；不用猜配色。 |
| Q-F01 | 字体文件实际有无、是否可合法嵌入、EN/ZH 字体替代 | 技术检查 + UI Designer | Phase 3 | 用可读系统 fallback；不凭文档私自分发字体文件。 |
| Q-P01 | P1 Save / Print 是否保留 | Alex | 完成功能前 | **保留当前原型行为**。 |
| Q-P02 | Unit 点击去向、其他 Level 内容/权限与 Goal 业务奖励 | Alex | 对应功能实现前 | 不发明新的业务路由/可玩的其他 Level；Milestone Confetti 行为以 §5 已批准规则为准。 |
| Q-QA01 | 52 屏 / 9 课、全提示与失败分支、平板 834/1024、中文文本实际验收 | Coding Agent + UI Designer | Phase 3–5 | 不声明“全部通过”；从代表性垂直切片开始。 |

### Phase 1 → Phase 2 的放行判断

- **READY FOR PHASE 2**：有单一来源优先级、已批准决策名单、冲突及 Owner、明确尚未验证内容；不会因为“Prompt 已锁”覆盖用户新决定。
- **NOT READY TO FREEZE v1.0**：Milestone 7 条产品规则及自动重播频次均已确认，但多节点并发与 Level Goal 仍有问题；Top Bar 最终几何尚待审核；P1–P7 代表性视觉和整个学习流仍需全新 A 实现及浏览器验证。
- **Phase 3 最低验收**：至少 E-01→Lesson→正确/错误→继续/返回→状态更新、一页 P3、一页 P4、一页 P5、一页 P6、一页 P7，及 1440×900/1024×768/834×1112。若原型有特殊分支必须覆盖 P5 二次提交、P7 空题提交、Skill Skip 撤销。

## 8. 未来两份核心规范如何生成（尚未生成 v1.0）

- **`PRODUCT.md`**：从 §3、§5 获批部分、§7 产品待决项，以及 Alex 实际源代码汇总。规范不得覆盖原始教材的事实、生成伪造课程数据。
- **`DESIGN.md`**：从 §2 的已批准 UI/UX、§6 与两份复现 Prompt 中不冲突的视觉 tokens、Phase 2 Figma/高保真验收结果整理。未知色值与几何标 `Candidate/Pending`。
- 老文档进入 `references/`，只承担可追溯证据，不需要每个开发任务同时读十余份历史规范。**不要把本报告当成正式 v1.0**。

## 9. Skill v0.1 — Phase 1 Dry Run 记录

- Skill 路径：`skills/prototype-to-hifi/SKILL.md`。
- 测试对象：本报告，输入 `[P-ALEX]` / `[R-ENTRY]` / `[R-ACTIVITY]` / `[A-USER]`。
- 检查模式：**仅验证 Phase 1 可追溯结构**（来源、批准规则、冲突登记、开放问题、证据、移交门禁）；**不**自动验证 52 屏逻辑、真实视觉、完整 Figma、React Demo 内容。
- 判定：**结构通过 ≠ UI 视觉通过 ≠ 可冻结两份正式规范**。由 Designer 审核冲突裁定和 Phase 2 视觉；产品行为例外由 Alex 决定。

**下一步**：Milestone 主结构已锁 → 优先设计 Milestone 达成/点击的 UI 反馈及 Top Bar 最终排布 → 出全新 A 版核心视觉验证 → 再冻结 `PRODUCT.md` / `DESIGN.md` v1.0。**本轮没有重新开发前端。**


## 10. Component Foundation — 本轮引入（2026-10-19）

- **开发首选：React Aria Components**（React + TypeScript），配合 `DESIGN.md` v0.1 DRAFT、`src/design-system/tokens.css` 和本次最小 Big Academy 组件层。现阶段为选型建议/开发实施基线，**不是“组件已经实现”的声明**。
- **备选：Ark UI（MIT）**，当团队转向 Vue/Svelte/Solid、希望跨框架行为基座或更加看重状态机形式时才重新评估。
- **不混用多套 Headless 基座**；同一个 Button/Tabs/Popover 不同时套 React Aria、Radix 和 Base UI。
- 选型与证据详见 `HEADLESS_COMPONENT_SELECTION_v0.1.md`；基础 token 草案详见 `src/design-system/tokens.css`（**标候选颜色不可视为已经审核**）。
- Phase 2 最小 Big Academy Components 边界见 `COMPONENT_SCOPE_v0.1.md`；优先 BAButton/IconButton、BATabs、BAChoice、BAField、BAOverlay、BATaskProgress、BAStatus，其上组合课程专属 E-01/Lesson UI；不建立全平台 50+ 组件库。
- 技术验收门：在线依赖可安装且版本锁定、React 构建成功、Tab/Choice/Overlay 真实触控和键盘行为通过、i18n 与 CSS Token 联动且浏览器可验证；在此之前不能声称 library 已集成。
- **组件库不拥有学习进度**：Alex `Pages/Skip/Home/P5/P7` 的状态语义仍是唯一权威。