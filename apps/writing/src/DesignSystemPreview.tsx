import { useState } from 'react';
import { BAButton, BATaskProgress, type TaskProgressItem } from '@big-academy/design-system';
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
  ['Content canvas', '--ba-color-surface-primary'],
  ['Product shell', '--ba-color-surface-shell'],
  ['Focus ring', '--ba-color-focus-visible'],
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

      <section className="ba-showcase__section" aria-labelledby="typography-title">
        <h2 id="typography-title">{zh ? '文字系统' : 'Typography Roles'}</h2>
        <div className="ba-showcase__type-grid">
          <div>
            <span className="ba-showcase__small-label">Heading · Dosis 800 / Douyin</span>
            <h3 className="ba-showcase__type-heading">{zh ? '探索写作的乐趣' : 'Learn to Write'}</h3>
          </div>
          <div>
            <span className="ba-showcase__small-label">Body · Jost / Noto Sans SC</span>
            <p>{zh ? '清晰的文字让学习更加轻松。' : 'Clear, readable text makes learning feel effortless.'}</p>
          </div>
          <div>
            <span className="ba-showcase__small-label">UI Digits · Dosis 800</span>
            <strong className="ba-showcase__digits">0123456789</strong>
          </div>
        </div>
      </section>

      <section className="ba-showcase__section" aria-labelledby="components-title">
        <h2 id="components-title">{zh ? '交互组件 · React Aria' : 'Interactive Components · React Aria'}</h2>
        <p>BA-UI-001 · BAButton</p>
        <div className="ba-showcase__button-group">
          <BAButton variant="primary" locale={locale} onPress={() => setPressCount(n => n + 1)}>{zh ? '主要按钮' : 'Test primary'}</BAButton>
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
