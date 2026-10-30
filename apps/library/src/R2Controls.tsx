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
        <button type="button" onClick={()=>update({solarPreset:'custom',solarBorderColor:'#FFA82E',solarGlowColor:'#FFA82E',solarRayIntensity:1.80,solarRayLength:1.26,solarRayCount:64,solarBokeh:1.12,solarRimBoost:0.74,solarGlowSpread:10,solarBrightness:1.34})}>恢复设计师确认配置</button>
        {range('solarRayIntensity','Ray Intensity · 光线强度',0,2.5,0.01)}
        {range('solarRayLength','Ray Length · 光线长度',0.2,2.2,0.01)}
        {range('solarRayCount','Ray Count · 光线数量',4,64,1)}
        {range('solarBokeh','Bokeh · 散景',0,2.5,0.01)}
        {range('solarRimBoost','Rim Boost · 边缘增强',0,2.5,0.01)}
        {range('solarGlowSpread','Glow Spread · 外部光晕范围(px)',2,50,1)}
        {range('solarBrightness','Brightness · 整体亮度',0.2,1.8,0.01)}
        <p>如系统减少动态、WebGL 失败或性能不足，将使用深棕色 3px 静态边框。</p>
      </section>}
    {scene.component==='transition'&&<section className="review04-solar-controls" aria-label="Cross Blur 参数">
      <h3>Cross Blur · Page Transition</h3>
      {range('transitionDuration','Duration (ms)',0,1200,25)}
      {range('transitionBlur','Max Blur (px)',0,30,1)}
      <p>Staircase ↔ Lesson 建议 500ms / 12px；活动页建议 300ms / 6px。这里只运行独立模拟。</p>
      <button type="button" onClick={()=>update({transitionDuration:500,transitionBlur:12})}>Staircase / Lesson</button>
      <button type="button" onClick={()=>update({transitionDuration:300,transitionBlur:6})}>Activity / Activity</button>
    </section>}
    {scene.component==='flag'&&
      <section className="review04-solar-controls" aria-label="Level 旗帜 Canvas 参数">
        <h3>Level Reward Flag · Canvas 逐列波浪</h3>
        {range('flagAmplitude','Amplitude · 振幅 (px)',0,16,.5)}
        {range('flagWaves','Waves · 波数 (waves × π)',0,12,1)}
        {range('flagPeriod','Period · 周期 (s)',.2,5,.1)}
        <button type="button" onClick={()=>update({flagPlaying:!scene.flagPlaying})}>{scene.flagPlaying?'暂停':'播放'}</button>
        <button type="button" onClick={()=>update({flagAmplitude:3,flagWaves:5,flagPeriod:3,flagReset:scene.flagReset+1})}>恢复默认参数 · 3 / 5 / 3 (Phase = 0)</button>
        <p>每列约 1 个物理像素，仅竖直位移。使用设计师提供的原始黄／灰旗布与静止旗杆。</p>
        <p>算法来源：yarden · Stack Overflow a/78383275 · CC BY-SA 4.0；已改编为浏览器 Canvas。</p>
      </section>}

    {scene.component==='level'&&field('composition','展示组合',[['card','独立 Level 卡'],['solo','独立 Level 卡'],['combo','Start Point 叠顶边'],['terrace','独立 Level 卡']])}
    {scene.component==='level'&&scene.composition==='combo'&&
      <section className="review04-solar-controls" aria-label="Start Point × Level 控制">
        <h3>Start Point × Level · 文案与颜色</h3>
        <label className="field">文本
          <input type="text" maxLength={28} aria-label="Start Point text"
            value={scene.startPointText || (scene.locale==='zh'?'开始学习啦！':'Start Point')}
            onChange={e=>update({startPointText:e.target.value})}/>
        </label>
        <div className="review04-color-pickers">
          <label>填充色 Fill <input type="color" aria-label="Start Point fill" value={scene.startPointFill} onChange={e=>update({startPointFill:e.target.value})}/><code>{scene.startPointFill}</code></label>
          <label>描边色 Stroke <input type="color" aria-label="Start Point stroke" value={scene.startPointStroke} onChange={e=>update({startPointStroke:e.target.value})}/><code>{scene.startPointStroke}</code></label>
          <label>文字色 Ink <input type="color" aria-label="Start Point ink" value={scene.startPointInk} onChange={e=>update({startPointInk:e.target.value})}/><code>{scene.startPointInk}</code></label>
        </div>
        <button type="button" onClick={()=>update({startPointText:'',startPointFill:'#ffc24e',startPointStroke:'#715146',startPointInk:'#2f0f04'})}>恢复 Figma 默认</button>
        <p>SP 字号 = 标题 tokens（Dosis 800 / 24 / 30）。Level 正文 16px（BA-WR-008）。combo：叠 Level 顶边、tilt −6° tip 右上；Level 卡顶 padding 48px。</p>
      </section>}


    {scene.component==='path-back'&&
      <section className="review04-solar-controls" aria-label="Back to current 标本控制">
        <h3>回到当前 · path-controls 标本</h3>
        <p>夹在左右箭头中间，高度 50。Current 完全离屏显示；回视口隐藏。Solar 与课卡 Current 同源；可强制描边回退。</p>
        {field('pathCurrentView','Current 视口',[['auto','自动 · IntersectionObserver'],['off','强制离屏 · 显示按钮'],['in','强制在视口 · 隐藏按钮']])}
        <label className="field"><span>Solar 描边回退</span>
          <select aria-label="Solar 描边回退" value={scene.pathSolarFallback?'true':'false'}
            onChange={e=>update({pathSolarFallback:e.target.value==='true'})}>
            <option value="false">Auto / WebGL</option>
            <option value="true">Force stroke fallback</option>
          </select>
        </label>
        <p>也可切顶部「动态」为减少动态，或使用预览内按钮切换。不改 Writing StaircaseScene。</p>
      </section>}

    {scene.component==='notebook'&&
      <section className="review04-solar-controls" aria-label="Notebook 方向">
        <h3>NotebookShell · 本子方向</h3>
        {field('orientation','方向 Orientation',[['portrait','竖本 · 顶装订'],['landscape','横本 · 左装订']])}
        <p>主标本为 NotebookShell（无横线/无内置 textarea，children 演示）。方向由 Scene / URL（?component=notebook&amp;orientation=landscape）控制。孔+U 环间距优先（--ns-bind-pitch: 38），孔数 3–24。旧 NotebookEditor 在预览底部对照。</p>
      </section>}
    {scene.component==='start-point'&&
      <section className="review04-solar-controls" aria-label="Start Point 控制">
        <h3>Start Point · 文案与颜色</h3>
        <label className="field">文本
          <input type="text" maxLength={28} aria-label="Start Point text"
            value={scene.startPointText || (scene.locale==='zh'?'开始学习啦！':'Start Point')}
            onChange={e=>update({startPointText:e.target.value})}/>
        </label>
        <div className="review04-color-pickers">
          <label>填充色 Fill <input type="color" aria-label="Start Point fill" value={scene.startPointFill} onChange={e=>update({startPointFill:e.target.value})}/><code>{scene.startPointFill}</code></label>
          <label>描边色 Stroke <input type="color" aria-label="Start Point stroke" value={scene.startPointStroke} onChange={e=>update({startPointStroke:e.target.value})}/><code>{scene.startPointStroke}</code></label>
          <label>文字色 Ink <input type="color" aria-label="Start Point ink" value={scene.startPointInk} onChange={e=>update({startPointInk:e.target.value})}/><code>{scene.startPointInk}</code></label>
        </div>
        <button type="button" onClick={()=>update({startPointText:'',startPointFill:'#ffc24e',startPointStroke:'#715146',startPointInk:'#2f0f04'})}>恢复 Figma 默认</button>
        <p>字号 = 标题 tokens（Dosis 800 / 24 / 30）。左宽测量；几何 0.8 缩放不重绘切图。与 Level 组合见 component=level&composition=combo。</p>
      </section>}
    {scene.component==='words'&&<>
      <p className="review04-caption">Rounded Connected Tabs · 左侧局部底色桥接（Slanted 已废弃）</p>
      <Select label="使用情景" value={scene.wordScenario} items={scenarios.map(([id,name])=>[id,`${id} · ${name}`])} onChange={v=>update(scenarioPatch(v as Scene['wordScenario']))}/>
      {field('wordContent','词卡内容',[['word','Word · 单词'],['punctuation','Punctuation · 标点'],['emoji','Emoji'],['sentence','Sentence · 句子'],['mixed','Mixed · 混合']])}
      {field('wordCount','词组数量',[['1','1 组'],['4','4 组'],['10','10 组']])}{field('wordTabs','标签栏',[['auto','自动'],['show','显示（包括单 Tab）'],['hide','隐藏（显示当前组）']])}
      {field('wordInteraction','交互能力',[['enabled','Enabled'],['disabled','Disabled']])}
      {scene.mode==='state'&&<>{field('wordSelection','首词使用状态',[['default','Default'],['selected','Selected'],['used','Used']])}{field('wordEvaluation','首词评价',[['neutral','Neutral'],['correct','Correct'],['incorrect','Incorrect'],['hint','Hint'],['shown','Shown Answer']])}</>}
      {scene.wordScenario==='B'&&<p className="review04-caption">造句词块：live 点入即 selected+disabled（略灰、不可撤销）。查看状态时切「Selected」+「Disabled」可对照该视觉。</p>}
    </>}
  </>;
}
export function ScenarioLinks({scene,update}:{scene:Scene;update:(patch:Partial<Scene>)=>void}) {
  if(scene.component!=='words') return null;
  return <section className="scenario-links" aria-label="WordGrid 使用情景"><h2>Scenarios · 使用情景</h2><div>{scenarios.map(([id,name])=><button key={id} aria-pressed={scene.wordScenario===id} onClick={()=>update(scenarioPatch(id))}>{id} · {name}</button>)}</div></section>;
}
