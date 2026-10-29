import { useEffect, useRef, useState } from 'react';
import { BAButton } from '@big-academy/design-system';
import { WordGrid, type WordSelection } from '../../writing/src/components/writing/WordGrid';
import { WordChip, type WordEvaluation } from '../../writing/src/components/writing/WordChip';
import { wordGroups } from './wordScenarios';
import type { Scene } from './catalog';
import '../../writing/src/course/course.css';

type TapEval = 'neutral' | 'correct' | 'incorrect' | 'hint' | 'shown' | 'correctUnselected';
type TapInteraction = 'selected' | 'used' | 'disabled' | 'shake';

const HINT_PULSE_MS = 1600; // 800ms × 2
const PULSE_CYCLE_MS = 5000; // hint + correctUnselected auto re-trigger

const evalDemos: Array<{ id: TapEval; text: string; captionZh: string; captionEn: string }> = [
  { id: 'neutral', text: 'believe', captionZh: '默认态 · 无评价色（静态）', captionEn: 'Default · no eval chrome (static)' },
  { id: 'correct', text: 'know', captionZh: '答对 · 实心成功绿+白字，无 inset（静态）', captionEn: 'Correct · solid success green + white (static)' },
  { id: 'incorrect', text: 'think', captionZh: '答错 · 同 selected 暖色 inset（静态）', captionEn: 'Incorrect · same as selected warm inset (static)' },
  { id: 'correctUnselected', text: 'garden', captionZh: '绿 inset 脉冲 800ms×2 后静止 · 每 5s 重播', captionEn: 'Green inset pulse ×2 then settle · replay every 5s' },
  { id: 'hint', text: 'should', captionZh: 'brand-dark inset 脉冲、无 outline · 播完回 default · 每 5s 重播', captionEn: 'Brand-dark inset pulse, no outline · clears · every 5s' },
  { id: 'shown', text: 'feel', captionZh: '系统展示答案 · 信息色（静态）', captionEn: 'Shown · info fill (static)' },
];

const SELECTED_FLASH_MS = 3000;
const SHAKE_SELECT_MS = 220;
const SHAKE_ANIM_MS = 280;

const interactionDemos: Array<{ id: TapInteraction; text: string; captionZh: string; captionEn: string }> = [
  { id: 'selected', text: 'plant', captionZh: '点击试玩 · 选中暖色 inset，约 3s 回 neutral', captionEn: 'Click · selected warm inset, ~3s → neutral' },
  { id: 'used', text: 'grow', captionZh: '已用 · 造句锁定灰（静态标本）', captionEn: 'Used · sentence-lock grey (static)' },
  { id: 'disabled', text: 'share', captionZh: '不可点 · 与 used 同锁定灰（静态）', captionEn: 'Disabled · same lock grey as used (static)' },
  { id: 'shake', text: 'maybe', captionZh: '点击试玩 · neutral→selected→shake(±5px+微旋)→neutral', captionEn: 'Click · neutral→selected→shake(±5px+tilt)→neutral' },
];

export function WordPlayground({scene,update}:{scene:Scene;update?:(patch:Partial<Scene>)=>void}) {
  const [candidateOpen, setCandidateOpen] = useState(false);
  const groups=wordGroups(scene), all=groups.flatMap(g=>g.words), build=scene.wordScenario==='B', forced=scene.mode==='state';
  const words=scene.wordAnswer.map(id=>all.find(w=>w.id===id)).filter(w=>w!==undefined);
  const zh=scene.locale==='zh';
  const stateSelection:WordSelection=['selected','used'].includes(scene.state)?scene.state as WordSelection:scene.wordSelection;
  const stateEvaluation:WordEvaluation=['correct','incorrect','hint','shown'].includes(scene.state)?scene.state as WordEvaluation:scene.wordEvaluation;
  // B 造句：点入答案后 selected+disabled（不可再点/不可撤销）；state 可切 selected + wordInteraction=disabled
  const display=groups.map(g=>({...g,words:g.words.map((w,i)=>({...w,
    selection:forced&&i===0?stateSelection:scene.wordAnswer.includes(w.id)?'selected':scene.wordSelected.includes(w.id)?'selected':'default',
    evaluation:forced&&i===0?(build&&stateSelection==='used'&&['correct','incorrect'].includes(stateEvaluation)?'neutral':stateEvaluation):scene.wordResult==='hint'&&w.id==='g0-w0'?'hint':scene.wordResult==='shown'&&w.id==='g0-w0'?'shown':scene.wordScenario==='E'&&scene.wordSelected.includes(w.id)&&['correct','incorrect'].includes(scene.wordResult)?scene.wordResult as WordEvaluation:'neutral',
    disabled:scene.wordInteraction==='disabled'||(forced&&scene.state==='disabled')||(build&&scene.wordAnswer.includes(w.id)),
  }))}));
  const change=(id:string)=>{
    if(build) {
      if(scene.wordAnswer.includes(id)) return; // locked: no undo
      update?.({wordAnswer:[...scene.wordAnswer,id],wordResult:'neutral'});
      return;
    }
    update?.({wordSelected:scene.wordSelected.includes(id)?scene.wordSelected.filter(v=>v!==id):[...scene.wordSelected,id],wordResult:'neutral'});
  };
  const check=()=>{ const correct=build?scene.wordAnswer.join(',')==='g0-w0,g0-w1,g0-w2,g0-w3':scene.wordSelected.length===1&&scene.wordSelected[0]==='g0-w0';update?.({wordResult:correct?'correct':'incorrect'}); };

  const prefersReducedMotion = () =>
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** hint pulse then clear; correctUnselected remount key to restart CSS pulse. Both every 5s. */
  const [hintActive, setHintActive] = useState(false);
  const [cuPulseKey, setCuPulseKey] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setHintActive(false);
      return;
    }
    let cancelled = false;
    let clearTimer: ReturnType<typeof setTimeout> | null = null;
    let cycleTimer: ReturnType<typeof setTimeout> | null = null;
    const runPulseCycle = () => {
      if (cancelled) return;
      setHintActive(true);
      setCuPulseKey((k) => k + 1);
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        if (!cancelled) setHintActive(false);
      }, HINT_PULSE_MS);
      cycleTimer = setTimeout(runPulseCycle, PULSE_CYCLE_MS);
    };
    runPulseCycle();
    return () => {
      cancelled = true;
      if (clearTimer) clearTimeout(clearTimer);
      if (cycleTimer) clearTimeout(cycleTimer);
    };
  }, []);

  const renderEvalSpecimen = (demo: (typeof evalDemos)[number]) => {
    let evaluation: WordEvaluation = demo.id === 'hint' ? (hintActive ? 'hint' : 'neutral') : demo.id;
    const isCu = demo.id === 'correctUnselected';
    return (
      <li key={`eval-${demo.id}`} className="word-playground__tapword-item">
        <WordChip
          key={isCu ? `cu-${cuPulseKey}` : `eval-${demo.id}`}
          evaluation={evaluation === 'neutral' ? undefined : evaluation}
          tabIndex={-1}
          aria-hidden="true"
          preventMouseDownDefault={false}
        >{demo.text}</WordChip>
        <span className="word-playground__tapword-label">{demo.id}</span>
        <span className="word-playground__tapword-caption">{zh ? demo.captionZh : demo.captionEn}</span>
      </li>
    );
  };

  type IxFlash =
    | { id: 'selected' }
    | { id: 'shake'; phase: 'selected' | 'shake' };
  const [ixFlash, setIxFlash] = useState<IxFlash | null>(null);
  const ixTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearIxTimers = () => {
    for (const timer of ixTimers.current) clearTimeout(timer);
    ixTimers.current = [];
  };
  useEffect(() => () => clearIxTimers(), []);

  const onSelectedDemo = () => {
    clearIxTimers();
    setIxFlash({ id: 'selected' });
    ixTimers.current = [setTimeout(() => setIxFlash(null), SELECTED_FLASH_MS)];
  };

  const onShakeDemo = () => {
    clearIxTimers();
    if (prefersReducedMotion()) {
      setIxFlash({ id: 'shake', phase: 'selected' });
      ixTimers.current = [setTimeout(() => setIxFlash(null), 200)];
      return;
    }
    setIxFlash({ id: 'shake', phase: 'selected' });
    const t1 = setTimeout(() => setIxFlash({ id: 'shake', phase: 'shake' }), SHAKE_SELECT_MS);
    const t2 = setTimeout(() => setIxFlash(null), SHAKE_SELECT_MS + SHAKE_ANIM_MS + 120);
    ixTimers.current = [t1, t2];
  };

  const renderInteractionSpecimen = (demo: (typeof interactionDemos)[number]) => {
    const id = demo.id;
    const used = id === 'used';
    const disabled = id === 'disabled';
    const clickable = id === 'selected' || id === 'shake';

    let selected = false;
    let shaking = false;
    if (clickable && ixFlash && ixFlash.id === id) {
      if (id === 'selected') selected = true;
      if (id === 'shake' && ixFlash.id === 'shake') {
        selected = true;
        shaking = ixFlash.phase === 'shake';
      }
    }

    return (
      <li key={`ix-${demo.id}`} className="word-playground__tapword-item">
        <WordChip
          selected={selected}
          used={used}
          disabled={disabled}
          shake={shaking}
          tabIndex={clickable ? 0 : -1}
          aria-hidden={clickable ? undefined : true}
          aria-label={clickable ? `${demo.text} · ${demo.id}` : undefined}
          preventMouseDownDefault={false}
          onClick={
            id === 'selected' ? onSelectedDemo : id === 'shake' ? onShakeDemo : undefined
          }
        >{demo.text}</WordChip>
        <span className="word-playground__tapword-label">{demo.id}</span>
        <span className="word-playground__tapword-caption">{zh ? demo.captionZh : demo.captionEn}</span>
      </li>
    );
  };

  return <div className="preview-example word-playground">
    <p className="demo-notice">{zh?'组件示例数据，不计学习成绩。新增反馈外观为 Candidate / Pending Approval。':'Component demo only · No learner score. New feedback visuals are candidates.'}</p>
    <section aria-label="选词题 tapword" className="word-playground__tapword" data-testid="tapword-course-word-preview">
      <h3>{zh ? '选词题 · course-word（对齐 WordGrid 词卡）' : 'Tapword · course-word (aligned to WordGrid cards)'}</h3>
      <p className="word-playground__tapword-heading">{zh
        ? '评价自动循环（hint / correctUnselected 每 5s 重播）· 交互：used/disabled 静态；selected/shake 可点试玩'
        : 'Evaluation auto-loop (hint / CU every 5s) · Interaction: used/disabled static; selected/shake click-to-demo'}</p>

      <p className="word-playground__tapword-subheading">{zh ? '评价 Evaluation · 始终展示' : 'Evaluation · always on'}</p>
      <ul className="course-words word-playground__tapword-live" lang="en" data-testid="tapword-eval-demos">
        {evalDemos.map((d) => renderEvalSpecimen(d))}
      </ul>

      <p className="word-playground__tapword-subheading">{zh ? '交互 Interaction · used/disabled 静态；selected/shake 点击' : 'Interaction · used/disabled static; selected/shake click'}</p>
      <ul className="course-words word-playground__tapword-live" lang="en" data-testid="tapword-interaction-demos">
        {interactionDemos.map((d) => renderInteractionSpecimen(d))}
      </ul>

      <p className="review04-caption">{zh
        ? '评价始终展示；hint / correctUnselected 每 5s 自动脉冲。交互：used/disabled 静态；selected/shake 点击试玩（shake 含 ±5px+微旋）。Writing 未改。'
        : 'Eval always on; hint / CU pulse every 5s. Interaction: used/disabled static; selected/shake click-to-demo (shake ±5px+tilt). Writing unchanged.'}</p>
    </section>

    <section aria-label="WordGrid 原版" className="word-playground__baseline">
      <h3>Approved baseline · 70px / 20px</h3>
      <WordGrid groups={display} activeGroup={scene.wordGroup} tabs={scene.wordTabs}
        tabAppearance="connected" locale={scene.locale}
        onGroupChange={wordGroup=>update?.({wordGroup})} onWordAction={w=>change(w.id)}/>
    </section>
    <details className="word-playground__candidate" onToggle={event => setCandidateOpen(event.currentTarget.open)}>
      <summary>Candidate · 56px / 18px <span>待视觉审核</span></summary>
      {candidateOpen ? <WordGrid groups={display} activeGroup={scene.wordGroup} tabs={scene.wordTabs}
        tabAppearance="connected" locale={scene.locale}
        onGroupChange={wordGroup=>update?.({wordGroup})} onWordAction={w=>change(w.id)}/> : null}
    </details>
    {build&&<section className="answer-bench" aria-label={zh?'答案区域':'Answer area'} data-result={forced&&stateSelection==='used'?stateEvaluation:scene.wordResult}>
      <h3>{zh?'自由拼句示例':'Free-build example'}</h3><p>{zh?'目标：We love gardens. 点入后词卡锁定（selected+灰），不可撤销；Reset 清空。':'Target: We love gardens. After tap, card locks (selected+grey) with no undo; Reset clears.'}</p>
      <div className="answer-tokens">{(forced&&stateSelection==='used'?all.slice(0,4):words).map((w,i)=><span key={`${w.id}-${i}`}>{w.text}</span>)}</div>
      {forced&&stateSelection==='used'&&<p>{stateEvaluation==='correct'?'✓ Correct':stateEvaluation==='incorrect'?'× Incorrect':'Used'} · {zh?'整句反馈':'Sentence feedback'}</p>}
      <p>{zh?'反馈作用于整句，不给词库中的每个词独立判分。':'Feedback applies to the sentence, not each used word.'}</p>
    </section>}
    {!forced&&<div className="demo-actions">
      <BAButton size={36} onPress={()=>update?.({wordSelected:[],wordAnswer:[],wordResult:'neutral'})}>{zh?'恢复默认':'Reset demo'}</BAButton>
      {(build||scene.wordScenario==='E')&&<BAButton size={36} disabled={build?!words.length:!scene.wordSelected.length} onPress={check}>{zh?'检查示例':'Check demo'}</BAButton>}
      {scene.wordScenario==='G'&&<><BAButton size={36} onPress={()=>update?.({wordResult:'hint'})}>{zh?'提示':'Hint'}</BAButton><BAButton size={36} onPress={()=>update?.({wordResult:'shown'})}>{zh?'展示答案':'Show answer'}</BAButton></>}
    </div>}
    <output className="preview-result" aria-live="polite">{scene.wordResult==='neutral'?(zh?`已选 ${scene.wordSelected.length} · 已用 ${scene.wordAnswer.length}`:`Selected ${scene.wordSelected.length} · Used ${scene.wordAnswer.length}`):({correct:zh?'✓ 示例检查：正确':'✓ Demo: correct',incorrect:zh?'× 示例检查：错误，请修改后重试':'× Demo: incorrect; edit and retry',hint:zh?'提示：留意第一个词。提示不代表判错。':'Hint: look at the first word. This is not a grade.',shown:zh?'系统展示答案：We。不是用户答对。':'System shown answer: We. Not a correct user answer.'}[scene.wordResult])}</output>
    {['hover','pressed','focus'].includes(scene.state)&&forced&&<p>{zh?'用鼠标悬停、按住或 Tab 键聚焦上方词卡，观察真实状态。':'Hover, hold, or Tab to the cards above to see real interaction states.'}</p>}
  </div>;
}
