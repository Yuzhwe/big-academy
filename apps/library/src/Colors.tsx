import { useState } from 'react';
import { colorTokens } from './colorTokens';
export function Colors() {
  const [query,setQuery]=useState(''); const [layer,setLayer]=useState('all'); const [purpose,setPurpose]=useState('all');
  const [message,setMessage]=useState(''); const [manual,setManual]=useState('');
  const results=colorTokens.filter(t=>(layer==='all'||t.layer===layer)&&(purpose==='all'||t.purpose===purpose)&&`${t.name} ${t.value}`.toLowerCase().includes(query.toLowerCase()));
  async function copy(text:string){try{await navigator.clipboard.writeText(text);setMessage('已复制颜色信息');setManual('');}catch{setManual(text);setMessage('请手动复制');}}
  return <section className="foundation-section"><h2>全部颜色 Tokens</h2><p>直接读取共享 tokens.css：{colorTokens.length} 条颜色／颜色效果声明（含主题覆盖）。分层与用途是浏览索引，原定义与作用域完整保留。</p>
    <div className="controls-bar"><label className="field">搜索名称或色值<input value={query} onChange={e=>setQuery(e.target.value)} aria-label="搜索颜色"/></label>
      <label className="field">层级<select aria-label="颜色层级" value={layer} onChange={e=>setLayer(e.target.value)}><option value="all">全部层级</option>{['Primitive','Semantic','Component / Legacy'].map(v=><option key={v}>{v}</option>)}</select></label>
      <label className="field">用途<select aria-label="颜色用途" value={purpose} onChange={e=>setPurpose(e.target.value)}><option value="all">全部用途</option>{[...new Set(colorTokens.map(t=>t.purpose))].map(v=><option key={v}>{v}</option>)}</select></label>
    </div><p role="status">{message || `${results.length} 条匹配`}</p>{manual&&<textarea readOnly aria-label="手动复制颜色" value={manual}/>}
    <div className="color-grid">{results.map((t,i)=><article className="color-token" key={`${t.scope}-${t.name}-${i}`}>
      <div className="color-comparison">{['light','dark'].map(background=><div key={background} data-background={background}><span style={t.effect?{boxShadow:t.value}:{background:t.value}}/><small>{background==='light'?'浅底':'深底'}</small></div>)}</div>
      <strong><code>{t.name}</code></strong><code>{t.value}</code><small>{t.layer} · {t.purpose}</small><code>{t.scope}</code><details><summary>原始定义与注释</summary><code>{t.definition}</code><p>{t.note||'此声明未附独立用途注释。'}</p></details>
      <button className="text-action" onClick={()=>void copy(`${t.name}: ${t.definition};\n实际解析值: ${t.value}\n作用域: ${t.scope}`)}>复制 {t.name}</button>
    </article>)}</div>
    <details><summary>已有差异与缺失</summary><p>旧 --ba-writing-grid-* 青色候选值仍在文件中；已批准 WordGrid 使用现有桃色。此处同时忠实展示，不把旧候选覆盖到组件。--ba-success 是 Choice 绿色锚点，--ba-color-success-fill 是较深的通用反馈色，二者不可混用。</p><p>Reading 配色与完整 Dark 主题尚未定义。深底仅用于观察颜色；R2 Dark Tabs 是独立候选，不宣称已有全站深色主题。</p></details>
  </section>;
}
