import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {marked}=await import(createRequire(import.meta.url).resolve('marked'));
import {buildExperiences} from './build-experiences.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const snapshot=JSON.parse(await fs.readFile(path.join(root,'source-snapshot.json'),'utf8'));
const config=JSON.parse(await fs.readFile(path.join(root,'sources.json'),'utf8'));
const primary=config.primaryBranch;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titles={
'DESIGN.md':['Big Academy · 统一设计规范','一套共享设计语言，覆盖主题、字体、布局、组件与审核原则。'],
'apps/writing/PRODUCT.md':['Writing · 产品规范','课程范围、学习状态、任务导航与产品验收路径。'],
'docs/HANDOFF.md':['项目交接与当前进展','跨 Agent 协作入口：当前状态、工作边界和下一步。'],
'AGENTS.md':['Agent 协作与权限约定','Agent A、Grokbot、设计师与 Alex 的职责和操作边界。'],
'docs/design-system/P1_IMPLEMENTATION_PLAN_v0.1.md':['P0 决策与 P1 实施计划','五项已确定架构决策，以及下一阶段的任务、责任和证据。'],
'docs/design-system/BENCHMARK_AND_TOKEN_GAP_AUDIT_v0.1.md':['设计系统对标与 Token 缺口','现有规范与设计基础的缺口记录及补齐方向。'],
'apps/writing/contracts/components.json':['Writing · 组件契约注册表','13 项稳定组件 ID，以及 Props、Events、States 与实现路径。'],
'packages/design-system/src/tokens.css':['Design Tokens · CSS 源码','当前可执行 Token 值，明确区分批准、候选与临时值。'],
'apps/writing/CODE_FIRST_COMPONENT_WORKFLOW_v0.1.md':['Code-First 组件工作流','从规范与组件契约到代码、Storybook、验证及视觉审核。'],
'apps/writing/COMPONENT_SCOPE_v0.1.md':['Writing · 组件范围','明确 React Aria 基础层与自有产品组件的分工。'],
'apps/writing/HEADLESS_COMPONENT_SELECTION_v0.1.md':['Headless 组件选型','React Aria 组件基础的选择理由、证据和适用边界。'],
'apps/writing/PHASE1_ALIGNMENT_REPORT_v0.3.md':['Writing · 阶段一对齐报告','产品逻辑、设计方向与已确认事项的对齐记录。'],
'apps/writing/docs/PILOT_RUNTIME.md':['Top Bar · 运行与验证记录','组件试点的运行方法、验证证据以及已知限制。'],
'apps/writing/docs/TOPBAR_PILOT_BRIEF.md':['LessonTopBar · 实施简报','第一个组件试点的范围、布局和行为约束。'],
'apps/writing/docs/SLICE_RUNTIME.md':['E-01 → Lesson 1 · 运行记录','独立分支局部流程的能力、字体与未完成范围。'],
'apps/writing/docs/PHASE_A_AUDIT.md':['Writing · 局部流程审计','阶梯页与课程实现前的源码和范围检查。'],
'apps/writing/source/Writing-staircase-prompt.md':['Writing · 阶梯页设计参考','阶梯、课程卡片、Milestone 与页面布局的原始参考。'],
'apps/writing/source/Writing-activity-style-prompt.md':['Writing · 活动页设计参考','活动类型、页面构成和视觉风格的原始设计输入。'],
'apps/writing/source/Writing-headless-UI-selection-brief.md':['Writing · UI 选型输入','可访问的交互基础与产品组件选型简报。'],
'packages/design-system/README.md':['设计系统 · 入门','共享组件包、基础 Token 和运行边界。'],
'skills/README.md':['工作流技能 · 当前状态','prototype-to-hifi 技能尚未完整导入的状态说明。'],
'apps/writing/README.md':['Writing · 项目说明','Writing 试点的源文件、规范和实施入口。'],
'README.md':['Big Academy · 仓库说明','项目基本结构与代码优先工作方式。']
};
const docs=snapshot.documents.map((d,i)=>{
  const isPrimary=d.branch===primary;
  const md=d.path.endsWith('.md');
  let title=titles[d.path]?.[0]||d.path.split('/').pop();
  let desc=titles[d.path]?.[1]||'从 GitHub 源文件同步的可追溯文档。';
  if(d.path==='apps/writing/DESIGN.md'){title='Writing · 分支设计规范';desc='旧的产品级设计文档。统一根 DESIGN.md 为当前选定方向，此版本保留供分支追溯。';}
  if(!isPrimary&&d.path==='docs/HANDOFF.md')title+=d.branch.startsWith('cursor')?' · 阶梯页分支':' · Grokbot 分支';
  if(!isPrimary&&d.path.endsWith('components.json'))title+=' · 阶梯页分支';
  let category=!isPrimary?'archive':d.path.includes('/source/')?'reference':/DESIGN\.md$|PRODUCT\.md$/.test(d.path)?'spec':/design-system|components\.json|COMPONENT_SCOPE|HEADLESS/.test(d.path)?'system':'process';
  let status=!isPrimary?'分支参考':d.path.includes('/source/')?'参考资料':d.path.endsWith('tokens.css')?'临时实现':/DESIGN|PRODUCT/.test(d.path)?'草稿':'工作记录';
  const sourceBase=`https://github.com/${snapshot.repository}/blob/${d.ref}/`;
  function safeLink(href){if(href?.startsWith('#'))return sourceBase+d.path+href;try{let u=new URL(href,sourceBase+path.posix.dirname(d.path)+'/');return ['http:','https:','mailto:'].includes(u.protocol)?u.href:'#';}catch{return '#';}}
  const renderer=Object.assign(new marked.Renderer(),{html({text}){return escape(text);},link({href,tokens}){return `<a href="${escape(safeLink(href))}" target="_blank" rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`;},image({href,text}){return `<a href="${escape(safeLink(href))}" target="_blank" rel="noopener noreferrer">[图片: ${escape(text||'查看原图')}]</a>`;}});
  const html=md?marked.parse(d.content,{renderer,gfm:true}):`<pre><code>${escape(d.content)}</code></pre>`;
  return {...d,id:'d'+i,title,description:desc,category,status,primary:isPrimary,extension:d.path.endsWith('.json')?'JSON':d.path.endsWith('.css')?'CSS':'MD',html};
});
const registry=snapshot.documents.find(x=>x.branch===primary&&x.path.endsWith('contracts/components.json'));
if(!registry)throw new Error('Primary component registry is required');
const data={repository:snapshot.repository,capturedAt:snapshot.capturedAt,branches:snapshot.branches,docs,components:JSON.parse(registry.content).components,registryRef:registry.ref};
const dist=path.join(root,'dist');
await fs.mkdir(path.join(dist,'assets'),{recursive:true});
for(const f of ['index.html','app.js','style.css','foundations.js','foundations.css'])await fs.copyFile(path.join(root,'src',f),path.join(dist,f));
await fs.copyFile(path.join(root,'src/favicon.svg'),path.join(dist,'assets/favicon.svg'));
await fs.copyFile(path.join(root,'writing-path.png'),path.join(dist,'assets/writing-path.png'));
await fs.writeFile(path.join(dist,'data.js'),'window.HUB_DATA = '+JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+';\n');
await fs.writeFile(path.join(dist,'content-index.json'),JSON.stringify({repository:data.repository,capturedAt:data.capturedAt,documents:docs.map(({html,content,...d})=>d),components:data.components},null,2));
console.log(`Built ${docs.length} source documents, ${data.components.length} component contracts and 11 portal views.`);

const experience=await buildExperiences();
const tokenSource=docs.find(d=>d.primary&&d.path.endsWith('tokens.css')).content;
const tokens=[...tokenSource.matchAll(/(--ba-[\w-]+):\s*([^;]+);(?:[^\S\n]*\/\*([^*]*)\*\/)?/g)].map(m=>({name:m[1],value:m[2].trim(),note:(m[3]||'').trim(),status:(m[3]||'').includes('[A]')?'approved':(m[3]||'').includes('[E]')?'candidate':'temporary'}));
const prototypeManifest=JSON.parse(await fs.readFile(path.join(root,'vendor/writing/manifest.json'),'utf8'));
const system={...experience,tokens,iconVersion:JSON.parse(await fs.readFile(path.join(root,'node_modules/iconoir-react/package.json'),'utf8')).version,prototypeCommit:prototypeManifest.commit,fontAssets:[]};
for(const f of ['dosis','jost','noto-sans-sc']){const pkg=JSON.parse(await fs.readFile(path.join(root,'node_modules/@fontsource',f,'package.json'),'utf8'));system.fontAssets.push({family:f,version:pkg.version,license:'OFL-1.1'});}
await fs.writeFile(path.join(dist,'system.js'),'window.HUB_SYSTEM='+JSON.stringify(system)+';');
console.log(`Experiences: ${experience.icons} Iconoir icons, 13 interactive components, Writing and original prototype pages.`);
