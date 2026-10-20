import { useState } from 'react';
import { BAButton, BAIcon, BAText, BANumber, BATaskProgress, BASegmentedControl, BATabs, BATabList, BATabPanel, type TaskProgressItem, type BAIconName } from '@big-academy/design-system';
import './DesignSystemPreview.css';

type FoundationTheme = 'neutral' | 'writing';

const tasks: TaskProgressItem[] = [
  { id: 't1', number: 1, label: 'Introduction', status: 'done' },
  { id: 't2', number: 2, label: 'Topic sentence', status: 'current' },
  { id: 't3', number: 3, label: 'Practice', status: 'available' },
  { id: 't4', number: 4, label: 'Assessment', status: 'locked' },
  { id: 't5', number: 5, label: 'Mastered skill', status: 'skipped' },
];

const colors = [
  ['Product action', '--ba-color-action-primary'],
  ['Primary text', '--ba-color-content-primary'],
  ['Content canvas', '--ba-color-surface-canvas'],
  ['Product shell', '--ba-color-background-secondary'],
  ['Focus ring', '--ba-color-focus'],
  ['Disabled surface', '--ba-color-disabled-surface'],
] as const;

/** Real design-system consumer and preview, independent from Alex's learner state.
 * All interactive samples use the same BA components used by Writing pages.
 * Visual treatment and missing font assets are not considered approved.
 */
export function DesignSystemPreview() {
  const [theme, setTheme] = useState<FoundationTheme>('writing');
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const [pressCount, setPressCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState(1);
  const [period, setPeriod] = useState('week');
  const [alignment, setAlignment] = useState('left');
  const [demoTab, setDemoTab] = useState('lesson');
  const [subtleTab, setSubtleTab] = useState('one');
  const zh = locale === 'zh';

  return (
    <main className="ba-showcase" data-ba-product={theme} lang={zh ? 'zh-CN' : 'en'}>
      <header className="ba-showcase__hero">
        <div>
          <p className="ba-showcase__eyebrow">Big Academy · System Preview / P1-B</p>
          <h1>{zh ? '可执行设计系统预览' : 'Design System Preview'}</h1>
          <p>{zh
            ? '相同的 React Aria 交互组件，只通过语义 Token 切换产品主题。'
            : 'The same React Aria–based components, themed through semantic Design Tokens.'}</p>
          <p className="ba-showcase__note">{zh ? '这是工程预览，具体视觉尺寸和字体仍待设计审核。' : 'Engineering preview — visual dimensions and font loading remain under review.'}</p>
        </div>
        <nav className="ba-showcase__links" aria-label="Demo navigation">
          <a href="/">{zh ? '体验 Writing 阶梯页' : 'Open Writing Staircase'} →</a>
          <a href="/?fixture=topbar">{zh ? '体验 Lesson Top Bar' : 'Open Lesson Top Bar'} →</a>
        </nav>
      </header>

      <div className="ba-showcase__toolbar">
        <div className="ba-showcase__switch" role="group" aria-label="Semantic theme">
          <BAButton variant={theme === 'writing' ? 'primary' : 'secondary'} onPress={() => setTheme('writing')}>Writing</BAButton>
          <BAButton variant={theme === 'neutral' ? 'primary' : 'secondary'} onPress={() => setTheme('neutral')}>Neutral</BAButton>
        </div>
        <BAButton variant="secondary" locale={locale} onPress={() => setLocale(zh ? 'en' : 'zh')}>{zh ? 'English' : '中文'}</BAButton>
      </div>

      <section className="ba-showcase__section" aria-labelledby="colors-title">
        <h2 id="colors-title">{zh ? '颜色语义映射' : 'Semantic Color Mapping'}</h2>
        <p>{zh ? '切换主题时，颜色只通过 CSS Variables 更换；Reading 颜色尚未定义。' : 'Switching themes changes CSS variables, not component implementations. Reading colors are not defined.'}</p>
        <div className="ba-showcase__swatches">
          {colors.map(([name, token]) => (
            <div className="ba-showcase__swatch" key={token}>
              <span className="ba-showcase__swatch-color" style={{ background: 'var(' + token + ')' }} />
              <strong>{name}</strong>
              <code>{token}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="ba-showcase__section" aria-labelledby="primitives-title">
        <h2 id="primitives-title">{zh ? 'Color System v0.2 · 80 个颜色' : 'Color System v0.2 · 80 Primitives'}</h2>
        <p>{zh ? '8 个色系，每个 10 级；所有色值读取批准的 CSS Tokens。' : 'Eight approved families × ten role levels. Swatches read directly from canonical CSS Tokens.'}</p>
        <div className="ba-showcase__palette-groups">
          {(['neutral', 'warm', 'brand', 'writing', 'success', 'danger', 'warning', 'info'] as const).map(family => (
            <div className="ba-showcase__palette" key={family}>
              <h3>{family}</h3>
              <div className="ba-showcase__palette-steps">
                {Array.from({ length: 10 }, (_, index) => {
                  const token = `--ba-color-${family}-${index + 1}`;
                  return (
                    <div className="ba-showcase__palette-step" key={token}>
                      <span className="ba-showcase__palette-chip" style={{ background: `var(${token})` }} title={token} />
                      <span>{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ba-showcase__section" aria-labelledby="spatial-title">
        <h2 id="spatial-title">{zh ? 'Spatial v0.2 · 间距尺度' : 'Spatial v0.2 · Spacing Scale'}</h2>
        <p>{zh ? '4px 基础单位、8px 主要节奏已批准；以下具体数值仍为候选。' : '4px base and 8px primary rhythm approved. Exact scale values remain candidates.'}</p>
        <div className="ba-showcase__spacing-gallery">
          {([0, 1, 2, 3, 4, 6, 8, 12, 16] as const).map((step) => (
            <div className="ba-showcase__spacing-row" key={step}>
              <code>--ba-space-{step}</code>
              <span className="ba-showcase__spacing-measure" style={{ width: 'var(--ba-space-' + step + ')' }} />
              <span className="ba-showcase__spacing-number">{step * 4}px</span>
            </div>
          ))}
        </div>
        <p className="ba-showcase__small-label">{zh ? '组件已应用：BAButton 内边距 / 内容间距、BATaskProgress 项目间距。现有视觉尺寸不变。' : 'Applied without changing existing sizes: BAButton internal padding/gap and BATaskProgress item gap.'}</p>
      </section>

      <section className="ba-showcase__section" aria-labelledby="shape-title">
        <h2 id="shape-title">{zh ? 'Shape & Radius v0.1 · 圆角尺度' : 'Shape & Radius v0.1 · Candidate Scale'}</h2>
        <p>{zh ? '选择逻辑已批准；具体半径仍为候选，不自动修改现有组件。' : 'Radius selection principles approved; numeric values remain candidates. Existing components are not restyled.'}</p>
        <div className="ba-showcase__radius-gallery">
          {(['0','4','6','8','12','16','24','full','circle'] as const).map(size => (
            <div key={size} className="ba-showcase__radius-item">
              <span className={'ba-showcase__radius-shape' + (size === 'circle' ? ' ba-showcase__radius-shape--circle' : '')} style={{ borderRadius: 'var(--ba-radius-' + size + ')' }} />
              <code>--ba-radius-{size}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="ba-showcase__section" aria-labelledby="motion-title">
        <h2 id="motion-title">{zh ? 'Motion v0.1 · 临时 Spring 参数' : 'Motion v0.1 · Interim Spring Presets'}</h2>
        <p>{zh ? '六组 Spring 参数已写入 CSS；还未实现动画适配器，具体动效未获视觉批准。' : 'Six spring groups are available as CSS tokens. No runtime adapter or approved choreography yet.'}</p>
        <div className="ba-showcase__motion-gallery">
          {([
            ['bouncy', 'Small control feedback'],
            ['snappy', 'Panel / popover reveal'],
            ['gentle', 'Brief achievement'],
            ['heavy-snap', 'Drag release / snap'],
            ['bubble-enter', 'Bubble enter; mass unspecified'],
            ['modal-enter', 'Modal enter; mass unspecified']
          ] as const).map(([name, purpose]) => (
            <div key={name} className="ba-showcase__motion-row">
              <strong>{name}</strong><span>{purpose}</span>
              <code>--ba-motion-spring-{name}-stiffness</code>
            </div>
          ))}
        </div>
      </section>

      <section className="ba-showcase__section" aria-labelledby="typography-title">
        <h2 id="typography-title">{zh ? 'Typography · 字体语义角色' : 'Typography · Semantic Roles'}</h2>
        <p>{zh ? '字体家族已确定；字号和行高仍为候选。Douyin 字体资源尚未验证，因此中文标题可能回退。' : 'Typeface assignments are approved; size/line-height are candidates. Douyin font assets are not yet verified, so fallback may appear.'}</p>
        <div className="ba-showcase__type-specimens">
          <div><code>display</code><BAText as="h3" textRole="display">{zh ? '想象力从这里开始' : 'Write your next story'}</BAText></div>
          <div><code>heading</code><BAText as="h3" textRole="heading">{zh ? '学习如何表达观点' : 'Learning to express ideas'}</BAText></div>
          <div><code>body</code><BAText as="p" textRole="body">{zh ? '阅读提示，然后按步骤写出完整的段落。' : 'Read the instructions and build a paragraph one step at a time.'}</BAText></div>
          <div><code>control</code><BAText textRole="control">{zh ? '继续学习 · 检查答案' : 'Continue · Check answer'}</BAText></div>
          <div><code>supporting</code><BAText textRole="supporting">{zh ? '提示和帮助文字' : 'Helpful supporting text'}</BAText></div>
          <div><code>numeral · Dosis ExtraBold 800</code><BANumber className="ba-showcase__digits">0123456789</BANumber></div>
        </div>
      </section>

      <section className="ba-showcase__section" aria-labelledby="icons-title">
        <h2 id="icons-title">{zh ? 'BAIcon · Iconoir 官方图标' : 'BAIcon · Iconoir Foundation'}</h2>
        <p>{zh ? '第一批 8 个官方 Iconoir regular 图标。装饰图标隐藏于屏幕阅读器，功能图标提供文字标签。' : 'First eight official Iconoir regular glyphs. Decorative icons are hidden from screen readers; meaningful standalone icons provide names.'}</p>
        <div className="ba-showcase__icon-gallery">
          {(['check', 'lock', 'arrow-left', 'menu', 'globe', 'book', 'warning-circle', 'info-circle'] as BAIconName[]).map(name => (
            <div className="ba-showcase__icon-card" key={name}>
              <BAIcon name={name} size={24} decorative={false} label={name.replaceAll('-', ' ')} />
              <code>{name}</code>
            </div>
          ))}
        </div>
        <p className="ba-showcase__small-label">{zh ? '真实应用：LessonTopBar 返回图标、BATaskProgress 完成与锁定图标。' : 'Real usage: LessonTopBar back action and BATaskProgress done/locked markers.'}</p>
      </section>

      <section className="ba-showcase__section" aria-labelledby="figma-controls-title">
        <h2 id="figma-controls-title">{zh ? 'Figma · Button & Segmented Control' : 'Figma · Button & Segmented Control'}</h2>
        <p>{zh ? '源自设计稿 30:2 和 806:3。可直接操作；除另行注明外，组件样式按照 Figma V1/V2。' : 'Directly mapped from Figma nodes 30:2 and 806:3. Live interactions, size/shape/state comparisons.'}</p>
        <div className="ba-showcase__figma-matrix" data-testid="figma-button-matrix">
          {([36, 50, 70, 90] as const).map(size => (
            <div className="ba-showcase__figma-matrix-row" key={size}>
              <strong>{size}px</strong>
              <BAButton variant="primary" size={size} onPress={() => setPressCount(n => n+1)}>{zh ? '主要按钮' : 'Primary'}</BAButton>
              <BAButton variant="secondary" size={size}>{zh ? '次要按钮' : 'Secondary'}</BAButton>
              <BAButton variant="tertiary" size={size}>{zh ? '三级按钮' : 'Tertiary'}</BAButton>
              <BAButton variant="primary" radius="standard" size={size}>{zh ? '标准圆角' : 'Standard'}</BAButton>
            </div>
          ))}
        </div>
        <h3>{zh ? '图标、危险操作和状态' : 'Icon content, destructive actions and states'}</h3>
        <div className="ba-showcase__button-group">
          <BAButton variant="primary" size={50} leadingIcon={<BAIcon name="arrow-left"/>}>Back</BAButton>
          <BAButton variant="secondary" size={50} trailingIcon={<BAIcon name="check"/>}>Continue</BAButton>
          <BAButton iconOnly size={50} variant="primary" aria-label="Open menu"><BAIcon name="menu"/></BAButton>
          <BAButton iconOnly radius="standard" variant="secondary" size={50} aria-label="Go back"><BAIcon name="arrow-left"/></BAButton>
          <BAButton variant="primary" size={50} intent="destructive">Delete</BAButton>
          <BAButton variant="secondary" size={50} intent="destructive">Remove</BAButton>
          <BAButton variant="primary" size={50} disabled>Disabled</BAButton>
          <BAButton variant="primary" size={50} busy busyLabel="Working">Processing</BAButton>
        </div>
        <h3>{zh ? '分段选择 · 同页单选（非 Tabs）' : 'Segmented Control · local single selection (not Tabs)'}</h3>
        <div className="ba-showcase__segmented-examples">
          <div>
            <span>Strong · Full · Hug</span>
            <BASegmentedControl aria-label="Period" size={50} emphasis="strong" radius="full"
              selectedKey={period} onSelectionChange={setPeriod}
              options={[{id:'day',label:'Day'},{id:'week',label:'Week'},{id:'month',label:'Month'},{id:'year',label:'Year'}]}/>
            <small data-testid="selected-period">Selected: {period}</small>
          </div>
          <div>
            <span>Subtle · Standard · Equal</span>
            <BASegmentedControl aria-label="Alignment" size={50} emphasis="subtle" radius="standard" distribution="equal"
              selectedKey={alignment} onSelectionChange={setAlignment}
              options={[
                {id:'left',label:'Left',icon:<BAIcon name="arrow-left" size={18}/>},
                {id:'center',label:'Center',icon:<BAIcon name="check" size={18}/>},
                {id:'right',label:'Right',icon:<BAIcon name="menu" size={18}/>},
              ]}/>
          </div>
          <div>
            <span>Icon only · 36px</span>
            <BASegmentedControl aria-label="Reading control" size={36} emphasis="strong" distribution="hug"
              options={[
                {id:'book',icon:<BAIcon name="book" size={18}/>,accessibleLabel:'Read'},
                {id:'info',icon:<BAIcon name="info-circle" size={18}/>,accessibleLabel:'Information'},
                {id:'globe',icon:<BAIcon name="globe" size={18}/>,accessibleLabel:'Language'},
              ]}/>
          </div>
          <div>
            <span>Large · 70px</span>
            <BASegmentedControl aria-label="Display" size={70} emphasis="strong" radius="standard"
              options={[{id:'list',label:'List'},{id:'board',label:'Board'}]}/>
          </div>
        </div>
        <p className="ba-showcase__small-label">{zh ? 'Button 点击量：' : 'Button presses: '}<strong data-testid="figma-press-count">{pressCount}</strong></p>
      </section>

      <section className="ba-showcase__section" aria-labelledby="elevation-title">
        <h2 id="elevation-title">Elevation · Figma Effect Styles</h2>
        <p>{zh ? 'Figma 15:5 的原始四级阴影，使用全局 Effect Tokens；背景模糊与阴影分别处理。' : 'The original four effect styles from Figma 15:5 — consumed through shared tokens, not hardcoded component shadows.'}</p>
        <div className="ba-showcase__elevation-gallery">
          {(['100','200','300','400'] as const).map(level=>
            <div key={level} className="ba-showcase__elevation-card"
              data-elevation={level} style={{boxShadow:'var(--ba-elevation-'+level+')'}}>
              <strong>{level}</strong><code>Elevation/{level}</code>
            </div>)}
          <div className="ba-showcase__blur-scene" data-testid="backdrop-blur-scene">
            <div className="ba-showcase__blur-card">
              <strong>20</strong><code>Blur/Background/20</code>
            </div>
          </div>
        </div>
        <p className="ba-showcase__small-label">{zh ? '注意：Button 底部的 3px 描边不属于 Elevation 阴影。' : 'Button 3px lower stroke remains distinct from generic Elevation tokens.'}</p>
      </section>

      <section className="ba-showcase__section" aria-labelledby="tabs-figma-title">
        <h2 id="tabs-figma-title">BATabs · Segmented visual parity</h2>
        <p>{zh ? '与 Segmented 使用相同的容器、圆角、字号与选中背景，但 Tabs 负责切换面板。' : 'Exactly the same segmented visual geometry, but true tabs switch a labelled panel rather than local radio selection.'}</p>
        <BATabs selectedKey={demoTab} onSelectionChange={setDemoTab} className="ba-showcase__demo-tabs">
          <BATabList selectedKey={demoTab} size={50} emphasis="strong" radius="full"
            aria-label="Writing demo tabs" options={[
              {id:'lesson',label:zh?'课程':'Lesson'},
              {id:'notes',label:zh?'笔记':'Notes'},
              {id:'review',label:zh?'回顾':'Review'}
            ]}/>
          <BATabPanel id={demoTab} className="ba-showcase__demo-tabpanel">
            <strong data-testid="demo-tab-value">{demoTab}</strong>
            <p>{demoTab==='lesson'?(zh?'这里是课程内容。':'Lesson content panel.')
              :demoTab==='notes'?(zh?'这里是笔记内容。':'Notes content panel.')
              :(zh?'这里是回顾内容。':'Review content panel.')}</p>
          </BATabPanel>
        </BATabs>
        <div className="ba-showcase__tab-variants">
          <div><strong>Subtle · Standard · 36</strong>
            <BATabs selectedKey={subtleTab} onSelectionChange={setSubtleTab}>
              <BATabList selectedKey={subtleTab} size={36} emphasis="subtle" radius="standard"
                aria-label="Subtle tab styling" options={[{id:'one',label:'One'},{id:'two',label:'Two'}]}/>
              <BATabPanel id={subtleTab}><span>Tab visual example: {subtleTab}</span></BATabPanel>
            </BATabs>
          </div>
        </div>
      </section>

      <section className="ba-showcase__section" aria-labelledby="components-title">
        <h2 id="components-title">{zh ? '交互组件 · React Aria' : 'Interactive Components · React Aria'}</h2>
        <p>BA-UI-001 · BAButton</p>
        <div className="ba-showcase__button-group">
          <BAButton variant="primary" locale={locale} onPress={() => setPressCount(n => n + 1)}><BAIcon name="check" size={18} />{zh ? '主要按钮' : 'Test primary'}</BAButton>
          <BAButton variant="secondary" locale={locale} onPress={() => setPressCount(n => n + 1)}>{zh ? '次级按钮' : 'Secondary'}</BAButton>
          <BAButton variant="ghost" locale={locale} onPress={() => setPressCount(n => n + 1)}>{zh ? '文字按钮' : 'Ghost'}</BAButton>
          <BAButton disabled locale={locale}>{zh ? '禁用' : 'Disabled'}</BAButton>
          <BAButton busy locale={locale}>{zh ? '处理中' : 'Busy'}</BAButton>
        </div>
        <p className="ba-showcase__presses" role="status">{zh ? '点击次数：' : 'Button presses: '}<strong data-testid="press-count">{pressCount}</strong></p>
        <div className="ba-showcase__divider" />
        <p>BA-UI-006 · BATaskProgress</p>
        <div className="ba-showcase__progress">
          <BATaskProgress tasks={tasks} activeIndex={selectedTask} canOpen={i => i !== 3} onNavigate={setSelectedTask} locale={locale} />
        </div>
        <p className="ba-showcase__small-label">{zh ? '示例课程任务（不修改真实学习进度）' : 'Sample learning task states (real course progress is untouched)'}</p>
      </section>
      <footer className="ba-showcase__footer">
        <strong>Design Tokens + Big Academy Components + React Aria + PRODUCT.md + DESIGN.md</strong>
        <p>{zh ? '下一个阶段：补齐通用组件，再将同一组组件用于 Writing 的实际页面。' : 'Next: extend shared controls and apply these same components to the actual Writing pages.'}</p>
      </footer>
    </main>
  );
}
