# Component Library R2 — 运行与评审证据

日期：2026-10-26（Asia/Shanghai）。技术实现可提交设计评审；不是视觉批准记录。

## 实际结果

- `npm run check:docs`：通过。
- `npm run typecheck`：通过（Design System、Writing、pilot stories/tests、Library）。
- `npm test`：16 文件 / 77 测试通过，包含课程状态回归、WordGrid 维度组合、分享恢复、自由拼句撤销、Loading/Locked 阻止激活、鼠标按下/抬起、触摸 pointer 序列和键盘。
- `npm run build`：通过（Design System、Writing、Storybook、Library）。Writing/Storybook 保留大 chunk 提示；不是构建失败。
- 使用项目 `.local/node-v22/bin` 的 Node/npm 运行上述原始命令，无新增框架、无依赖安装。
- 本机 in-app Chromium 实际访问 http://127.0.0.1:6007/。全新标签页依次打开六个组件，控制台 error/warn 为 0。开发过程中旧 HMR 错误不作为最终结果；最终复测使用全新页面。

## 浏览器功能检查

| 模块 | 实际检查与结果 |
| --- | --- |
| 颜色 | 186 条颜色/效果声明，含 80 个 Primitive 和主题覆盖；筛选 Writing action 并复制，结果为 `var(--ba-color-writing-7)` → `#b25415`，保留 `[data-ba-product="writing"]` 作用域。浅/深背景并列展示。 |
| Button | 四类与 36/50/70/90 尺寸总览；320px 图标+长文本满宽按钮不溢出，Enter 产生操作回执；Disabled/Loading 不触发由自动化检查覆盖。 |
| Tabs | L0 → ArrowRight 切换 L1；10 个长标签在 320px 中用 End 选择 L9，滚动保留在组件内部。浅/深方案可预览。选中面高度44px，轨道50px，内部2px留白加1px边框。 |
| Choice | 中文多选、Space/点击选择、提交示例；外层 padding 四边6px；Disabled opacity=1，使用 disabled surface/content/border；长中文390px不溢出。 |
| Lesson | Completed/Current/Available/Locked 四状态；Current 外部进度切换 Continue 并实际触发；四卡高度310px，标题槽90px，CTA可视宽219px=内容区219px，70px高度保留。768px现有阶梯组合不溢出。Locked onEnter 不调用有测试覆盖。 |
| WordGrid A | Space 选择/再次取消；Tab 后聚焦 love，data-focus-visible=true、2px 实线焦点环；单标签显示/隐藏；Disabled 按钮不可激活。 |
| WordGrid B | 顺序点击 We / love / gardens / .，检查为整句正确；移除 love 后检查为错误；重置可恢复。Used 词卡仍为可用语义，不对每个已用词独立判题。 |
| WordGrid C / D | 标点选择；最小标点点击宽44px、高至少50px；Emoji 可用 Enter 选择。 |
| WordGrid E | 320px 中英文完整句子换行，长英文卡高164px、中文116px；正确反馈与选择分离，文本无裁切。 |
| WordGrid F | 两个 Tab 分别选择，返回保留；复制链接并重新加载后保留选择。 |
| WordGrid G | Hint 与 Shown Answer 分开；展示系统答案不计用户正确，不增加已选数。 |
| WordGrid H | 长连续字符、混合内容、10个长Tab；修复预览grid子项固有最小宽度撑宽问题，见响应式记录。 |
| 分享 | 场景复制、重新加载恢复、反馈摘要复制；R2候选标记加入摘要，避免将基线Approved误读成新状态批准。 |

## 响应式

实际浏览器宽度：320、390、560、768、834、1440px。WordGrid H 压力场景均满足 document.scrollWidth = viewport，预览内容无额外溢出、词卡无内部文字溢出。只有标签栏按设计内部横向滚动。原始测量：[responsive.json](responsive.json)。

320px 预览框实际287px、内部内容255px，长句卡231px；不以560px宽画布冒充手机排版。固定宽度选项仍允许设计师主动以原尺寸横向查看。

## 复现场景

- [颜色](http://127.0.0.1:6007/?view=foundations)
- [按钮类型/布局](http://127.0.0.1:6007/?component=button) → 展开“样式、尺寸与内容总览”。
- [Tabs 深色长标签](http://127.0.0.1:6007/?component=tabs&background=dark&tabCount=10&sample=long&width=320)
- [Choice 禁用中文](http://127.0.0.1:6007/?component=choice&mode=state&state=disabled&locale=zh&material=zh&sample=long)
- [Current Continue](http://127.0.0.1:6007/?component=lesson&mode=state&state=currentStart&currentAction=continue&sample=long&composition=terrace)
- [WordGrid 自由拼句](http://127.0.0.1:6007/?component=words&wordScenario=B)
- [WordGrid 窄屏句子](http://127.0.0.1:6007/?component=words&wordScenario=E&wordContent=sentence&width=320)
- [WordGrid 压力](http://127.0.0.1:6007/?component=words&wordScenario=H&wordContent=mixed&wordCount=10&wordTabs=show&sample=long&width=320)

## 截图索引

截图按用户要求仅保留在本地验收工作区，不纳入Git分支或PR。以下相对图片链接只在该工作区可用；其他检出请通过上方场景重现。截图不是设计稿；完整页截图高度不等于视口高度。

| 内容 | 证据 |
| --- | --- |
| 网站整体 | [overview.jpg](overview.jpg) |
| 颜色及作用域 | [colors-overview.jpg](colors-overview.jpg)、[colors-scopes.jpg](colors-scopes.jpg) |
| 按钮类型/尺寸/状态 | [button-desktop.jpg](button-desktop.jpg)、[button-states.jpg](button-states.jpg)、[button-mobile.jpg](button-mobile.jpg) |
| Tabs Before / After | [tabs-before.jpg](tabs-before.jpg)、[tabs-after.jpg](tabs-after.jpg) |
| Tabs Light / Dark / Overflow | [tabs-light-dark.jpg](tabs-light-dark.jpg)、[tabs-desktop.jpg](tabs-desktop.jpg)、[tabs-overflow-320.jpg](tabs-overflow-320.jpg) |
| Choice | [choice-desktop.jpg](choice-desktop.jpg)、[choice-mobile.jpg](choice-mobile.jpg) |
| Lesson 四状态/组合 | [lesson-desktop.jpg](lesson-desktop.jpg)、[lesson-terrace-768.jpg](lesson-terrace-768.jpg) |
| WordGrid 内容与状态 | [words-content.jpg](words-content.jpg)、[words-desktop.jpg](words-desktop.jpg)、[words-shown.jpg](words-shown.jpg)、[words-build.jpg](words-build.jpg) |
| WordGrid 窄屏 | [words-sentence-320.jpg](words-sentence-320.jpg)、[words-stress-320.jpg](words-stress-320.jpg)、[words-punctuation-390.jpg](words-punctuation-390.jpg)、[words-stress-768.jpg](words-stress-768.jpg) |
| 原有顶栏保留 | [topbar-desktop.jpg](topbar-desktop.jpg) |

## 待批准与已知限制

1. Outline、Dark Tabs、Tabs/Choice间距、课程Current强调与三行组合、WordGrid扩展状态：Pending Design Review / Approval。课程三行标题为显式 opt-in；Writing路径默认两行保持原样。
2. Choice 既有正确态 `#14ae5c` + 白字对比度约2.9:1，未达到普通文字4.5:1；本轮没有擅改批准颜色。需要设计师决定调整颜色还是文字搭配。不要将该状态宣布为AA通过。
3. Disabled保留不可交互语义；弱化颜色不作为普通文字对比度达标声明。深色画布是对比观察工具，按钮既有变体并非整套批准深色主题。
4. WordGrid基线桃色来自现有实现，移入同值Token。旧青色候选Token保留并在颜色页说明冲突；未虚构 Reading 主题。
5. 字体Douyin授权资产未接入；Google字体加载仍依赖网络。现有装饰是草地阶梯LandscapeTerrace，没有重新设计云朵。
6. 验证了点击目标尺寸和模拟触摸pointer事件；未连接手机/平板硬件，不能声称真机触摸通过。未运行完整Writing Playwright课程流程或完整axe审计；本轮完成针对组件库的浏览器检查与上述自动化回归，旧E-01三项失败记录仍保留在HANDOFF。
7. 未部署Vercel，未合并main。交互示例不保存学习成绩，也不会把反馈草稿写成设计批准。
