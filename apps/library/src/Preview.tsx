import { useState } from 'react';
import { BAButton, BAIcon, BAChoice, BATabs, BATabList, BATabPanel, type ChoiceVisualState, type TaskProgressItem } from '@big-academy/design-system';
import { LessonTopBar } from '../../writing/src/components/writing/LessonTopBar';
import { StairLessonCard, type StairLessonState } from '../../writing/src/components/writing/StairLessonCard';
import { StairUnitCard } from '../../writing/src/components/writing/StairUnitCard';
import { StairLevelIntroCard } from '../../writing/src/components/writing/StairLevelIntroCard';
import { UnitMilestone } from '../../writing/src/components/writing/UnitMilestone';
import { BAPageTransition } from '../../writing/src/components/writing/BAPageTransition';
import { LandscapeTerrace } from '../../writing/src/components/writing/LandscapeTerrace';
import { HamburgerComposition } from '../../writing/src/components/writing/HamburgerComposition';
import { LevelRewardFlag } from '../../writing/src/course/LevelRewardFlag';
import { CloudShaderSky, type CloudRenderer } from '../../writing/src/course/CloudShaderSky';
import { SolarLessonPreview } from './SolarLessonPreview';
import './Review04Preview.css';
import { CoachMessage } from '../../writing/src/components/writing/LessonWorkspace';
import { CoachNote } from '../../writing/src/components/writing/CoachNote';
import { WordPlayground } from './WordPlayground';
import { CoachChatPlayground } from './CoachChatPlayground';
import { PathBackToCurrentPlayground } from './PathBackToCurrentPlayground';
import { StartPoint, defaultStartPointText, START_POINT_LEVEL_COMBO_TILT_DEG } from '../../writing/src/components/writing/StartPoint';
import { NotebookEditor } from '../../writing/src/components/writing/NotebookEditor';
import { NotebookShellDemo } from './NotebookShellDemo';
import { choiceOptions, type Scene } from './catalog';

export function Preview({ scene, onSelected, update }: { scene: Scene; onSelected?: (keys: string[]) => void; update?: (patch: Partial<Scene>) => void }) {
  const [tab, setTab] = useState('L2');

  const [notice, setNotice] = useState('');
  const [cloudRenderer, setCloudRenderer] = useState<CloudRenderer>('lightweight');
  const [activity, setActivity] = useState(2);
  const [transitionTarget,setTransitionTarget] = useState('staircase');
  const [flagLocalImage,setFlagLocalImage]=useState<string|undefined>();
  const zh = scene.locale === 'zh';
  const state = scene.mode === 'state' ? scene.state : 'default';
  const output = notice ? <output className="preview-result" aria-live="polite">{notice}</output> : null;

  if (scene.component === 'cloud') {
    return <section className="preview-example preview-example--cloud" data-testid="cloud-preview">
      <div style={{position:'relative',height:340,width:'100%',minWidth:300,overflow:'hidden',
        background:`linear-gradient(135deg, ${scene.skyTop}, ${scene.skyBottom})`}}>
        <CloudShaderSky mode={scene.cloudRenderMode} preset={scene.cloudPreset}
          skyTop={scene.skyTop} skyBottom={scene.skyBottom} cloudColor={scene.cloudColor}
          cloudCount={scene.cloudCount} driftSpeed={scene.driftSpeed}
          parallaxStrength={scene.parallaxStrength} cameraX={scene.cloudCameraX}
          cameraMaxTravel={1200} paused={scene.cloudPaused} reducedMotion={scene.motion==='reduce'}
          onRendererChange={setCloudRenderer} simulateWebGLUnavailable={scene.cloudSimulateUnavailable}/>
      </div>
      <output aria-live="polite">实际渲染：{cloudRenderer} · 相机 X = {scene.cloudCameraX}px · 视差 = {Math.round(scene.cloudCameraX*scene.parallaxStrength)}px</output>
      <p className="review04-caption">Shader / Lightweight 与正式 Staircase 使用同一 CloudShaderSky；原始 M4 Clear 和阶梯页当前颜色均为可比较候选，需设计师批准。</p>
    </section>;
  }
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

  if (scene.component === 'level') {
    const intro = (scene.sample === 'long' || state === 'long')
      ? (zh
        ? '在第 2 级，你会学写一个好段落：说出你的想法，用例子说明理由，再好好结尾。你还会学写“怎么做”的说明，和讲一个小故事。之后还会练习更长一点的段落，让读者跟着你的思路走。'
        : 'In Level 2 you learn to write one good paragraph: say what you think, give reasons with examples, and finish well. You will also explain how to do something and tell a short story. Later you practice slightly longer paragraphs so readers can follow your thinking.')
      : (zh
        ? '在第 2 级，你会学写一个好段落：说出你的想法，用例子说明理由，再好好结尾。你还会学写“怎么做”的说明，和讲一个小故事。'
        : 'In Level 2 you learn to write one good paragraph: say what you think, give reasons with examples, and finish well. You will also explain how to do something and tell a short story.');
    const levelCard = <StairLevelIntroCard locale={scene.locale} intro={intro} />;
    if (scene.composition === 'combo') {
      const label = scene.startPointText || defaultStartPointText(scene.locale);
      const sp = (
        <StartPoint
          locale={scene.locale}
          text={label}
          fill={scene.startPointFill}
          stroke={scene.startPointStroke}
          ink={scene.startPointInk}
          onTextChange={(next) => update?.({ startPointText: next })}
        />
      );
      return <div className="preview-example preview-example--center" data-testid="start-point-level-combo" style={{padding:'56px 24px 32px',background:'#a9e3f3'}}>
        <div className="start-point-level-combo" data-ba-product="writing" style={{['--sp-combo-tilt' as string]: `${START_POINT_LEVEL_COMBO_TILT_DEG}deg`}}>
          <div className="start-point-level-combo__sp" data-tilt-deg={START_POINT_LEVEL_COMBO_TILT_DEG}>
            {sp}
          </div>
          <div className="start-point-level-combo__level">
            {levelCard}
          </div>
        </div>
        <p className="review04-caption">{zh
          ? `组合：Start Point 叠在 Level 卡（BA-WR-008 / .course-intro）顶边，倾斜 ${START_POINT_LEVEL_COMBO_TILT_DEG}°（tip 朝右上）。Level 卡顶 padding 48px 给 overlay 留空。字号 = 标题 tokens 24/800/30；Level 正文 16px。未接入 Writing 阶梯页。`
          : `Combo: Start Point rides the Level card (BA-WR-008 / .course-intro) top edge, tilted ${START_POINT_LEVEL_COMBO_TILT_DEG}° (tip upper-right). Level card top padding 48px for overlay clearance. SP type = title tokens 24/800/30; Level body 16px. Not wired into Writing staircase.`}</p>
      </div>;
    }
    return <div className="preview-example preview-example--center" data-testid="level-intro-preview">
      <div data-ba-product="writing" style={{ width: 320, maxWidth: '100%', background:'#a9e3f3', padding:20, boxSizing:'border-box', borderRadius:16 }}>
        {levelCard}
      </div>
      <p className="review04-caption">{zh
        ? 'BA-WR-008 StairLevelIntroCard · 现有 .course-intro Level 卡。橙色 Level Title Card 组合仍待实现。'
        : 'BA-WR-008 StairLevelIntroCard · existing .course-intro Level card. Orange Level Title Card composition still pending.'}</p>
    </div>;
  }

  if (scene.component === 'milestone') {
    const done=scene.mode==='state' ? state==='completed' : true;
    return <div className="preview-example preview-example--center review04-milestone-stage">
      <UnitMilestone unitId="preview-unit" title={zh?'观点段落':'Opinion Paragraph'} completed={done}
        celebrationEligible={false} locale={scene.locale}
        onCelebrate={()=>setNotice(zh?'已触发重播请求，组件库不修改学习记录。':'Replay event received; no learner progress is written.')}/>
      {output}
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
  if (scene.component === 'coach') {
    return <div className="preview-example" style={{width:'min(100%,420px)'}} data-testid="coach-message-preview">
      {(['orientation','hint','correct','wrong'] as const).filter(tone=>scene.mode!=='state'||tone===state).map(tone=><CoachMessage key={tone} tone={tone} locale={scene.locale} data-testid={`coach-message-${tone}`}>
        {zh?({orientation:'读一读题目，再选出你的答案。',hint:'找出表达作者观点的词。',correct:'你找到了主题句。',wrong:'再想一想，哪一句表达了观点？'}[tone]):({orientation:'Read the question and choose your answer.',hint:'Look for the word that shows an opinion.',correct:'You found the topic sentence.',wrong:'Look again for a sentence that shows an opinion.'}[tone])}
      </CoachMessage>)}
      <p className="review04-caption">{zh
        ? <>已并入 <a href="?component=coach-note">Coach Cards</a>（coach-note / coach-cards）。</>
        : <>Merged into <a href="?component=coach-note">Coach Cards</a> (coach-note / coach-cards).</>}</p>
    </div>;
  }
  if (scene.component === 'coach-note') {
    // Combined review always shows message tones; note tones still respect state mode.
    const messageTones = (['orientation','hint','correct','wrong'] as const);
    const noteTones = (['highlight', 'improvement'] as const).filter(tone => scene.mode !== 'state' || tone === state);
    const messages = zh
      ? {orientation:'读一读题目，再选出你的答案。',hint:'找出表达作者观点的词。',correct:'你找到了主题句。',wrong:'再想一想，哪一句表达了观点？'}
      : {orientation:'Read the question and choose your answer.',hint:'Look for the word that shows an opinion.',correct:'You found the topic sentence.',wrong:'Look again for a sentence that shows an opinion.'};
    const copy = zh
      ? {
          highlight: '有力的主题句：‘我认为学校应该有一座花园。’',
          improvement: '每一句都表达了你的看法吗？用 think、believe 或 should。另外：每句话都围绕学校花园。',
          highlightTitle: '亮点',
          improvementTitle: '改进',
        }
      : {
          highlight: "Strong topic sentence: 'I believe should not believe believe believe think seeds garden.'",
          improvement: 'Does every sentence tell me what you think? Use think, believe or should. Also: Keep every sentence about a school garden.',
          highlightTitle: 'Highlight',
          improvementTitle: 'Improvement',
        };
    // Combined visual review page: CoachMessage (BA-WR-014) above CoachNote (BA-WR-017).
    // Catalog key remains coach-note; standalone key `coach` is kept.
    return <div className="preview-example coach-combined-preview" style={{width:'min(100%,420px)'}} data-testid="coach-note-preview" data-coach-cards="true">
      <section className="coach-combined-preview__section" data-testid="coach-message-section" aria-label={zh ? 'Coach 文字卡' : 'Coach message cards'}>
        <h3 className="coach-combined-preview__heading">{zh ? 'Coach Cards · 文字卡 BA-WR-014' : 'Coach Cards · Message BA-WR-014'}</h3>
        <div className="coach-combined-preview__messages" data-testid="coach-message-stack">
          {messageTones.map(tone => (
            <CoachMessage key={tone} tone={tone} locale={scene.locale} data-testid={`coach-message-${tone}`}>
              {messages[tone]}
            </CoachMessage>
          ))}
        </div>
      </section>
      <section className="coach-combined-preview__section" data-testid="coach-note-section" aria-label={zh ? 'Coach 批注卡' : 'Coach note cards'}>
        <h3 className="coach-combined-preview__heading">{zh ? 'Coach Cards · 批注卡 BA-WR-017' : 'Coach Cards · Note BA-WR-017'}</h3>
        <div className="coach-note-stack">
          {noteTones.map(tone => (
            <CoachNote key={tone} tone={tone} title={tone === 'highlight' ? copy.highlightTitle : copy.improvementTitle}>
              {copy[tone]}
            </CoachNote>
          ))}
        </div>
      </section>
      <p className="review04-caption">{zh
        ? 'Coach Cards 合页：上 CoachMessage（orientation / hint / correct / wrong），下 CoachNote Highlight（浅绿）→ Improvement（暖灰棕，间距 12px）。别名 ?component=coach-cards；旧 ?component=coach 重定向至此。'
        : 'Coach Cards: CoachMessage tones above; CoachNote Highlight (sage) then Improvement (warm taupe, 12px gap). Alias ?component=coach-cards; legacy ?component=coach redirects here.'}</p>
    </div>;
  }
  if (scene.component === 'coach-chat') {
    return <CoachChatPlayground scene={scene} />;
  }
  if (scene.component === 'path-back') {
    return <PathBackToCurrentPlayground scene={scene} update={update} />;
  }
  if (scene.component === 'flag') {
    return <div className="preview-example preview-example--center review04-flag-stage">
      <LevelRewardFlag completed={scene.mode!=='state'||state==='completed'} amplitude={scene.flagAmplitude} waves={scene.flagWaves}
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
      <p className="review04-caption">来源 yarden，Stack Overflow answer 78383275，CC BY-SA 4.0。已改编为浏览器 Canvas。本轮指定黄／灰旗布与原图旗杆；灰旗布的 Completed 文字待视觉审核。</p>
    </div>;
  }


  if (scene.component === 'notebook') {
    return <div className="preview-example preview-example--center preview-example--notebook" data-testid="notebook-shell-preview" style={{padding:'16px 16px 28px',background:'transparent',width:'100%',boxSizing:'border-box'}}>
      <div className="notebook-shell-frame" data-orientation={scene.orientation}>
        {/* Library-only interactive specimen: multi-tab WordGrid + editable area; Writing course does not assemble this. */}
        <NotebookShellDemo orientation={scene.orientation} locale={scene.locale === 'zh' ? 'zh' : 'en'} />
      </div>
      <details className="notebook-editor-compare" data-testid="notebook-editor-compare">
        <summary>{scene.locale === 'zh' ? '对照：旧 NotebookEditor（横线 + textarea）' : 'Compare: legacy NotebookEditor (ruled + textarea)'}</summary>
        <div data-testid="notebook-editor-preview" style={{padding:'16px 0 0',width:'100%',boxSizing:'border-box'}}>
          <NotebookEditor orientation={scene.orientation} />
        </div>
      </details>
    </div>;
  }
  if (scene.component === 'start-point') {
    const label = scene.startPointText || defaultStartPointText(scene.locale);
    const sp = (
      <StartPoint
        locale={scene.locale}
        text={label}
        fill={scene.startPointFill}
        stroke={scene.startPointStroke}
        ink={scene.startPointInk}
        onTextChange={(next) => update?.({ startPointText: next })}
      />
    );
    return <div className="preview-example preview-example--center" data-testid="start-point-preview" style={{padding:'48px 24px',background:'#fff'}}>
      {sp}
      <p className="review04-caption">{zh
        ? '左侧文案可编辑；宽度随文字测量，右侧装饰相对 split 锚定。无中缝斜线。字号 = 标题 tokens（24/30）。与 Level 组合见 level&composition=combo。未接入 Writing 阶梯页。'
        : 'Left text is editable; width is measured and the right cut stays anchored to the split. No mid slash. Type = title tokens (24/30). Level combo: ?component=level&composition=combo. Library preview only — not wired into Writing staircase.'}</p>
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
