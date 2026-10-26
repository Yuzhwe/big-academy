import type { Scene } from './catalog';
import { M4_CLEAR, STAIRCASE_SKY } from '../../writing/src/course/cloudShaderM4';

/** Designer controls only; never imported by Writing student pages. */
export function CloudControls({ scene, update }: { scene: Scene; update: (patch: Partial<Scene>) => void }) {
  if (scene.component !== 'cloud') return null;
  const numberField = (label: string, key: 'cloudCount'|'driftSpeed'|'parallaxStrength'|'cloudCameraX',
    min: number, max: number, step: number) => <label key={key} style={{display:'grid',gap:4,minWidth:150}}>
    <span>{label}: {scene[key]}</span>
    <input type="range" min={min} max={max} step={step} value={scene[key]}
      onChange={e => update({[key]:Number(e.target.value)} as Partial<Scene>)} />
  </label>;
  return <div className="cloud-design-controls" style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'end',padding:'12px 0'}} data-testid="cloud-designer-controls">
    <label>天空配色
      <select aria-label="天空配色" value={scene.cloudPreset} onChange={e=>{
        const clear=e.target.value==='clear';const preset=clear?M4_CLEAR:STAIRCASE_SKY;
        update({cloudPreset:clear?'clear':'staircase',skyTop:preset.skyTop,skyBottom:preset.skyBottom,cloudColor:preset.cloudColor,cloudCount:preset.cloudCount,driftSpeed:preset.driftSpeed});
      }}><option value="clear">M4 原始 Clear</option><option value="staircase">当前阶梯页候选</option></select>
    </label>
    <label>渲染模式
      <select aria-label="云朵渲染模式" value={scene.cloudRenderMode} onChange={e=>update({cloudRenderMode:e.target.value as Scene['cloudRenderMode']})}>
        <option value="auto">Auto · 自动</option><option value="shader">Shader · 优先 WebGL</option><option value="lightweight">Lightweight · 现有轻量</option>
      </select>
    </label>
    {(['skyTop','skyBottom','cloudColor'] as const).map(key=><label key={key} style={{display:'grid',gap:4}}>
      {key}<input aria-label={key} type="color" value={scene[key]} onChange={e=>update({[key]:e.target.value} as Partial<Scene>)} />
    </label>)}
    {numberField('Cloud count','cloudCount',1,6,1)}
    {numberField('Drift speed','driftSpeed',0,2,.1)}
    {numberField('Parallax strength','parallaxStrength',0,.5,.01)}
    {numberField('Camera X · 模拟滚动','cloudCameraX',0,1200,10)}
    <label><input type="checkbox" checked={scene.cloudPaused} onChange={e=>update({cloudPaused:e.target.checked})}/> 暂停漂移</label>
  </div>;
}
