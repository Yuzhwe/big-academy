# Writing 入口阶梯页（E-01 / writing-entry-home）完整设计复现提示词

> 用途：把本提示词整段粘贴进另一 AI / 设计工具，复现 Writing 高保真入口阶梯页。  
> 数字与规则均从原型代码实读（`writing-entry-home`），未锁项标「未锁 / 待确认」。  
> 源码：`src/demos/writing-product/writing-entry-home/`（2026-10-16 Joe 字号阶梯锁）。  
> **Joe 优化（2026-10-16）**：斜度不再死锁 15°，改为**随窗口/阶梯视口高度自适应**；台面 + 光柱（台柱）必须**服从卡片视觉重心**，不得挤占或抢戏。

---

## 1. 产品与页面定位

- **产品**：Big Academy Writing 写作课路径产品。
- **页面**：进入课壳（lesson shell）**之前**的 Level 路径 + 斜向阶梯入口。
- **Demo id**：`writing-entry-home`；页面标记 `E-01`（E-01 与 E-02 顶栏 Level Tab 已合并）。
- **用户目标**：在当前 Level 的「阶梯路径」上看到 Intro → Unit → Lesson → Milestone → Goal；拖动斜向浏览；点开未锁 Lesson 进入下一课壳；已完成 Milestone 可点一次撒彩纸庆祝。
- **默认 Level**：`L2`（课程最密；代码锁 `DEFAULT_LEVEL_ID = L2`）。L2 样例进度：`current_unit = G2-O`，当前课 `G2-O-L2`「Reasons & closing」。
- **语言**：界面单语切换 EN / 中文（localStorage key `writing-ui-lang`）；同一时刻只显示一种语言，不中英叠字。

---

## 2. 画布与整体视觉方向

### 氛围
暖棕金「晚霞石阶」：深褐落入浅金，卡片像立在光柱与木色台面上的奶油/白瓷牌。整体偏游戏化学习路径，不是扁平列表。

### 背景（已锁）
- **全视口渐变**，**不要**风景底图：  
  `linear-gradient(180deg, #411C0A 0%, #B39C6B 100%), #FFF`
- 页面 `overflow: hidden`；舞台 `.e01-stage` 为 `100vw × 100vh`，`overflow: visible`（侧向伸出的卡片不被裁切）。
- 页面主文字色 `#2c3e50`。

### 字体体系（Joe 2026-10-16 字号阶梯锁）
| 角色 | EN | ZH | 字号/行高 |
|---|---|---|---|
| 产品总则·标题 | Dosis ExtraBold | **Douyin Sans** | — |
| 产品总则·长文 | Jost | Noto Sans SC | — |
| Badge 数字 | Dosis ExtraBold | 同 | **20** |
| Badge 文案（Done / 需完成上一步） | — | Noto Sans SC SemiBold | **14** / lh20 |
| Lesson 标题 | Jost SemiBold | **Douyin Sans** | **20** / lh 1.23 |
| Unit 标题（白字） | Dosis ExtraBold | **Douyin Sans** | **20** / lh 1.23 |
| 时长 / meta | Dosis Medium | Noto Sans SC Regular | **14** |
| CTA（Start/Review） | — | Noto Sans SC Bold | **20** / **lh 28** |
| Unit 标签「Unit」字 | Dosis ExtraBold 14；序号 **25**；类型 14 | 同结构 | — |
| PathHeader 大标题 | system-ui / Noto Sans SC 700 | 同 | **40** / 1.15（≤900px 时 32） |
| Path 统计 pill | 700 **18** / 1.2 | 同 | — |

字体文件：`DouyinSansBold.ttf`、`Jost-Variable.ttf`；Dosis 用系统/CDN ExtraBold·Medium。

### 共享材质色（卡片描边/浮雕）
- 描边 / 浮雕底：`#5e4b35`
- 浮雕阴影：`box-shadow: 1px 3px 0 #5e4b35, inset 0 0 4px rgba(255,255,255,0.4)`
- 奶油底板渐变：`#fff7e1 → #e2d4ae`
- Unit 橙头渐变：`#ffaf76 → #783a00`（约 80% 停点）
- 正文褐：`#752403`；Lesson 标题褐：`#9b4f36`
- CTA 珊瑚：`#d97757`
- Locked 灰：`#778089`

### 质感关键词
圆角厚边、轻微内发光、**薄**台面 PNG 落影、台下弱磨砂光柱（服从卡片重心）、current 课卡对角扫光。

---

## 3. 布局结构

自上而下 / 叠层：

1. **EntryTopBar**（`z-index: 50`，绝对定位 `top:12 left:16 right:16`）
   - 左：返回圆钮 36×36，`rgba(255,255,255,0.94)`，字「‹」24px，色 `#2c3e50`
   - 中：Level Tab 轨道 `L0 · L1 · L2 · L3 · L4 · L4+`  
     - 轨道：白半透 pill `rgba(255,255,255,0.9)`，padding 4，gap 4，`max-width: min(520px, 48vw)`  
     - Tab：padding `8×12`，未选 `#4a5f73` 600 13px；**选中 `#1a6fb5` 白字**  
     - **说明**：顶栏 Tab 视觉为功能占位（白轨+蓝激活）；更细 chrome 规格「未锁 / 待确认」
   - 右：语言 `<select>` EN / 中文，同白 pill 样式

2. **PathHeader**（`z-index: 40`，`top:64 left:24`，pointer-events:none）
   - 大白标题：当前 Level 名（EN=`nameEn`，ZH=`name`）
   - 下方 outlined 白 pill 行（border `1.5px solid rgba(255,255,255,0.95)`，padding `8×14`，gap 10）：
     - 年级（EN `gradeShort` 如 `G4`；ZH `grade`）
     - `{unitCount} units|单元`
     - `{lessonCount} lessons|节课`

3. **StaircaseScene**（`inset: 180px 0 0`，`z-index: 10`）
   - 全宽视口；内部 rail 用 `translate3d(-camX, -camY, 0)` 斜向平移
   - 视口 `overflow: visible`、`touch-action: none`、光标 grab/grabbing
   - 每级切换 remount 场景（`key={levelId}`）

参考舞台常量（布局数学，非强制画布固定分辨率）：`STAGE_WIDTH=1366`，`STAGE_HEIGHT=1024`；背景素材参考比 `1800×1318`（现已不用风景图）。

---

## 4. 阶梯几何与运动

### 坐标系（已锁）
- **路径轴锚点 = 每级 StairStep 的 platform 顶边中心**，不是卡片高度。
- 卡片叠在台面之上；光柱向下伸。改卡片高度 **不得** 改步距或对角线对齐。
- 方向：从 **左下 → 右上**（索引增大，x 增、platform 升高）。

### 关键几何常量（水平锁死；垂直随视口）

| 常量 | 值 / 规则 | 含义 |
|---|---|---|
| `STEP_GAP` | **290**（锁） | 相邻 platform 锚点**水平**间距 |
| `PILLAR_SLOT` | **280**（锁） | 每步槽宽（platform 宽） |
| `PLATFORM_HEIGHT` | **≈31**（锁薄） | `round(280×70/640)`；台面保持细条，勿加高 |
| `CARD_ABOVE_EST` | **320** | 仅路径总高/相机估算，不参与步距 |
| `STAGE_PAD_Y` | **56** | 路径上下垫 |
| `VIEW_INSET` | **40** | 相机边界内缩 |
| `STEP_RISE` | **随视口算** | 相邻 platform 锚点垂直升高（见下） |
| `DIAGONAL_SLOPE` | `STEP_RISE / 290` | 当前对角线斜率 |
| `DIAGONAL_DEGREES` | `atan(slope)·180/π` | **输出值**，不是输入锁；旧原型参考约 **15°**（rise≈80） |

### 斜度自适应（Joe 优化 · 取代死锁 15°）

**意图**：可见段始终是「左下 → 右上」的完整斜向构图；窗口变矮/变高时改步进升幅，而不是把卡片挤出画面或拉成近乎平铺。

1. 量阶梯视口高（不是整页）：  
   `staircaseViewH = window.innerHeight − 顶区占用(约 180px PathHeader/TopBar 下方起算)`  
   `staircaseViewW = window.innerWidth`
2. 水平步距锁死：`STEP_GAP = 290`
3. 估算一屏大约能横跨几步：  
   `visibleSpanX = max(staircaseViewW − 2×VIEW_INSET, STEP_GAP)`
4. 把「可用竖向预算」分给这一屏斜升（留给卡片上沿呼吸，避免贴顶/贴底）：  
   `riseBudget = staircaseViewH − CARD_CLEARANCE`  
   其中 `CARD_CLEARANCE` 建议 **220～280**（覆盖 Lesson 卡高 ≈280 的一部分 + 「你在这里」tip + 边距；矮屏取下限、高屏取上限）
5. 换算单步升高并钳制：  
   `STEP_RISE = clamp( riseBudget × (STEP_GAP / visibleSpanX) , RISE_MIN, RISE_MAX )`  
   - 建议 **`RISE_MIN = 48`**（约 9.4°，防过平）  
   - 建议 **`RISE_MAX = 120`**（约 22.5°，防过陡叠卡）  
   - **参考点**：当 `staircaseViewH ≈ 620–720`（常见笔记本高度减去顶栏）时，应落在 **`STEP_RISE ≈ 80`（≈15°）**——与旧锁一致，作为默认手感锚点
6. 每次 resize / 切 Level remount 后重算 `STEP_RISE`、`DIAGONAL_SLOPE`，相机投影 `projectOntoDiagonal`、`camYFromX`、边界 `camXRange` **全部用当前 slope**，不要写死 15° / 80。
7. 构图验收：任一稳定视口下，可见段最左步偏画面**左下**、最右步偏**右上**；卡片不顶穿 PathHeader、不被底边裁掉主体。

> 旧代码常量 `DIAGONAL_DEGREES=15` / `STEP_RISE=80` 仅作**中位参考**，实现时改为上式；文档若仍写 15° 一律理解为「参考手感，非死锁」。

### 放置公式
- `platformAnchorLeft(i) = i × 290`
- `platformAnchorBottom(i) = 56 + i × STEP_RISE`（**rise 可变**）
- `zIndex = i + 1`（**右侧/后步叠在左侧之上**）
- 路径内容宽：`(count-1)×290 + 280`（与斜度无关）

### 卡片相对台面（重心在卡，不在台柱）
- 默认（Intro/Unit/Mile/Goal）：slot `translateY(6px)`——**仅**脚部微 tuck 进台面光晕，不可让光柱顶进卡面
- **仅 SC-Lesson**：`translateY(-10px)`——台面上方留 **≥10px** 空隙，保证卡面与台面/光柱分离、重心留在白卡中部
- 路径轴仍认 **platform 顶边中心**；改卡高不得改 `STEP_GAP`；`STEP_RISE` 只随视口变，不随单卡高度变

### 相机 / 拖拽
- 指针拖、滚轮：位移投影到**当前**对角线 `projectOntoDiagonal(dx,dy, slope)`；拖动时 `camX -= along`，滚轮 `camX += along`
- `camY = camStartY - camX × slope`（钳在 `[0, startY]`；slope 为自适应值）
- 松手吸附：snap 到最近 platform 水平中心
- 键盘：←/↑ 或 →/↓ 按 `STEP_GAP` snap；Home → `-VIEW_INSET`；End → `maxX`
- 初始焦点：`focusStairStepIndex` = 第一个 `card.status==='current'`，否则第一个 `available`，否则 `0`；相机水平居中该步
- 边界：`minX = -40`；`maxX` 由路径宽、视口宽、**当前**斜坡可走高度共同钳制，保证首末步可进入视野且不把相机抬出路径

### 非重叠
- 卡片宽 **260**，步距 **290**，槽 **280** → 相邻课卡水平不叠。
- 斜度变陡时仍靠 z-index（右压左）+ 水平步距保证可读；禁止为「好看」缩小 `STEP_GAP` 导致卡体重叠。

---

## 5. StairStep 组成与各类卡片

**命名锁：StairStep 阶梯步 = 卡片（或装饰） + platform 台面 + light beam 光柱**

路径顺序（`buildPath.js`）：
1. **SC-Intro**（始终 path index 0）
2. 对每个 Unit（第一个 Unit 前不加 Mile）：可选 **SD-Mile** → **SC-Unit** → 若干 **SC-Lesson**
3. 末尾 **SD-Goal**

### 5.0 视觉重心层级（Joe 优化 · 必须遵守）

**卡片 = 唯一视觉重心。** 台面与光柱（台柱）是「托住卡片的底座与氛围」，只能衬托，不能抢戏或挤占卡面。

| 层级 | 角色 | 规则 |
|---|---|---|
| 上 · Card | 主体 | 对比最强、信息最密；眼动落点应在卡面中部（徽标/标题/CTA 区） |
| 中 · Platform | 薄托盘 | 细、短、贴在卡底；高度锁 ≈31，勿加高加厚成第二色块 |
| 下 · Light beam | 氛围光 | 只在台面**以下**发光并向下衰减；不得冲进卡面、不得左右包住卡边形成「光框」 |

检查口诀：眯眼看一屏，先看见卡，再隐约看见台，光柱几乎融进背景。

### 5.1 Platform 台面（服从卡片）
- 素材：`assets/stair-platform.png`（640×70）
- CSS：宽 100%（槽内），`max-width: 300px`，`object-fit: contain`
- 显示高约 **31px**——保持「薄台」，禁止为装饰加高
- `z-index: 2`（压在光柱之上、在卡片之下）
- `filter: drop-shadow(0 4px 10px rgba(40,30,10,0.22))`——阴影宜软、短，勿做成厚重底座块
- **禁止**：台面纹理/高光强过卡面描边；台面左右探出盖住卡脚视觉；台面与卡之间负间距把卡「压进」台里（Lesson 至少留 10px 缝）

### 5.2 Light beam 光柱 / 台柱（服从卡片）
几何可参考旧实现，但**观感优先级高于旧透明度锁**：

- 容器参考：底宽 **400**、高 **800**；顶边有效宽 **≤ platform 宽 − 20**（约 **260**），避免顶宽大于卡宽形成光框
- 定位：贴齐 platform 底缘向下伸；`translateY` 若需上移，**上移后光柱顶仍须止于 platform 顶以下**，不得侵入 Lesson/Unit 卡面矩形
- 填充：旧值 `rgba(255,255,255,0.7)` 若导致卡底发白抢戏，降到 **≤ 0.45～0.55** 顶区，并靠 mask 更快衰减
- 顶左右圆角 **10px**；`backdrop-filter: blur(20px)` 可保留，但光晕 `box-shadow` 宜弱（旧 `0 0 28px rgba(255,255,255,0.35)` 可减半）
- mask：`linear-gradient(to bottom, …)` —— **上段已弱、下段更快淡出**（例如到底部 α≤0.15～0.25），让光柱融进 `#411C0A→#B39C6B` 背景
- clip：可用圆角梯形 path（旧 path 可作起点）或 `polygon(17.5% 0%, 82.5% 0%, 100% 100%, 0% 100%)`
- 渐进 5 段模糊：**关闭**
- **禁止**：光柱顶亮度 ≥ 卡面白底；光柱在卡左右形成对称亮边；光柱高度视觉上「顶」起卡片（卡片应像立在薄台上，而不是立在一根大灯柱上）


### 5.3 SC-Intro（260 宽）
- 奶油外框 + 内板（border `1px solid rgba(94,75,53,0.2)`，radius 13，padding 8，gap 8，居中）
- 标题：`#752403`，Noto Sans SC Bold **24/32**，nowrap
- 两枚 chip：`{units} units|单元`、`{lessons} lessons|节课`（Dosis 700 14，border `rgba(117,36,3,0.2)`）
- 正文：Jost 400 14，`#752403`；L2 用专属 intro 文案，其它 Level 用 generic
- 底部双柱脚：`pillar-post-16x54.png` ×2，区高 16、左右 padding 72
- 角标光晕：`halo.svg` 247×150

### 5.4 SC-Unit（宽 **260**）
结构：橙头 + 奶油身 + 双柱脚
- Header：橙渐变，padding 结构 `4` 外框；内 row padding `12×16×0`；白字 Unit 标签 + 右上箭头 `unit-arrow.svg`（`scaleX(-1) rotate(-45deg)`，16×19）
- 标题白字 20；EN 单行 ellipsis；ZH 最多 **3 行** clamp
- Body：奶油 + 内板 padding 12；meta「`N lessons · about M min` / 中文「N 节课 · 约 M min」」；描述最多 6 行
- locked：整卡 `opacity: 0.92`
- 点击：目前 stub（console），不进课壳

### 5.5 SC-Lesson（宽 **260**，min-height **280**，padding **20**，gap **16**）
- 外形：白底，`border-radius: **50px**`，描边 0.5 `#5e4b35`，同浮雕阴影
- 左上 **课号圆徽** 48×48：
  - **current**：外圈 `#d3e1fd`，内 `#3568bd` 边 + 蓝渐变 `#4f87f0→#1f51af`，白数字 Dosis 800 20
  - **available**：外 `#ebdcd7`，内白底 `#cab8b2` 边，数字 `#9b4f36`
  - **done**：绿圆 `#14ad5c→#00823d` + 右侧胶囊「Done/完成」+ tick 图标；圆与胶囊 `margin-right: -8px` 重叠
  - **locked**：灰圆 `#9da6af→#727b84` + 胶囊「Complete previous/需完成上一步」+ lock 图标
- 标题：褐 `#9b4f36`，min-h 50，**-webkit-line-clamp: 2**；EN Jost 600 20；ZH Douyin 700 20
- 时长：`{n} mins` / `{n} 分钟`（默认 min=20）
- CTA 全宽 pill：透明底、边与字 `#d97757`；padding `12×16`；Noto Sans SC Bold 20/28  
  - current / available → **Start / 开始**（二者 CTA 强度相同，不加强 current）  
  - done → **Review / 复习**  
  - locked → 文案仍可显示 Start/开始，但 disabled，灰边灰字 `#778089`
- **current 专属**：「You're here. / 你在这里。」蓝 pill 浮在卡顶上方（`translate(-50%, calc(-100% - 6px))`），底尖 triangle；卡面 `::after` **115° 对角扫光**，周期 **5s**（约 78%–98% 完成一次扫过）
- 资产目录：`assets/sc-lesson/`（角闪光、tick、lock、tip polygon 等，对齐 Figma `52:27529`）

### 5.6 SD-Mile
自上而下：装饰图位（**hidden 占位，勿臆造成稿**）→ 短句 cheer → M 旗
- 旗：44×44，radius 12，底 `#fff3d0`，边 `2px #e0b84a`，字 `#8a6010` 700 12；标签如 `M2`、`M3`…
- 短句：max-width 88，Jost 600 11，`#5a4010`，最多 2 行；优先 `decor.cheer(Zh)` → 下一 Unit 标题 → 默认「Unit complete! / 本单元完成！」
- 未完成：`aria-hidden`，不可点
- 已完成：可点；hover 旗 `scale(1.06)`

### 5.7 SD-Goal（路径终点，不可点）
- 金橙圆形 orb 56×56，`radial-gradient(#ffe566, #f0a020 70%)`，中心「★」
- 标签 Goal/目标；标题「Level complete / 本级完成」

---

## 6. 状态与视觉差异

### Lesson 四态（核心）
| 状态 | 可点进课 | 徽标 | CTA | 动效 |
|---|---|---|---|---|
| **current** | 是 | 蓝实心数字 | Start/开始 | 注意起伏 bob `2.2s` infinite + 扫光 `5s`；hover 暂停 bob、`scale(1.02)`，扫光不停 |
| **available** | 是 | 空心桃白数字 | Start/开始（同 current 强度） | hover `scale(1.02)`，260ms 弹性曲线 `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| **done** | 是（复习） | 绿数字+完成胶囊 | Review/复习 | 同 clickable hover |
| **locked** | 否 | 灰数字+锁胶囊 | 灰禁用 | 点击触发 **blocked bounce** `440ms`（下压再弹）；不导航 |

- transform-origin：课卡 `center bottom`
- `prefers-reduced-motion: reduce`：关闭 hover 缩放、bob、扫光、blocked bounce、Mile hover scale；彩纸也不播

### Unit
- 有 status class；locked 仅 opacity 0.92；**无** Lesson 那套 hover/扫光

### Showcase 规则（数据层）
- current 之后第一个本为 locked 的 Lesson 会被翻成 `available`，便于四态同屏展示

### Milestone 完成判定（`isMileCompleted`）
以下任一成立则 completed：
1. 该 Mile **之后**存在任一 Lesson 状态 ∈ `{done, current, in-progress, available}`；或
2. 到下一 Unit 之前的全部 Lesson 均为 `done`（且至少有一课）

---

## 7. 交互逻辑

1. **切 Level Tab** → 切换 `levelId`，StaircaseScene remount，重建该级 StairSteps，相机重新聚焦 current/available。
2. **斜向拖 / 滚轮 / 方向键** → 沿**当前自适应斜度**的对角线平移并松手吸附到最近步。
3. **点 Lesson CTA**（current/available/done）→ 进入课壳：  
   `?demo=writing-lesson-shell&lesson=<id>&lang=en|zh`  
   （设计复现时课壳可写成占位「进入下一课」。）
4. **点 locked Lesson** → 仅 blocked bounce，不跳转。
5. **点 Unit** → 原型为 stub（可记「打开单元详情·未接」）。
6. **点已完成 Mile** → 以元素中心为原点，播 **一次性** `@tsparticles/preset-confetti`（`startCount:50`，`rate.quantity:0`，`life.count:1`）；fullScreen zIndex 100；再次点击可重触发（取消上一次）；勿只传 `emitters.position` 否则会变成连续喷射。
7. **语言切换** → 整页单语切换；标题/ pill / CTA / cheer 同步；写入 `writing-ui-lang`。
8. 拖拽时若落点在 `button/a/input/...` 上则不启动拖移，避免与 CTA 冲突。

---

## 8. 文案与内容规则

### 单语
- `locale === 'zh'` 时优先 `titleZh` / `bodyZh` / `name` / `grade`；EN 优先 `title` / `nameEn` / `gradeShort`。
- 不在同一控件叠中英。

### Level 默认与 Tab 文案（样例数据）
| id | EN name | ZH name | gradeShort | units | lessons |
|---|---|---|---|---|---|
| L0 | Word & Sentence Seeds | ELL 起步 Word & Sentence Seeds | K-2 prep (ELL) | 6 | 18 |
| L1 | Sentence Builder | 句子搭建 Sentence Builder | G3 | 12 | 29 |
| L2 | Paragraph Starter | 段落入门 Paragraph Starter | G4 | 14 | 36 |
| L3 | Paragraph Developer | 段落进阶 Paragraph Developer | G5-6 | 13 | 39 |
| L4 | Essay Builder | 短文构建 Essay Builder | G7-8 | 13 | 43 |
| L4+ | Extension | 拓展包 Extension | G9-10 | 6 | 22 |

### 关键 UI 文案（copy.js）
| key | EN | ZH |
|---|---|---|
| pathLabel | Level path | 关卡路径 |
| introTitle | Paragraph Starter | 段落入门 |
| introBody | In Level 2 you learn to write one good paragraph… | 二级你将学会写好一个段落… |
| introBodyGeneric | Explore the units and lessons… | 在本级路径上探索单元与课程… |
| introUnits / introLessons | units / lessons | 单元 / 节课 |
| unitWord | Unit | Unit |
| startLesson / continueLesson / reviewLesson | Start / Continue / Review | 开始 / 继续 / 复习 |
| youreHere | You're here. | 你在这里。 |
| doneBadge / lockedBadge | Done / Complete previous | 完成 / 需完成上一步 |
| mileCheerDefault | Unit complete! | 本单元完成！ |
| goalLabel | Goal | 目标 |
| empty | No path for this level yet. | 该级别暂无路径。 |

### Unit 类型标签
- Skill → Skill unit；Genre → Genre unit；Process → Process unit；其它 → Writing unit  
- 中文界面 Unit 类型字仍可走数据/英文 typeLabel（「未锁 / 待确认」是否全面本地化）

### Milestone 短句优先级
`cheer/cheerZh` 自定义 → 紧随 Unit 标题 → `mileCheerDefault`

---

## 9. 验收细节清单（数字锁 · 须对齐）

### 画布 / 色
- [ ] 背景恰好 `linear-gradient(180deg, #411C0A 0%, #B39C6B 100%), #FFF`，无风景图
- [ ] 阶梯区自 `top:180px` 起；顶栏 z50；PathHeader z40；阶梯 z10

### 几何 / 斜度自适应
- [ ] `STEP_GAP=290` 锁死；`STEP_RISE` **由 `staircaseViewH` 与 `visibleSpanX` 算出**并 clamp 在约 **48～120**
- [ ] 中位手感：常见笔记本视口下 `STEP_RISE≈80`（≈15°）作参考，**非死锁**
- [ ] resize 后重算 slope，拖拽/滚轮/相机边界用同一 slope
- [ ] 可见段构图：左下 → 右上；卡不被顶栏/底边裁掉主体
- [ ] 槽宽 `PILLAR_SLOT=280`；platform 显示高约 **31**（保持薄台）
- [ ] `zIndex = index + 1`（右压左）
- [ ] Lesson 距台面 **≥10px** 缝；其它卡 tuck **+6px** 仅脚部，光柱不进卡面
- [ ] 光柱顶宽 ≤ 卡宽、顶部落在台面以下；填充/光晕弱于卡面；向下快速衰减
- [ ] 眯眼验收：先见卡、后见台、光柱融进背景（不抢视觉重心）
- [ ] 卡片宽 **260**（Lesson 另 min-height **280**、pad **20**、gap **16**、radius **50px**）
- [ ] 默认 Level **L2**；相机默认对准 current，否则 available

### 字体
- [ ] ZH 标题 Douyin Sans **20**（Unit/Lesson）；EN Lesson 标题 Jost SemiBold 20；EN Unit 标题 Dosis ExtraBold 20
- [ ] Badge 数字 Dosis ExtraBold 20；badge 文案 Noto Sans SC SemiBold 14
- [ ] CTA Noto Sans SC Bold **20 / lh28**，pad **12×16**
- [ ] Path 标题白字 40（窄屏 32）；pill 18

### 状态 / 动效
- [ ] 四态视觉齐全；current 与 available CTA **同强度**
- [ ] current：bob 2.2s + shine 5s；hover scale **1.02** 且暂停 bob
- [ ] locked：bounce 约 **440ms**；CTA disabled；标题/时长/CTA 色 `#778089`
- [ ] 完成 Mile：单击一次性 confetti（origin=元素中心）；incomplete 不可点
- [ ] `prefers-reduced-motion` 关闭动画与彩纸

### 交互 / 文案
- [ ] Tab 切换 Level；语言单语 EN/中文
- [ ] 斜向拖 + 松手吸附；滚轮/方向键可用
- [ ] Lesson 进课壳（或「进入下一课」占位）；Unit stub 可保留
- [ ] PathHeader pills：年级 + unit 数 + lesson 数
- [ ] Mile 短句在旗上方，max 88px 宽、最多 2 行

### 明确「未锁 / 待确认」
- [ ] 顶栏 Level Tab 最终视觉 chrome（现为白轨+蓝激活占位）
- [ ] SD-Mile 装饰插画成稿（现 hidden 占位）
- [ ] Unit 点击后的正式去向
- [ ] Unit typeLabel 中文是否全面替换
- [ ] SC-Intro 标题是否应对 ZH 强制 Douyin（现 CSS 为 Noto Sans SC 24）
- [ ] continueLesson 文案在 Lesson CTA 中未使用（代码固定 Start/Review）
- [ ] `CARD_CLEARANCE` / `RISE_MIN` / `RISE_MAX` 的最终调参（上表为建议起点）
- [ ] 光柱顶区目标透明度最终值（建议 ≤0.45～0.55，以不抢卡为准）

---

## 复现时请遵守

1. 先搭 **渐变舞台 + 顶栏 Tab + PathHeader + 斜向 rail**，再铺 StairStep（卡+台+光柱）。
2. **路径轴只认 platform 顶**；`STEP_GAP=290` 锁死；`STEP_RISE` 随阶梯视口高度自适应，不随单卡高度变。
3. **卡片是视觉重心**：台面保持薄托盘，光柱只在台下做弱氛围，禁止挤占或抢卡面。
4. 尺寸/色值以上表为准（尤其 260 / 290 / `#411C0A`→`#B39C6B`）；**15° / rise=80 只作中位参考**，实现用自适应公式。
5. 不确定处标「未锁 / 待确认」，不要编造插画或未出现的交互。