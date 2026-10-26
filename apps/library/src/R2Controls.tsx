import type { Scene } from './catalog';
import { scenarios, scenarioPatch } from './wordScenarios';
import { SOLAR_COLOR_PRESETS } from './SolarLessonPreview';
function Select({label,value,items,onChange}:{label:string;value:string;items:readonly (readonly [string,string])[];onChange:(value:string)=>void}) {
  return <label className="field"><span>{label}</span><select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{items.map(([v,text])=><option value={v} key={v}>{text}</option>)}</select></label>;
}
export function R2Controls({scene,update}:{scene:Scene;update:(patch:Partial<Scene>)=>void}) {
  const field=(key:keyof Scene,label:string,items:readonly (readonly [string,string])[])=><Select label={label} value={String(scene[key])} items={items} onChange={v=>update({[key]:v})}/>;
  const range=(key:keyof Scene,label:string,min:number,max:number,step:number)=><label className="field review04-range" key={key}>
    <span>{label}</span>
    <input type="range" min={min} max={max} step={step} value={Number(scene[key])}
      onChange={event=>update({[key]:Number(event.target.value)} as Partial<Scene>)} />
    <output>{Number(scene[key]).toFixed(step>=1?0:step>=0.1?1:2)}</output>
  </label>;
  return <>
    {['button','tabs'].includes(scene.component)&&field('background','预览背景',[['light','Light · 浅底'],['dark','Dark · 深底'],['glass','Glass · 玻璃候选']])}
    {scene.component==='button'&&<>{field('buttonContent','内容组合',[['text','纯文字'],['icon','纯图标'],['leading','图标在前'],['trailing','图标在后']])}{field('layout','按钮宽度',[['hug','内容自适应'],['fixed','固定 240px'],['full','Fill Container']])}</>}
    {scene.component==='tabs'&&field('tabCount','标签数量',[['1','1 个'],['2','2 个'],['4','4 个'],['10','10 个']])}
    {scene.component==='choice'&&field('material','内容语言',[['en','英文学习材料'],['zh','中文排版样例']])}
    {scene.component==='lesson'&&field('composition','展示组合',[['card','独立卡片'],['terrace','现有云朵底座']])}
    {scene.component==='lesson'&&scene.mode==='state'&&scene.state==='current'&&
      <section className="review04-solar-controls" aria-label="Solar 参数调节台">
        <h3>Solar 参数调节台 · Current</h3>
        <p>仅调整 Solar 外部光效与边框，卡片内部保持不变。三种推荐配色可直接比较。</p>
        <Select label="Color Preset · Solar 配色" value={scene.solarPreset}
          items={[['A','A · Writing 铜棕'],['B','B · 深焦糖棕'],['C','C · 暖杏橙'],['custom','Custom · 自定义']]}
          onChange={v=>{if(v==='custom'){update({solarPreset:'custom'});return;}
            const pair=SOLAR_COLOR_PRESETS[v as keyof typeof SOLAR_COLOR_PRESETS];
            update({solarPreset:v as Scene['solarPreset'],solarBorderColor:pair.border,solarGlowColor:pair.glow});
          }}/>
        <div className="review04-color-pickers">
          <label>Border Color <input type="color" aria-label="Solar Border Color" value={scene.solarBorderColor} onChange={e=>update({solarPreset:'custom',solarBorderColor:e.target.value})}/><code>{scene.solarBorderColor}</code></label>
          <label>Glow Color <input type="color" aria-label="Solar Glow Color" value={scene.solarGlowColor} onChange={e=>update({solarPreset:'custom',solarGlowColor:e.target.value})}/><code>{scene.solarGlowColor}</code></label>
        </div>
        <button type="button" onClick={()=>update({solarPreset:'A',solarBorderColor:SOLAR_COLOR_PRESETS.A.border,solarGlowColor:SOLAR_COLOR_PRESETS.A.glow,solarRayIntensity:.6,solarRayLength:.45,solarRayCount:64,solarBokeh:.16,solarRimBoost:1.66,solarGlowSpread:18,solarBrightness:1})}>恢复 Solar 默认配置</button>
        {range('solarRayIntensity','Ray Intensity · 光线强度',0,2.5,0.01)}
        {range('solarRayLength','Ray Length · 光线长度',0.2,2.2,0.01)}
        {range('solarRayCount','Ray Count · 光线数量',4,64,1)}
        {range('solarBokeh','Bokeh · 散景',0,2.5,0.01)}
        {range('solarRimBoost','Rim Boost · 边缘增强',0,2.5,0.01)}
        {range('solarGlowSpread','Glow Spread · 外部光晕范围(px)',2,50,1)}
        {range('solarBrightness','Brightness · 整体亮度',0.2,1.8,0.01)}
        <p>如系统减少动态、WebGL 失败或性能不足，将使用深棕色 3px 静态边框。</p>
      </section>}
    {scene.component==='unit'&&field('unitCorner','右上角方案',[['folded','原有折页（实际页面）'],['cutout','透明裁切（待批准）']])}
    {scene.component==='transition'&&<section className="review04-solar-controls" aria-label="Cross Blur 参数">
      <h3>Cross Blur · Page Transition</h3>
      {range('transitionDuration','Duration (ms)',0,1200,25)}
      {range('transitionBlur','Max Blur (px)',0,30,1)}
      <p>Staircase ↔ Lesson 建议 500ms / 12px；活动页建议 300ms / 6px。这里只运行独立模拟。</p>
      <button type="button" onClick={()=>update({transitionDuration:500,transitionBlur:12})}>Staircase / Lesson</button>
      <button type="button" onClick={()=>update({transitionDuration:300,transitionBlur:6})}>Activity / Activity</button>
    </section>}
    {scene.component==='flag'&&
      <section className="review04-solar-controls" aria-label="Level 旗帜参数">
        <h3>Level Reward Flag · 布料参数</h3>
        {range('flagWind','Wind · 风力 (默认 4%)',0,0.12,0.005)}
        <p>沿用 R2.12 旗帜与布面 SVG，参数只作用于组件库。</p>
      </section>}
    {scene.component==='words'&&<>
      {field('wordTabAppearance','Tab 视觉方案',[['connected','原有反向圆角（实际页面）'],['slanted','Slanted · 斜切层叠候选']])}
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
