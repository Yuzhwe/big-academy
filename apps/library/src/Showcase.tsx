import { useState } from 'react';
import { Preview } from './Preview';
import { defaultScene, type Scene } from './catalog';
export function Showcase({scene,update}:{scene:Scene;update:(patch:Partial<Scene>)=>void}) {
  const [open,setOpen]=useState(false);
  const samples:Array<{label:string;patch:Partial<Scene>}>=scene.component==='button'?[
    ...(['primary','secondary','outline','ghost'] as const).map(variant=>({label:`${variant}${variant==='outline'?' · Candidate':' · Existing'}`,patch:{variant,mode:'live' as const,size:50 as const,buttonContent:'leading' as const}})),
    ...([36,50,70,90] as const).map(size=>({label:`${size} px · 真实尺寸`,patch:{size,buttonContent:'icon' as const,layout:'hug' as const}})),
  ]:scene.component==='tabs'?(['light','dark'] as const).map(background=>({label:background==='dark'?'Dark · Candidate / Pending Approval':'Light · Updated / Pending Review',patch:{background,mode:'live',sample:'standard',tabCount:'4'}})):
  scene.component==='lesson'?(['review','current','start','locked'] as const).map((state,i)=>({label:['Completed','Current','Available','Locked'][i],patch:{state,mode:'state'}})):
  scene.component==='words'?(['word','punctuation','emoji','sentence','mixed'] as const).map(wordContent=>({label:wordContent,patch:{wordContent,wordScenario:'A',wordCount:'1',mode:'live',wordSelected:[],wordAnswer:[]}})):[];
  if(!samples.length) return null;
  return <details className="showcase" onToggle={e=>setOpen(e.currentTarget.open)}><summary>样式、尺寸与内容总览</summary><p className="subtle">这些也是同一批真实组件；悬停、按住或用键盘聚焦可检查瞬时状态。使用情景在主画布中操作。</p><div className="showcase-grid">{open&&samples.map(({label,patch})=><article key={label}><h3>{label}</h3><div className="showcase-preview" data-background={patch.background??scene.background} data-ba-product="writing"><Preview scene={{...defaultScene,...scene,...patch}}/></div><button className="text-action" onClick={()=>{update(patch);document.querySelector('.preview-panel')?.scrollIntoView({block:'start'});}}>在主画布探索 {label}</button></article>)}</div></details>;
}
