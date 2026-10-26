import { useState, type CSSProperties } from 'react';
import { BAButton, BAIcon, BAChoice, BATabs, BATabList, BATabPanel, type ChoiceVisualState, type TaskProgressItem } from '@big-academy/design-system';
import { LessonTopBar } from '../../writing/src/components/writing/LessonTopBar';
import { StairLessonCard, type StairLessonState } from '../../writing/src/components/writing/StairLessonCard';
import { StairUnitCard } from '../../writing/src/components/writing/StairUnitCard';
import { UnitMilestone } from '../../writing/src/components/writing/UnitMilestone';
import { BAPageTransition } from '../../writing/src/components/writing/BAPageTransition';
import { LandscapeTerrace } from '../../writing/src/components/writing/LandscapeTerrace';
import { HamburgerComposition } from '../../writing/src/components/writing/HamburgerComposition';
import { LevelRewardFlag } from '../../writing/src/course/LevelRewardFlag';
import { SolarLessonPreview } from './SolarLessonPreview';
import './Review04Preview.css';
import { WordPlayground } from './WordPlayground';
import { choiceOptions, type Scene } from './catalog';

export function Preview({ scene, onSelected, update }: { scene: Scene; onSelected?: (keys: string[]) => void; update?: (patch: Partial<Scene>) => void }) {
  const [tab, setTab] = useState('L2');

  const [notice, setNotice] = useState('');
  const [activity, setActivity] = useState(2);
  const [transitionTarget,setTransitionTarget] = useState('staircase');
  const [flagLocalImage,setFlagLocalImage]=useState<string|undefined>();
  const zh = scene.locale === 'zh';
  const state = scene.mode === 'state' ? scene.state : 'default';
  const output = notice ? <output className="preview-result" aria-live="polite">{notice}</output> : null;

  if (scene.component === 'choice') {
    const forced = scene.mode === 'state';
    const checked = !forced && scene.answerPhase === 'checked';
    const correct = scene.choice === 'single' ? ['b'] : ['a','b'];
    const selected = forced ? ['selected', 'correct', 'wrong'].includes(state) ? ['a'] : [] : scene.selected;
    const options = choiceOptions(scene.sample).map((o, i) => ({ ...o,
      text: scene.material === 'zh' ? ['花园里有植物。','我们的学校应该有一个花园。',scene.sample==='long'?'校园花园让每个学生都有安静学习、观察植物生长并和朋友分享发现的地方，也能帮助我们理解身边的自然世界。':'花园里开着花。'][i] : o.text,
      state: forced && i === 0 ? state as ChoiceVisualState : checked ? (correct.includes(o.id)?selected.includes(o.id)?'correct':'correctUnselected':selected.includes(o.id)?'wrong':'dim') as ChoiceVisualState : undefined }));
    return <div className="preview-example preview-example--choice">
      <p className="preview-prompt">{zh ? '选出你想使用的句子' : 'Choose a sentence to use'}</p>
      <BAChoice aria-label={zh ? '选择句子' : 'Choose a sentence'} choiceMode={scene.choice} options={options}
        selectedKeys={selected} disabled={forced || checked} onChange={onSelected} />
      <p className="preview-result" aria-live="polite">{forced ? (zh ? '第一行展示指定状态。此处不执行评分。' : 'The first row shows the chosen state. No grading is performed.') :
        (zh ? `已选择 ${selected.length} 项 · 只改变选择，不评分` : `${selected.length} selected · Selection only, no grading`)}</p>
      {!forced&&<div className="demo-actions"><BAButton size={36} disabled={!selected.length||checked} onPress={()=>update?.({answerPhase:'checked'})}>{zh?'检查示例':'Check demo'}</BAButton><BAButton size={36} onPress={()=>{onSelected?.([]);update?.({selected:[],answerPhase:'open'});}}>{zh?'清除选择':'Clear selection'}</BAButton></div>}
      {checked&&<p>{zh?'确定性示例已提交；不调用 Writing 评分或记录。':'Deterministic demo submitted; no Writing grading or records.'}</p>}
    </div>;
  }
  if (scene.component === 'button') {
    const label = scene.sample === 'long' ? (zh?'继续学习并探索校园花园里的更多发现':'Continue learning and explore more discoveries in our school garden') : (zh?'继续学习':'Continue learning');
    const icon=<BAIcon name="book" size={scene.size>=70?24:20}/>;
    return <div className="preview-example preview-example--center">
      {scene.variant==='outline'&&<p className="candidate-label">Outline · Candidate / Pending Approval</p>}
      <BAButton variant={scene.variant} size={scene.size} locale={scene.locale} disabled={state === 'disabled'} busy={state === 'busy'}
        layout={scene.layout} wrap iconOnly={scene.buttonContent==='icon'} aria-label={scene.buttonContent==='icon'?label:undefined}
        leadingIcon={['icon','leading'].includes(scene.buttonContent)?icon:undefined} trailingIcon={scene.buttonContent==='trailing'?icon:undefined}
        onPress={() => setNotice(zh ? '已收到按钮操作' : 'Button press received')}>
        {scene.buttonContent==='icon'?null:label}
      </BAButton>{output}
      {['hover','pressed','focus'].includes(state)&&<p>{zh?'悬停 / 按住 / 用 Tab 聚焦按钮，查看真实反馈。':'Hover / hold / Tab to the button to inspect the real state.'}</p>}
      {state==='busy'&&<p>{zh?'等待中阻止重复点击。':'Pending blocks repeated activation.'}</p>}
    </div>;
  }
  if (scene.component === 'tabs') {
    const options = Array.from({length:Number(scene.tabCount)},(_,i)=>`L${i}`).map(id => ({ id, label:scene.sample==='long'?`${id} · ${zh?'学习进度与详细课程内容':'Learning progress and lesson details'}`:id, disabled:state==='disabled'&&id===`L${Number(scene.tabCount)-1}` }));
    const wanted=update?scene.tabActive:tab;
    const active=options.some(o=>o.id===wanted)?wanted:options[0].id;
    return <div className="preview-example"><BATabs selectedKey={active} onSelectionChange={key=>{setTab(key);update?.({tabActive:key});}}>
      <BATabList options={options} selectedKey={active} size={scene.size} appearance={scene.background} aria-label={zh ? '选择级别' : 'Choose level'} />
      {options.map(o => <BATabPanel key={o.id} id={o.id}><p className="preview-result">{zh ? '当前级别' : 'Current level'}: {o.id}</p></BATabPanel>)}
    </BATabs>{scene.background!=='light'&&<p className="candidate-label">{scene.background} · Candidate / Pending Approval</p>}
    {['hover','pressed','focus'].includes(state)&&<p>{zh?'悬停、按住或用方向键切换，观察真实交互。':'Hover, hold or use arrow keys to explore the actual interactions.'}</p>}</div>;
  }
  if (scene.component === 'lesson') {
    const isCurrent=state==='current';
    const cardState=(state==='default'||isCurrent?'start':state) as StairLessonState;
    const card=<StairLessonCard lessonId="library-preview" number={1} minutes={10} locale={scene.locale} titleLines={3} current={isCurrent}
      title={scene.sample === 'long' ? (zh ? '学习如何用完整的主题句介绍自己的观点和原因' : 'Writing a convincing topic sentence for a detailed opinion paragraph') : (zh ? '主题句' : 'Topic sentences')}
      state={cardState} onEnter={() => setNotice(zh ? '收到课程操作。组件示例不会进入学习记录。' : 'Lesson action received. This example does not write learner progress.')} />;
    return <div className="preview-example preview-example--center preview-example--solar">
      <div className={scene.composition==='terrace'?'lesson-composition':'lesson-alone'}>
        {isCurrent
          ? <SolarLessonPreview motionEnabled={scene.motion==='system'} params={{
              rayIntensity:scene.solarRayIntensity,rayLength:scene.solarRayLength,
              rayCount:scene.solarRayCount,bokeh:scene.solarBokeh,rimBoost:scene.solarRimBoost,
              glowSpread:scene.solarGlowSpread,brightness:scene.solarBrightness,
              borderColor:scene.solarBorderColor,glowColor:scene.solarGlowColor,
            }}>{card}</SolarLessonPreview>
          : card}
        {scene.composition==='terrace'&&<LandscapeTerrace/>}
      </div>
      {isCurrent?<p className="review04-caption">{zh?'Current 是 Enterable 的强调视觉。此处与阶梯页使用同一个 Solar 组件。':'Current is a visual emphasis of Enterable. This is the same Solar wrapper used by Staircase.'}</p>:null}
      {output}
    </div>;
  }
  if (scene.component === 'unit') {
    const goals = zh ? [
      '写出一句清楚表达自己想法的主题句',
      '用两个理由和具体例子说明观点',
      '通过连接词让段落更连贯',
    ] : [
      'write a topic sentence that tells what you think',
      'give two reasons, each with an example, and a closing',
      'help your reader follow you with linking words',
    ];
    const unit = {
      id: 'lib-unit', index: 1, typeLabel: '', title: (scene.sample === 'long' || state === 'long')
        ? (zh ? '写出有说服力的观点段落并给出恰当的理由和证据' : 'Writing Convincing Opinion Paragraphs and Evidence')
        : (zh ? '观点段落' : 'Opinion Paragraph'),
      meta: zh ? '9 课 · 170 分钟' : '9 lessons · 170 mins', goals,
    };
    return <div className="preview-example preview-example--center">
      <div data-ba-product="writing" style={{ width: 320, maxWidth: '100%', background:'#a9e3f3', padding:20, boxSizing:'border-box', borderRadius:16 }}>
        <StairUnitCard locale={scene.locale} unit={unit} />
      </div>
    </div>;
  }

  if (scene.component === 'milestone') {
    const done=scene.mode==='state' ? state==='completed' : true;
    return <div className="preview-example preview-example--center review04-milestone-stage">
      <UnitMilestone unitId="preview-unit" title={zh?'观点段落':'Opinion Paragraph'} completed={done}
        celebrationEligible={false} locale={scene.locale}
        onCelebrate={()=>setNotice(zh?'已触发重播请求，组件库不修改学习记录。':'Replay event received; no learner progress is written.')}/>
      <p className="review04-caption">{done?'Completed · 金色、7 秒扫光、可点击':'Upcoming · 灰色、无扫光、不可点击'}</p>{output}
    </div>;
  }
  if (scene.component === 'transition') {
    const target=update?scene.transitionPage:transitionTarget;
    const view=(name:string)=><div className="review04-transition-page" data-page={name}>
      <h2>{name==='staircase'?(zh?'Writing · 阶梯页':'Writing · Staircase'):(zh?'Lesson 1 · 主题句':'Lesson 1 · Topic sentences')}</h2>
      <p>{name==='staircase'?(zh?'请选择课程开始学习':'Choose a lesson to start'):(zh?'Write your own topic sentence.':'Write your own topic sentence.')}</p>
    </div>;
    const go=(next:'staircase'|'lesson')=>{setTransitionTarget(next);update?.({transitionPage:next});};
    return <div className="preview-example review04-transition-stage">
      <div className="demo-actions"><button type="button" onClick={()=>go('staircase')}>Staircase</button><button type="button" onClick={()=>go('lesson')}>Lesson</button></div>
      <BAPageTransition viewKey={target} renderView={view}
        duration={scene.motion==='reduce'?0:scene.transitionDuration} maxBlur={scene.transitionBlur}
        reducedMotion={scene.motion==='reduce'}/>
      <p className="review04-caption">{zh?'此处独立模拟转场；真实 Writing 页面也已经使用同一组件。':'Isolated transition demo; real Writing navigation now uses the same visual component.'}</p>
    </div>;
  }
  if (scene.component === 'hamburger') {
    const layers=[
      {layerId:'top',label:zh?'Top bun · 观点':'Top bun · Opinion',value:zh?'我认为我们的学校应该有一座花园。':'Our school should have a garden.'},
      {layerId:'fill',label:zh?'Reason · 理由':'Reason',value:scene.sample==='long'?
        (zh?'花园不仅让我们观察植物，还能与同学合作进行很多有趣的自然科学活动。':'Gardens help students observe plants, collaborate and explore real science outside the classroom.') :
        (zh?'花园帮助我们学习和合作。':'A garden helps us learn and work together.')},
      {layerId:'bottom',label:zh?'Bottom bun · 结尾':'Bottom bun · Closing',value:zh?'这就是学校需要花园的原因。':'That is why our school needs a garden.'},
    ];
    return <div className="preview-example preview-example--center review04-hamburger-stage">
      <HamburgerComposition layers={layers}/>
      <p className="review04-caption">{zh?'设计候选：上下两层宽度为 Reason 的 88%，标题与示例句垂直居中。':'Candidate: buns are 88% of Reason width; title and example are vertically centered.'}</p>
    </div>;
  }
  if (scene.component === 'flag') {
    return <div className="preview-example preview-example--center review04-flag-stage">
      <LevelRewardFlag amplitude={scene.flagAmplitude} waves={scene.flagWaves}
        period={scene.flagPeriod} playing={scene.flagPlaying&&scene.motion==='system'}
        resetKey={scene.flagReset} imageSrc={flagLocalImage}/>
      <label className="review04-flag-local">替换本地旗帜图片（仅在当前浏览器内使用）
        <input type="file" accept="image/*" onChange={event=>{
          const file=event.target.files?.[0];if(!file)return;
          const reader=new FileReader();
          reader.onload=()=>setFlagLocalImage(typeof reader.result==='string'?reader.result:undefined);
          reader.readAsDataURL(file);
        }}/>
      </label>
      <p className="review04-caption">Canvas · Period {scene.flagPeriod}s · Waves {scene.flagWaves} × π · Amplitude {scene.flagAmplitude}px · {scene.flagPlaying?'Playing':'Paused'}</p>
      <p className="review04-caption">来源 yarden，Stack Overflow answer 78383275，CC BY-SA 4.0。已改编为浏览器 Canvas。当前旧图仅临时演示。</p>
    </div>;
  }
  if (scene.component === 'words') return <WordPlayground scene={scene} update={update}/>;
  const tasks: TaskProgressItem[] = Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1), label: zh ? `活动 ${i + 1}` : `Activity ${i + 1}`,
    status: state === 'done' && i <= activity ? 'done' : state === 'skipped' && i < activity ? 'skipped' : i < 2 ? 'done' : i === 2 ? 'available' : 'locked',
  }));
  return <div className="preview-example preview-example--wide"><LessonTopBar lessonNumber={zh ? '第1课' : 'Lesson 1'}
    lessonTitle={scene.sample === 'long' || state === 'long' ? (zh ? '学习如何用主题句清晰表达自己的观点和理由' : 'Writing a convincing topic sentence for a detailed opinion paragraph') : (zh ? '主题句' : 'Topic sentences')}
    tasks={tasks} current={activity} canOpen={i => i <= 2} onNavigate={setActivity} locale={scene.locale}
    onBack={() => setNotice(zh ? '已触发返回；当前为组件预览。' : 'Back action received in component preview.')} />{output}</div>;
}
