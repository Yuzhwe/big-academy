# Writing 课中活动纸（writing-lesson-shell）完整视觉复现提示词

> 用途：把本提示词整段粘贴进另一 AI / 设计工具，复现 Writing **高保真课中活动页**（lesson-shell paper templates）。  
> 数字与规则均从原型代码实读（`writing-lesson-shell` CSS/JSX + README），未锁项标「未锁 / 待确认」。  
> 源码：`src/demos/writing-product/writing-lesson-shell/`（README · WritingLessonShellPage.jsx · writing-lesson-shell.css）。  
> Figma：Writing · 整页架子 `56:29494`；P5 lined `98:10708`；色卡 mid 参考 `90:10635`（几何色卡 8 色）。  
> **对比入口阶梯**：本文件 = 课**中**答题纸；`Writing-staircase-prompt.md` = 课**前** Level 阶梯入口。二者画布与导航完全不同，勿混用。

---

## 1. 产品与范围（课中活动纸，非入口阶梯）

- **产品**：Big Academy Writing 写作课路径产品。
- **页面**：进入 lesson shell **之后**的课内答题纸（按 `plan[].template` 渲染 P1–P7）。
- **Demo id**：`writing-lesson-shell`；默认课 `G2-O-L2`（`?demo=writing-lesson-shell&lesson=G2-O-L2`）。
- **目标画幅**：iPad 横屏友好 ~**1366×800**；页面 `min-width:1024` · `min-height:700`。
- **用户目标**：在棕框纸上完成 prompt / choice / build / write / plan；右侧 Coach；底部 Back/Next；顶栏 step-dot 看进度；答对触发 Ribbons + Confetti Explosions×3。
- **语言**：界面单语 EN / 中文（`writing-ui-lang` / `?lang=`）；**同一时刻只显示一种语言**，不中英叠字。
- **明确不做（有意 gap）**：完整 hamburger 画布分区 / 自动批改计分（仍在 `writing-lesson-book`）；P1/P7 多为结构占位。

---

## 2. 画布与壳层视觉（topbar / sheet / paper / tutor）

### 氛围
暖棕「木框作业本」：全屏深褐底托住白纸 + 半透玻璃 Coach 栏；品牌色家族 **Given `#9B4F36`**（棕红），正文墨 `#133547`。不是入口阶梯的晚霞渐变。

### 页面根（已锁）
| Token / 类 | 值 |
|---|---|
| 根类 | `.writing-lesson-shell-page` |
| 底色 `--wls-brown` | **`#4E3B24`**（sheet frame / 页面背景，README 锁） |
| 外边距 | `padding: 10px`；`gap: 10px`；`flex` 列；`overflow: hidden` |
| 主文字（纸内） `--wls-text` | `#133547` |

### lesson-topbar（已锁结构）
- 高约 **50px**；三列 `1fr auto 1fr`：左标题区 / 中 step-dots / 右退出。
- **左**：白圆菜单 **50×50**（图标 24）+ **单语课标题** + `Report` pill。
  - 标题：`titleEn` **或** `titleZh`（随 locale），**禁止** EN+ZH 双行叠字（Joe 锁 monolingual）。
  - 当前 CSS 标题字：`400 16px/24px Noto Sans SC` 白字；产品总则要求 EN 标题 Dosis ExtraBold / ZH Douyin Sans → **顶栏字族是否改到总则「未锁 / 待确认」**（逻辑已单语，字体未全对齐）。
  - `Report`：Dosis ExtraBold 14，白边 `rgba(255,255,255,0.2)` pill。
- **中**：`lesson-steps` = 该课 `plan` 页数（**非写死 1–9**）+「更多」白 pill。
- **右**：「退出答题」白 pill → `?demo=writing-entry-home`。

### step-dot 四态（已锁色）
| 态 | 外环 / 内圆 |
|---|---|
| **done** | 内填 `--wls-done` **`#9B4F36`** |
| **current** | 外环 `#EBDCD7`；内白底 + 边/字 `#9B4F36` |
| **todo**（可点未完成） | 内 `rgba(255,255,255,0.2)` 白字 |
| **locked** | 灰渐变 `#9DA6AF→#727B84`，边 `#A1A8AD` |
| 尺寸 | 内圆 **48×48**（≤1200px 时 40）；数字 Dosis ExtraBold **20** |

### sheet-frame（Figma 56:29494 锁）
```
grid:
  columns: minmax(0,1fr) 430px   （≤1200 → 360px）
  rows:    minmax(0,1fr) 70px
  areas:   "paper tutor"
           "paper nav"
  gap: 10px
```
- **左 `paper-column`**：全高白纸 `.paper-doc`。
- **右上 `tutor-column`**：Coach（宽 430 / 窄 360）。
- **右下 `nav-back-next`**：Back / Next，高 **70**，宽同 tutor。
- **禁止**在 paper 上方再放重复页面标题（Figma 已删；代码注释锁）。

### paper-doc（活动纸 · Joe 锁）
- 白底 `#FFF`；圆角 **10px**；`overflow: auto`。
- **`padding: 20px`（四向；L/R 全模板锁死 20px）** — Write/Plan/choice/build 一律；**禁止**子层再叠水平 inset 使距纸边 >20px。
- 含 `.tpl-write` 时改为 `padding: 10px 20px`（竖向收紧，L/R 仍 20）。
- 列 gap 默认 **16px**。

### tutor-column / Coach（已锁）
- 底：`--wls-tutor-glass` `rgba(255,255,255,0.2)` + `backdrop-filter: blur(24px)`；圆角 10。
- 头：蓝圆头像 `--wls-coach-blue` **`#4F68BE`** 28×28「C」+「Coach」白字 + meta 半透。
- 气泡：白底、圆角 **28**、底边 3px；字墨 `#133547` 16/24；左下三角尾巴。
- hint：链接样式 `#D3E1FD` 下划线「Need a hint?」；展开白半透 hint body — **不是**第二重气泡。

### nav-back-next（已锁）
- 双钮白底满圆角，高 **70**，字 `700 20/28 Noto Sans SC`，黑字。
- disabled：`opacity: 0.45`。
- **未完成拦截** Next：`.is-locked` / `data-locked=incomplete` → `opacity: 0.38`，灰字 `#6B6B6B`，底 `#F3F1EF`。

---

## 3. 字体与单语规则

### 产品总则（Joe · 跨入口+课壳）
| 角色 | EN | ZH |
|---|---|---|
| 标题 | **Dosis ExtraBold** | **Douyin Sans** |
| 长文 / body | **Jost** | **Noto Sans SC** |

### 课壳实读映射（已用于纸面）
| 元素 | 字体（代码） | 字号 |
|---|---|---|
| Choice 字母 | Dosis 800 | 18/20 · 色 `#9B4F36` |
| Choice 正文 | Jost 500 | 18/1.1 · `#133547` |
| Prompt（通用） | Noto Sans SC 700 | 24/32 |
| Prompt Write | Dosis / Douyin Sans 800 | 24/32 |
| Lined 作答 | Dosis / Douyin Sans 700 | **24/48**（对齐行高） |
| Paragraph draft | Jost / Noto Sans SC 500 | 20/1.55 |
| P4 槽字 / 词块 | Jost / Noto Sans SC | 槽 700 18；chip 600 15 |
| Word-grid Tab | Jost / Noto Sans SC 400 | 16/24 |
| Word-grid cell | Jost / Noto Sans SC 500 | 18/1.1 |
| Sentence-set Tab | Jost / Noto Sans SC 700 | 14 |
| Scaffold 卡 | Jost / Noto Sans SC 600–700 | 13.5 |
| Step-dot 数字 | Dosis ExtraBold | 20 |
| Nav | Noto Sans SC Bold | 20/28 |

### 单语规则（已锁）
- Topbar 课名、prompt、Coach 文案、词表 Tab 标签、P4 chip 文案：**只渲染当前 locale 一路字段**（`titleEn` **或** `titleZh`；`labelEn` **或** `labelZh`）。
- P4 词块：**monolingual chips**（不做 chip 上中英双文）。
- 语言 key：`localStorage writing-ui-lang`；查询 `?lang=en|zh`。

---

## 4. 共用排版锁（20px、间距层级）

| 锁 | 值 | 说明 |
|---|---|---|
| **Activity paper L/R** | **20px** | `.paper-doc`；全模板；子组件 `padding-left/right:0` |
| Paper 内纵向 gap | 16（write 时 0，由内部 gap） | |
| Choice 列表 gap | **12px** | |
| Choice pill | `min-height 46`；`padding 4`；`radius 24` | |
| Choice icon | **36×36** 圆；边 1.5 `#9B4F36` | |
| Prompt 上下 | 通用 `20px 0`；Write `10px 0 0` | |
| Tutor / nav 列宽 | **430**（≤1200→360） | |
| Nav 高 | **70** | |
| Sheet / page 外 gap | **10** | |
| 触控底线 | choice / chip ≥44–46 | |

**禁止**：在 choice-list、slots、lined、word-grid 上再加 30px/20px 水平垫（旧稿已撤）。

---

## 5. 共享组件视觉逻辑

### 5.1 Choice（P3）四态 + dim（Joe 锁）
| 态 | 类 | 视觉 |
|---|---|---|
| 默认 | `.choice-option` | 白底；边 `#C9B8B2`；字墨 |
| Hover | `:hover:not(.is-dim)` | 边 → `#9B4F36` |
| 选中（未判） | `.is-selected` | 底/边填 `#9B4F36`；白字；icon 白芯+内环棕 |
| 正确 | `.is-correct` | 底 **`#14AE5C`**；白字；icon ✓ 绿 |
| 错选 | `.is-wrong` | 底 `#9B4F36`；白字；icon ✕ 棕 |
| 错后揭示正解 | `.is-wrong-correct` | 白底绿边；绿底白 ✓（代码态存在；当前 P3 流程以 dim 为主） |
| **Dim（答对后非选项）** | `.is-dim` | **整体 `opacity: 0.4`**；`pointer-events:none` — **禁止改色伪装变灰** |

流程：选字母 → 脚钮先当 **Check** → 对：正解绿 + 其余 dim + 庆祝；错：错项 `.is-wrong`，可重选清 grade。

### 5.2 词块 / P4 chip（`.tpl-chunk`）
| 态 | 视觉 |
|---|---|
| 默认 | 白 pill；边 `#C9B8B2`；字墨；`min-height 44`；`pad 10×16`；radius 999 |
| **已用 `.is-used`** | 底/边 **`#9B4F36`** 白字 + **×**（Figma 81:10136）— **不要用 dim opacity** |
| 错点 `.is-miss` | 粉闪 `#FDE0DC` + Feel.Body 左右 kick（shake）；**无 CSS keyframe shake** |
| 提示 `.hintpulse` | 棕光晕 pulse 1.2s×3（miss≥3） |

### 5.3 词表 Tab（P5 word-grid · Figma 色卡 mid）
- 容器像 sentence-set：Tab 骑在 panel 上沿；active = **light 底 + mid 边/字**；panel = light 底 + mid 边。
- **色卡 mid（Figma 90:10635 / 几何色卡 8 色，已锁参考）**：

| 名 | mid | 本 demo Tab | light（实读） |
|---|---|---|---|
| 青 cyan | `#1DB4D1` | My plan | `#D2FBFF` |
| 蓝 blue | `#4881F0` | （色卡有；**本词表未挂 Tab**） | 未锁 light |
| 紫 purple | `#AC5BF1` | Adjectives | `#F0E4FC` |
| 粉 pink | `#EC5598` | Marks | `#FCE4F0` |
| 红 red | `#EE524A` | Opinion | `#FCE3E1` |
| 橙 orange | `#F87A30` | （色卡有；**本词表未挂 Tab**） | 未锁 light |
| 金 gold | `#E8B537` | Nouns | `#FBF0D4` |
| 绿 green | `#1BC267` | Linking words | `#D2F4E0` |

- Cell：白 pill + 边 `#C9B8B2`（同 choice 气质）；hover 边棕；**无右侧 2×2 键**。
- Tab 标签单语（`labelEn` / `labelZh`）。

### 5.4 庆祝（答对 · 已锁）
- **触发**：`grade === 'correct'`（P3 Check 对；P4 build `status===done` 等）。
- **同屏双轨**（fullScreen → `document.body`）：
  1. **Ribbons**（`@tsparticles/ribbons`）：count **28**；colors `['#9B4F36','#14AE5C','#FFD84D','#56c7ff','#8f78ff','#FFFFFF']`；zIndex 1000；粒子落空再 destroy（勿固定砍秒）。
  2. **Confetti Explosions ×3**（preset `confettiExplosions`）：三发射点约 `(30,35)` / `(70,30)+0.35s` / `(50,45)+0.7s`；quantity 55；zIndex 1002；~3600ms 清理。
- **Milestone 阶梯**用单独 Confetti Preset — **不要**与本题 Ribbons+Explosions 混为同一套。
- `prefers-reduced-motion` → 不播；同页恢复 `pageAnswers` **不重播**（`celebratedRef`）。

### 5.5 Given 文案色
- `.tpl-given`：字色 **`#9B4F36`**、字重 600；无色块底。

---

## 6. 分模板 P1–P7

### P1 · Growth / Finished work
- 结构占位：prompt + dashed placeholder box。
- 完成态：仅离开时 `completed`（Next）— **视觉细则未锁**。

### P2 · Learn
- Prompt + `beats` 列表（或 placeholder 说明 teach UI 在 book）。
- 完成：离开标 `completed`；**chrome 可随时 Next**（`canAdvance` 恒真）。

### P3 · Choice（高保真已锁）
- Prompt + `.choice-list` 竖排 A/B/C…
- Check / dim / 庆祝见 §5.1、§5.4、§7。
- 边框 token：`--wls-choice-border #C9B8B2`。

### P4 · Build / Fill（Alex **A** · Joe 2026-10-15 锁）
- **判题模型 A（跟 Alex）**：**错词 reject + shake**；**槽位填满才 grade**；默认 `inOrder` 开（除非页显式 `inOrder:false`）。
- **不要 B**：禁止「棕标签贴在空槽上」的 brown-label-on-slot 交互/视觉。
- 布局：prompt →（可选 given）→ **underline slots** → **Sentence set** 托盘（Tab 骑边 + 棕框 panel `#F8EBE4` / 边 `#9B4F36`）内词库。
- Slots：
  - word：横排短下划线；字 `#9B4F36`；线空 `rgba(78,59,36,0.35)` / 填实棕。
  - sentence：竖排长线（`.tpl-slots--stack`）。
- 词块态见 §5.2；**monolingual**。
- 两错后可 `shown` 揭晓答案；三 miss 触发 hintpulse。
- 完成：`build.status === 'done' | 'shown'` 或 grade correct。

### P5 · Write
#### 5a Lined（Figma `98:10708` · Joe 2026-10-15）
- 结构：**prompt → lined answer（行高 48 / 底线 `#C9B8B2`）→ in-paper word-grid**。
- 默认约 **10** 行规则；纸内词表见 §5.3。
- Query：`?write=lined`；试 G2-O-L2 `page=6` 或 L7 `&write=lined`。

#### 5b Paragraph scaffold（Alex L7 · Joe 2026-10-16 锁）
- 结构：左 **scaffold 四卡** + 右 draft + 底 **同一 word-grid**。
- **颜色跟 Alex，不跟 Writing 棕金**：

| Token | 值 | 用途 |
|---|---|---|
| `--wls-scaffold-bun` | **`#F8E2BF`** | Top / Bottom bun |
| `--wls-scaffold-reason` | **`#E2F0D8`** | Reason 1 / 2 |
| `--wls-scaffold-label` | `#4B4031` | 卡标题 |
| `--wls-scaffold-hint` | `#6D6252` | 副文 |
| `--wls-scaffold-rail-w` | **150px** | 左栏宽 |

- Top/Bottom 大圆角（上 30 / 下 26）；rail `opacity: 0.8`。
- Draft：Jost 20/1.55；字数计数灰 `#6B7A88`。
- Query：`?write=paragraph`；G2-O-L7 默认。
- 完成：draft 非空 trim。

### P6 · Plan（汉堡层 · 结构+色已有，交互偏占位）
- 六层：opinion / reason1 / detail1 / reason2 / detail2 / closing。
- Idle 色：金层 `#FFFBCA`/`#C98D2A`；理由绿 `#E0FFEC`/`#0EA152`；细节红 `#FEE3E3`/`#DB392F`。
- Focus：实色底+白字+白下划线纸（**无棕环**）。
- 完成：每层 values 非空。
- 与 P5 scaffold 色系不同（P6 用 Writing 色卡层色；P5 paragraph 强制 Alex bun/reason）— **勿混用**。

### P7 · Mastery check
- 结构占位 box；完成靠 Next `completed` — **视觉未锁**。

---

## 7. 导航与完成态逻辑（Check / 未完成拦截）

| 规则 | 行为 |
|---|---|
| **pageAnswers 持久** | 按页 index 存 `selected/grade/completed/build/write/plan`；Back/Next/step-dot **不wipe** |
| **P3 Check** | 未 correct 前 Next 文案=`Check`；无选中则 disabled；点 Check 判对错，**不翻页** |
| **未完成拦 Next** | 当前题未 complete → Next disabled + `.is-locked`；**Back 永远可**（非首页） |
| **step-dot** | 可点范围：`i <= firstIncompleteIndex` **或** 已完成页；**禁止向前跳过未完成** |
| **离开前进** | `delta>0` 时给当前页打 `completed:true`（Learn/chrome 靠此解锁后续点） |
| **完成判定摘要** | P3：grade correct；P4：done/shown；P5：draft 非空；P6：层全填；P1/P2/P7：需 completed 旗 |

---

## 8. 跟 Alex / 不跟 Alex 对照表

| 项 | 跟 Alex | 不跟 / Writing 自有 |
|---|---|---|
| P4 判题 | ✅ A：错拒+shake；满槽再 grade | ❌ B 棕标贴槽 |
| P4 used 词块 | 逻辑同「已用可撤」 | 视觉用 Writing 棕+#×（Joe 锁 Figma） |
| P5 paragraph 支架色 | ✅ bun `#F8E2BF` / reason `#E2F0D8` | ❌ Writing 棕金条 |
| P5 lined + 词表 | 结构可对照 | 色卡 mid / 白 pill = Writing Figma |
| P3 Check→dim | ✅ | dim=**opacity 40%**（Joe） |
| 壳布局 | — | ✅ Figma 架子：Coach 右、Nav 在 Coach 下、无纸上重复标题 |
| 品牌色 | — | ✅ `#9B4F36` 家族 + sheet `#4E3B24` |
| 庆祝 | — | ✅ Ribbons+Explosions×3（Milestone 另套 Preset） |
| 纸 L/R 20px | — | ✅ Joe spacing lock |
| 字体总则 | — | ✅ Dosis / Douyin / Jost / Noto |

---

## 9. 验收清单 + 未锁项

### 须对齐（已锁）
- [ ] 页面/框底 **`#4E3B24`**；主强调 **`#9B4F36`**；纸字 **`#133547`**；对勾绿 **`#14AE5C`**
- [ ] sheet：`paper | tutor` / `paper | nav`；tutor+nav 宽 430（窄 360）；nav 高 70
- [ ] **无** paper 顶重复标题；Coach 在右；Back/Next 在 Coach 下
- [ ] `.paper-doc` **L/R = 20px**（含 Write `10px 20px`）
- [ ] Topbar 课名 **单语**（titleEn **或** titleZh）
- [ ] Choice：选中棕 / 对绿 / 错棕；答对后其它 **opacity 0.4**（不重涂灰）
- [ ] P4：错点粉闪+Feel shake；满槽 grade；used=棕+×；非 B 槽标
- [ ] P5 lined：prompt + 48px 行线 + 纸内 word-grid；无右侧 2×2
- [ ] P5 Tab mid：至少 cyan/green/red/gold/purple/pink 与上表一致；色卡另含 blue/orange
- [ ] P5 paragraph：支架 **仅** Alex bun/reason 四 token；rail 150px
- [ ] 未完成：Next 锁 + 前进 step-dot 锁；Back OK；pageAnswers 保留
- [ ] 答对：Ribbons + Explosions×3；不与 Milestone Preset 混用
- [ ] 单语 chips / Tab / prompt

### 未锁 / 待确认
- [ ] Topbar 标题字族是否改为 EN Dosis ExtraBold / ZH Douyin Sans（现 Noto 16）
- [ ] 蓝 `#4881F0`、橙 `#F87A30` 的 word-grid Tab 与 light 配对（色卡有、demo 未挂）
- [ ] P1 / P7 正式视觉与交互
- [ ] P6 与产品最终 Plan 规格是否完全定稿
- [ ] `.is-wrong-correct` 是否在 P3 错后揭示流程启用
- [ ] Report / 菜单 /「更多」真实面板
- [ ] Coach 头像是否换插画（现字母 C）
- [ ] 语言切换控件在课壳内的落点（现多靠 URL/localStorage）

---

## 10. 复现时请遵守

1. 先搭 **棕底 `#4E3B24` + topbar + sheet（纸左 | Coach 右上 | Nav 右下）**，再往 `.paper-doc` 填模板。
2. **纸边 L/R 永远 20px**；不要在子树叠水平 padding。
3. 品牌棕家族以 **`#9B4F36`** 为轴；成功绿 **`#14AE5C`**；P5 长写支架**脱离**棕金，改用 Alex `#F8E2BF` / `#E2F0D8`。
4. Choice dim = **整体 40% 透明度**；P4 used ≠ dim。
5. P4 只做 **Alex A**（拒错+满判）；单语；庆祝用 Ribbons+Explosions×3。
6. 导航：未完成拦 Next 与前进点；Back 与 pageAnswers 保留。
7. 不确定处标「未锁 / 待确认」，不要编造未出现的 chrome 或 B 方案槽标。

---

**源码锚点**：`writing-lesson-shell/README.md` · `writing-lesson-shell.css`（`:root` tokens、choice、P4/P5/P6）· `WritingLessonShellPage.jsx`（BuildFill / WriteFill / WORD_GRID_TABS / isPageComplete / celebrate）· `shared/celebrateRibbonsConfetti.js`。