import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BAButton, BAIcon } from '@big-academy/design-system';
import { catalog, contractFor, defaultScene, readScene, sceneSearch, stateNames, statusFor, type Scene, type Entry } from './catalog';
import { Preview } from './Preview';
import { Code } from './Code';
import { Colors } from './Colors';
import { R2Controls, ScenarioLinks } from './R2Controls';
import { Showcase } from './Showcase';
declare const __BA_LOCAL_REVIEW_IMAGES__: boolean;
const hasLocalReviewImages = typeof __BA_LOCAL_REVIEW_IMAGES__ !== 'undefined' && __BA_LOCAL_REVIEW_IMAGES__;

const reviewItems = ['默认与反馈状态', '键盘与焦点', '窄屏与长文本', '中英文与字体', '减少动态效果'];
function Field({ label, value, onChange, children }: { label: string; value: string | number; onChange: (v: string) => void; children: ReactNode }) {
  return <label className="field"><span>{label}</span><select aria-label={label} value={value} onChange={e => onChange(e.target.value)}>{children}</select></label>;
}
function Badge({ entry }: { entry: Entry }) {
  const status = statusFor(entry);
  return <span className="badge" data-approved={status.approved}>{status.approved ? <BAIcon name="check" size={14} /> : <span className="status-dot" />}{status.label}</span>;
}
function Detail({ scene, update, openEntry }: { scene: Scene; update: (patch: Partial<Scene>) => void; openEntry: (entry: Entry) => void }) {
  const entry = catalog.find(c => c.key === scene.component)!;
  const contract = contractFor(entry);
  const [reset, setReset] = useState(0);
  const [compare, setCompare] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [manualCopy, setManualCopy] = useState('');
  const [width, setWidth] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = frame.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setWidth(Math.round(el.getBoundingClientRect().width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setMessage('已复制'); setManualCopy(''); }
    catch { setMessage('请从下方文本框手动复制'); setManualCopy(text); }
  }
  const url = new URL(sceneSearch(scene), window.location.href).href;
  const resetScene = () => { update({ ...defaultScene, component: entry.key, state: entry.states[0] }); setReset(r => r + 1); };
  const previewKey = `${entry.key}-${scene.mode}-${scene.state}-${scene.locale}-${scene.choice}-${scene.sample}-${reset}`;
  return <>
    <div className="breadcrumb">组件 <span>/</span> {entry.category} <span>/</span> {entry.name}</div>
    <header className="detail-heading">
      <div><div className="eyebrow">{entry.id} <span>·</span> {entry.category}</div><h1>{entry.name}<span lang="en">{entry.en}</span></h1><p className="lead">{entry.description}</p></div>
      <Badge entry={entry} />
    </header>
    <p className="review-boundary">R2 · Updated / Pending Review{scene.component === 'words' ? ' · 原桃色词库为 Existing / Approved；新增状态为 Candidate / Pending Approval' : ' · 技术完成不等于视觉批准'}</p>
    <ScenarioLinks scene={scene} update={update}/>
    <section className="preview-panel" aria-label="组件预览">
      <div className="preview-toolbar"><div><span className="live-dot" />实时预览 <span className="subtle">/ 真实组件</span></div><div className="toolbar-actions"><button className="text-action" onClick={resetScene}>重置场景</button><button className="text-action" onClick={() => void copy(url)}>复制场景链接 <span aria-hidden="true">↗</span></button></div></div>
      <div className="preview-scroll" role="region" aria-label="预览画布，固定宽度时可横向滚动" tabIndex={0}>
        <div ref={frame} className="preview-frame" style={{ '--library-preview-width': scene.width === 'fit' ? '100%' : `${scene.width}px` } as CSSProperties}
          data-background={scene.background} lang={scene.locale === 'zh' ? 'zh-CN' : 'en'} data-ba-product="writing" data-reduce={scene.motion === 'reduce'}>
          <Preview key={previewKey} scene={scene} onSelected={selected => update({ selected, answerPhase: 'open' })} update={update} />
        </div>
      </div>
      <div className="canvas-caption"><span>{width ? `${width} px` : '自适应'} 画布 · 100% 原始比例</span><span>{scene.mode === 'live' ? '可直接点击 / 键盘操作' : '视觉状态展示'}</span></div>
      <div className="controls-bar">
        <div className="mode-switch" role="group" aria-label="预览方式">
          <button aria-pressed={scene.mode === 'live'} onClick={() => update({ mode: 'live', selected: [], answerPhase: 'open' })}>交互体验</button>
          <button aria-pressed={scene.mode === 'state'} onClick={() => update({ mode: 'state' })}>查看状态</button>
        </div>
        {scene.mode === 'state' && <Field label="视觉状态" value={scene.state} onChange={state => update({ state })}>{entry.states.map(s => <option key={s} value={s}>{stateNames[s]}</option>)}</Field>}
        <Field label="组件界面" value={scene.locale} onChange={locale => update({ locale: locale as Scene['locale'] })}><option value="en">English</option><option value="zh">中文</option></Field>
        <Field label="容器宽度" value={scene.width} onChange={value => update({ width: value as Scene['width'] })}><option value="fit">自适应</option>{['320', '390', '560', '768', '834', '1440'].map(v => <option key={v} value={v}>{v} px</option>)}</Field>
        {scene.component === 'choice' && <Field label="选择方式" value={scene.choice} onChange={value => update({ choice: value as Scene['choice'], selected: [] })}><option value="single">单选</option><option value="multiple">多选</option></Field>}
        {['button', 'tabs'].includes(scene.component) && <Field label="控件尺寸" value={scene.size} onChange={v => update({ size: Number(v) as Scene['size'] })}>{[36, 50, 70, 90].map(v => <option key={v} value={v}>{v} px</option>)}</Field>}
        {scene.component === 'button' && <Field label="层级" value={scene.variant} onChange={v => update({ variant: v as Scene['variant'] })}><option value="primary">主要</option><option value="secondary">次要</option><option value="outline">Outline · 候选</option><option value="ghost">Ghost</option><option value="tertiary">Tertiary · 兼容名称</option></Field>}
        {['choice', 'lesson', 'topbar', 'button', 'tabs', 'words'].includes(scene.component) && <Field label="文本样例" value={scene.sample} onChange={v => update({ sample: v as Scene['sample'] })}><option value="standard">标准文本</option><option value="long">长文本</option></Field>}
        <R2Controls scene={scene} update={update}/>
        <Field label="动态效果" value={scene.motion} onChange={v => update({ motion: v as Scene['motion'] })}><option value="system">跟随系统</option><option value="reduce">减少动态</option></Field>
      </div>
    </section>
    <div className="preview-footnote"><BAIcon name="info-circle" size={17} /><span>{scene.component === 'choice' ? '界面与内容语言分别切换；中文材料是排版示例。示例判题不写入课程成绩。' : '此处为独立组件示例，操作不会写入学习进度。'} 固定宽度测试保持实际尺寸；画布不足时可横向滚动。</span></div>
    <p role="status" className="copy-status">{message}</p>
    {manualCopy && <label className="manual-copy">手动复制<textarea readOnly value={manualCopy} onFocus={e => e.target.select()} /></label>}
    <Showcase scene={scene} update={update}/>
    <div className="section-heading"><h2>深入了解</h2><span>需要时再展开，当前预览始终保留。</span></div>
    <div className="disclosures">
      <details onToggle={e => setCompare(e.currentTarget.open)}><summary><span><b>01</b> 全部状态对比</span><small>{entry.states.length} 种状态</small></summary>
        {compare && <div className="state-grid">{entry.states.map(state => <article className="state-tile" key={state}><h3>{stateNames[state]}</h3><div className="mini-scroll" data-ba-product="writing" lang={scene.locale === 'zh' ? 'zh-CN' : 'en'} data-reduce={scene.motion === 'reduce'}><Preview key={`${previewKey}-${state}`} scene={{ ...scene, mode: 'state', state }} /></div><button className="text-action" onClick={() => { update({ mode: 'state', state }); document.querySelector('.preview-panel')?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}>在主画布查看 →</button></article>)}</div>}
      </details>
      <details><summary><span><b>02</b> 使用规范与接口</span><small>{entry.id}</small></summary><div className="disclosure-body">
        <h3>组件结构</h3><p>{entry.anatomy}</p><p>{contract.layoutOwner}</p>
        <h3>合同要求</h3><ul>{contract.requirements?.map(item => <li key={item}>{item}</li>)}</ul>
        <h3>Props</h3><div className="table-scroll"><table><thead><tr><th>属性</th><th>类型 / 说明</th></tr></thead><tbody>{Object.entries(contract.props).map(([name, type]) => <tr key={name}><td><code>{name}</code></td><td>{type}</td></tr>)}</tbody></table></div>
        <h3>Events</h3><div className="table-scroll"><table><tbody>{Object.entries(contract.events ?? {}).map(([name, type]) => <tr key={name}><td><code>{name}</code></td><td>{type}</td></tr>)}</tbody></table></div>
        <p className="subtle">来源：Writing Component Contracts。实现与合同的差异应在评审中记录。</p>
      </div></details>
      <details><summary><span><b>03</b> 用法与代码</span><small>当前实现</small></summary><div className="disclosure-body"><Code scene={scene} entry={entry} /></div></details>
      <details><summary><span><b>04</b> 评审证据与反馈</span><small>只读状态 · 可复制反馈</small></summary><div className="disclosure-body">
        <div className="evidence-grid"><div><h3>合同中的状态</h3><Badge entry={entry}/><p>实现：{contract.status}</p><p className="subtle">视觉原始记录：{statusFor(entry).source}</p></div><div><h3>现有证据线索</h3><p>{contract.runtimeEvidence || '合同尚未关联运行态证据。'}</p><p className="subtle">合同文件路径仅为线索，不表示本次测试已通过。</p></div></div>
        <h3>R2 浏览器记录 · 2026-10-26</h3><p className="subtle">截图是固定场景的运行记录，不随上方选项变化，也不代表视觉批准。</p>
        {hasLocalReviewImages ? <div className="evidence-shots"><a href={`/review/r2/${entry.key}-desktop.jpg`} target="_blank" rel="noreferrer"><img loading="lazy" src={`/review/r2/${entry.key}-desktop.jpg`} alt={`${entry.name}在 1440px 桌面窗口中的预览与对比`}/><span>桌面预览与展开对比 ↗</span></a>
        {entry.key === 'choice' && <a href="/review/r2/choice-mobile.jpg" target="_blank" rel="noreferrer"><img loading="lazy" src="/review/r2/choice-mobile.jpg" alt="390 × 844 手机窗口中的选择题中文界面与长文本场景"/><span>手机 · 中文 / 长文本 · 390 × 844 ↗</span></a>}</div> : <p className="subtle">验收截图按要求仅保留在本地工作区，此检出不含图片。下方文字报告记录了结果与复现方式。</p>}
        <p><a className="text-action" href="/review/r2/verification.md" target="_blank" rel="noreferrer">查看本次验证范围与限制 ↗</a></p>
        <p>{contract.notes}</p>
        <h3>本次检查草稿</h3><p className="subtle">勾选仅用于整理反馈，切换组件后清空，不保存或修改批准状态。</p>
        <div className="review-checks">{reviewItems.map(item => <label key={item}><input type="checkbox" checked={checked.includes(item)} onChange={e => setChecked(list => e.target.checked ? [...list, item] : list.filter(v => v !== item))}/>{item}</label>)}</div>
        <label className="feedback-label">观察与建议<textarea placeholder="例如：窄屏下长文本应保持完整，图标与首行对齐……" value={notes} onChange={e => setNotes(e.target.value)}/></label>
        <BAButton size={36} variant="secondary" onPress={() => void copy(`${entry.name} · ${entry.id}\n合同基线视觉状态：${statusFor(entry).source}\nR2 变更：Updated / Pending Review；新增候选尚未批准\n场景：${url}\n已检查：${checked.join('、') || '未勾选'}\n反馈：${notes || '未填写'}\n此摘要不是设计批准记录。`)}>复制反馈摘要</BAButton>
      </div></details>
    </div>
    <section className="related"><div className="section-heading"><h2>继续探索</h2><span>同一套设计语言，相互配合。</span></div><div className="related-links">{catalog.filter(c => c.key !== entry.key).slice(0, 3).map(c => <button key={c.key} onClick={() => openEntry(c)}><span>{c.name}<small>{c.en}</small></span><span aria-hidden="true">↗</span></button>)}</div></section>
  </>;
}
function Foundations() {
  return <><div className="eyebrow">FOUNDATIONS / 设计基础</div><h1>一致，从基础开始。</h1><p className="lead">颜色与排版直接读取共享 Tokens。数值候选不代表视觉已批准。</p>
    <Colors/>
    <section className="foundation-section"><h2>字体与文字角色</h2><div className="type-specimens"><article><h3>英文标题 / UI 数字</h3><p className="display-specimen" lang="en">Learning, together.<br/>0123456789</p><small>Dosis · ExtraBold 800</small></article><article><h3>中英文正文</h3><p lang="en">A little clarity. A better learning experience.</p><p>让每一步学习，都更清晰。</p><small>Jost / Noto Sans SC</small></article></div><p className="subtle">字体通过现有 Google Fonts 地址加载；离线时使用回退字体。中文标题 Douyin 的授权资产仍未接入，不宣称字体齐备。</p></section>
    <section className="foundation-section"><h2>空间与形状</h2><p>4px 基础 / 8px 为主的节奏。以下间距与圆角读取现有候选 Token，具体使用仍需渲染评审。</p><div className="space-specimens">{[1, 2, 3, 4, 6, 8, 12].map(v => <div key={v}><span style={{ width: `var(--ba-space-${v})` }}/><code>space-{v}</code></div>)}</div></section>
  </>;
}
export function App() {
  const [scene, setScene] = useState(() => readScene(window.location.search));
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState(false);
  const previousPage = useRef(`${scene.view}/${scene.component}`);
  useEffect(() => {
    const page = `${scene.view}/${scene.component}`;
    if (previousPage.current !== page) document.getElementById('main')?.focus({ preventScroll: true });
    previousPage.current = page;
  }, [scene.view, scene.component]);
  useEffect(() => { const back = () => { setScene(readScene(window.location.search)); setMenu(false); }; window.addEventListener('popstate', back); return () => window.removeEventListener('popstate', back); }, []);
  function update(patch: Partial<Scene>, navigate = false) {
    const next = readScene(sceneSearch({ ...scene, ...patch }));
    window.history[navigate ? 'pushState' : 'replaceState']({}, '', sceneSearch(next));
    setScene(next);
    if (navigate) { setMenu(false); window.scrollTo({ top: 0 }); }
  }
  const openEntry = (entry: Entry) => update({ ...defaultScene, component: entry.key, state: entry.states[0] }, true);
  const entry = catalog.find(c => c.key === scene.component)!;
  useEffect(() => { document.title = `${scene.view === 'components' ? entry.name : { overview: '概览', foundations: '设计基础', review: '待评审' }[scene.view]} · Big Academy 组件库`; }, [entry.name, scene.view]);
  const results = catalog.filter(c => `${c.name} ${c.en} ${c.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  const views = [{ key: 'overview', label: '概览' }, { key: 'components', label: '组件' }, { key: 'foundations', label: '设计基础' }, { key: 'review', label: '待评审' }] as const;
  return <div className="library" data-ba-product="writing">
    <a className="skip-link" href="#main">跳到主要内容</a>
    <header className="site-header"><a className="brand" href="?view=overview" onClick={e => { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); update({ view: 'overview' }, true); } }}><span className="brand-mark" aria-hidden="true">b<span>·</span></span><span>Big Academy<small>DESIGN LIBRARY</small></span></a>
      <nav aria-label="网站导航">{views.map(v => <a key={v.key} href={sceneSearch({ ...scene, view: v.key })} aria-current={scene.view === v.key ? 'page' : undefined} onClick={e => { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); update({ view: v.key }, true); } }}>{v.label}</a>)}</nav><span className="site-version">Library · R2</span>
      <button className="mobile-menu text-action" aria-expanded={menu} aria-controls="component-nav" onClick={() => setMenu(m => !m)}>组件目录</button>
    </header>
    <aside id="component-nav" className="sidebar" data-open={menu}>
      <label className="search"><span>查找组件</span><input type="search" placeholder="名称、英文名或 ID" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <p className="sidebar-caption">COMPONENTS <span>{catalog.length}</span></p>
      <nav aria-label="组件目录">{['基础交互', 'Writing'].map(category => <div className="nav-group" key={category}><h2>{category}</h2>{results.filter(c => c.category === category).map(c => <a key={c.key} href={sceneSearch({ ...defaultScene, component: c.key, state: c.states[0] })} aria-current={scene.view === 'components' && c.key === scene.component ? 'page' : undefined} onClick={e => { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); openEntry(c); } }}><span>{c.name}<small>{c.en}</small></span>{statusFor(c).approved ? <BAIcon name="check" size={15}/> : <span className="status-dot" />}</a>)}</div>)}</nav>
      {!results.length && <p role="status">没有匹配的组件。试试 BAChoice 或选择题。</p>}
      <div className="sidebar-note"><BAIcon name="book" size={20}/><p>同一批真实组件。<br/>从设计到实现。</p><span>React Aria · Shared Tokens</span></div>
      <a className="developer-link" href="http://127.0.0.1:6006/" target="_blank" rel="noreferrer">开发与测试 · Storybook ↗</a><small className="subtle">需单独启动本地 Storybook</small>
    </aside>
    <main id="main" className="site-main" tabIndex={-1}>
      {scene.view === 'components' ? <Detail key={scene.component} scene={scene} update={update} openEntry={openEntry}/> : scene.view === 'foundations' ? <Foundations/> : <>
        <div className="eyebrow">BIG ACADEMY / {scene.view === 'review' ? 'DESIGN REVIEW' : 'COMPONENT LIBRARY'}</div>
        <h1>{scene.view === 'review' ? '让每个细节，经得起检查。' : <>为学习而设计。<br/>为协作而构建。</>}</h1>
        <p className="lead">{scene.view === 'review' ? '从待评审组件进入，检查状态与交互，再复制带场景的反馈。批准记录以现有合同为准。' : '浏览真实组件，探索每一种状态。在同一个地方，对齐设计与实现。'}</p>
        <div className="catalog-bar"><h2>{scene.view === 'review' ? '待视觉评审' : '组件目录'}</h2><span>{scene.view === 'review' ? catalog.filter(c => !statusFor(c).approved || c.key === 'words').length : catalog.length} 个组件</span></div>
        <div className="catalog-grid">{catalog.filter(c => scene.view !== 'review' || !statusFor(c).approved || c.key === 'words').map(c => <a className="catalog-card" key={c.key} href={sceneSearch({ ...defaultScene, component: c.key, state: c.states[0] })} onClick={e => { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); openEntry(c); } }}><div className="catalog-specimen" aria-hidden="true"><span>{c.en}</span><small>{c.id}</small></div><div className="catalog-card-content"><Badge entry={c}/><h3>{c.name}<span>↗</span></h3><p>{c.description}</p></div></a>)}</div>
      </>}
      <footer className="site-footer"><span>Big Academy <span className="subtle">/ Design Library</span></span><span>真实组件 · 共享规范 · 持续评审</span></footer>
    </main>
  </div>;
}
