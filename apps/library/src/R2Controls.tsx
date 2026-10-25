import type { Scene } from './catalog';
import { scenarios, scenarioPatch } from './wordScenarios';
function Select({label,value,items,onChange}:{label:string;value:string;items:readonly (readonly [string,string])[];onChange:(value:string)=>void}) {
  return <label className="field"><span>{label}</span><select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{items.map(([v,text])=><option value={v} key={v}>{text}</option>)}</select></label>;
}
export function R2Controls({scene,update}:{scene:Scene;update:(patch:Partial<Scene>)=>void}) {
  const field=(key:keyof Scene,label:string,items:readonly (readonly [string,string])[])=><Select label={label} value={String(scene[key])} items={items} onChange={v=>update({[key]:v})}/>;
  return <>
    {['button','tabs'].includes(scene.component)&&field('background','预览背景',[['light','Light · 浅底'],['dark','Dark · 深底']])}
    {scene.component==='button'&&<>{field('buttonContent','内容组合',[['text','纯文字'],['icon','纯图标'],['leading','图标在前'],['trailing','图标在后']])}{field('layout','按钮宽度',[['hug','内容自适应'],['fixed','固定 240px'],['full','Fill Container']])}</>}
    {scene.component==='tabs'&&field('tabCount','标签数量',[['1','1 个'],['2','2 个'],['4','4 个'],['10','10 个']])}
    {scene.component==='choice'&&field('material','内容语言',[['en','英文学习材料'],['zh','中文排版样例']])}
    {scene.component==='lesson'&&<>{field('composition','展示组合',[['card','独立卡片'],['terrace','现有阶梯底座']])}{scene.state==='currentStart'&&field('currentAction','当前课程进度',[['start','尚未开始 → Start'],['continue','已有进度 → Continue']])}</>}
    {scene.component==='words'&&<>
      <Select label="使用情景" value={scene.wordScenario} items={scenarios.map(([id,name])=>[id,`${id} · ${name}`])} onChange={v=>update(scenarioPatch(v as Scene['wordScenario']))}/>
      {field('wordContent','词卡内容',[['word','Word · 单词'],['punctuation','Punctuation · 标点'],['emoji','Emoji'],['sentence','Sentence · 句子'],['mixed','Mixed · 混合']])}
      {field('wordCount','词组数量',[['1','1 组'],['4','4 组'],['10','10 组']])}{field('wordTabs','标签栏',[['auto','自动'],['show','显示（包括单 Tab）'],['hide','隐藏（显示当前组）']])}
      {field('wordInteraction','交互能力',[['enabled','Enabled'],['disabled','Disabled']])}
      {scene.mode==='state'&&<>{field('wordSelection','首词使用状态',[['default','Default'],['selected','Selected'],['used','Used']])}{field('wordEvaluation','首词评价',[['neutral','Neutral'],['correct','Correct'],['incorrect','Incorrect'],['hint','Hint'],['shown','Shown Answer']])}</>}
    </>}
  </>;
}
export function ScenarioLinks({scene,update}:{scene:Scene;update:(patch:Partial<Scene>)=>void}) {
  if(scene.component!=='words') return null;
  return <section className="scenario-links" aria-label="WordGrid 使用情景"><h2>Scenarios · 使用情景</h2><div>{scenarios.map(([id,name])=><button key={id} aria-pressed={scene.wordScenario===id} onClick={()=>update(scenarioPatch(id))}>{id} · {name}</button>)}</div></section>;
}
