import { useState } from 'react';
import { BAButton } from '@big-academy/design-system';
import { WordGrid, type WordSelection, type WordEvaluation } from '../../writing/src/components/writing/WordGrid';
import { wordGroups } from './wordScenarios';
import type { Scene } from './catalog';
export function WordPlayground({scene,update}:{scene:Scene;update?:(patch:Partial<Scene>)=>void}) {
  const [candidateOpen, setCandidateOpen] = useState(false);
  const groups=wordGroups(scene), all=groups.flatMap(g=>g.words), build=scene.wordScenario==='B', forced=scene.mode==='state';
  const words=scene.wordAnswer.map(id=>all.find(w=>w.id===id)).filter(w=>w!==undefined);
  const zh=scene.locale==='zh';
  const stateSelection:WordSelection=['selected','used'].includes(scene.state)?scene.state as WordSelection:scene.wordSelection;
  const stateEvaluation:WordEvaluation=['correct','incorrect','hint','shown'].includes(scene.state)?scene.state as WordEvaluation:scene.wordEvaluation;
  const display=groups.map(g=>({...g,words:g.words.map((w,i)=>({...w,
    selection:forced&&i===0?stateSelection:scene.wordAnswer.includes(w.id)?'selected':scene.wordSelected.includes(w.id)?'selected':'default',
    evaluation:forced&&i===0?(build&&stateSelection==='used'&&['correct','incorrect'].includes(stateEvaluation)?'neutral':stateEvaluation):scene.wordResult==='hint'&&w.id==='g0-w0'?'hint':scene.wordResult==='shown'&&w.id==='g0-w0'?'shown':scene.wordScenario==='E'&&scene.wordSelected.includes(w.id)&&['correct','incorrect'].includes(scene.wordResult)?scene.wordResult as WordEvaluation:'neutral',
    disabled:scene.wordInteraction==='disabled'||(forced&&scene.state==='disabled'),
  }))}));
  const change=(id:string)=>{
    if(build) { update?.({wordAnswer:scene.wordAnswer.includes(id)?scene.wordAnswer.filter(card=>card!==id):[...scene.wordAnswer,id],wordResult:'neutral'}); }
    else update?.({wordSelected:scene.wordSelected.includes(id)?scene.wordSelected.filter(v=>v!==id):[...scene.wordSelected,id],wordResult:'neutral'});
  };
  const check=()=>{ const correct=build?scene.wordAnswer.join(',')==='g0-w0,g0-w1,g0-w2,g0-w3':scene.wordSelected.length===1&&scene.wordSelected[0]==='g0-w0';update?.({wordResult:correct?'correct':'incorrect'}); };
  return <div className="preview-example word-playground">
    <p className="demo-notice">{zh?'组件示例数据，不计学习成绩。新增反馈外观为 Candidate / Pending Approval。':'Component demo only · No learner score. New feedback visuals are candidates.'}</p>
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
      <h3>{zh?'自由拼句示例':'Free-build example'}</h3><p>{zh?'目标：We love gardens. Check 前可再次点击词卡撤销。':'Target: We love gardens. Select or tap again to undo before Check.'}</p>
      <div className="answer-tokens">{(forced&&stateSelection==='used'?all.slice(0,4):words).map((w,i)=><span key={`${w.id}-${i}`}>{w.text}<button aria-label={`${zh?'撤销':'Remove'} ${w.text}`} onClick={()=>update?.({wordAnswer:scene.wordAnswer.filter((_,n)=>n!==i),wordResult:'neutral'})}>×</button></span>)}</div>
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
