import { useState } from 'react';
import { BAButton, BAIcon, BAChoice, BATabs, BATabList, BATabPanel, type ChoiceVisualState, type TaskProgressItem } from '@big-academy/design-system';
import { LessonTopBar } from '../../writing/src/components/writing/LessonTopBar';
import { StairLessonCard, type StairLessonState } from '../../writing/src/components/writing/StairLessonCard';
import { LandscapeTerrace } from '../../writing/src/components/writing/LandscapeTerrace';
import { WordPlayground } from './WordPlayground';
import { choiceOptions, type Scene } from './catalog';

export function Preview({ scene, onSelected, update }: { scene: Scene; onSelected?: (keys: string[]) => void; update?: (patch: Partial<Scene>) => void }) {
  const [tab, setTab] = useState('L2');

  const [notice, setNotice] = useState('');
  const [activity, setActivity] = useState(2);
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
    const current=state==='currentStart'||state==='continue';
    const cardState=(state==='default'?'start':state==='currentStart'?scene.currentAction:state) as StairLessonState;
    return <div className="preview-example preview-example--center"><div className={scene.composition==='terrace'?'lesson-composition':'lesson-alone'}>
      <StairLessonCard lessonId="library-preview" number={1} minutes={10} locale={scene.locale} titleLines={3} current={current}
        title={scene.sample === 'long' ? (zh ? '学习如何用完整的主题句介绍自己的观点和原因' : 'Writing a convincing topic sentence for a detailed opinion paragraph') : (zh ? '主题句' : 'Topic sentences')}
        state={cardState} onEnter={() => setNotice(zh ? '收到课程操作。组件示例不会进入学习记录。' : 'Lesson action received. This example does not write learner progress.')} />
      {scene.composition==='terrace'&&<LandscapeTerrace/>}</div>{output}</div>;
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
