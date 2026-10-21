import { useState } from 'react';
import { BAButton, BAChoice, BAField, BAStatus } from '@big-academy/design-system';
import type { ActivityModel, CourseSession } from '../../product/courseSession';
import { WordGrid } from './WordGrid';
import './LessonActivityExtras.css';
export function LessonActivityExtras({activity,session}:{activity:ActivityModel;session:CourseSession}) {
  const zh=session.zh;
  const [reviewIndex,setReviewIndex] = useState<number|null>(null);
  const check = activity.assessment;
  const review = check?.result && reviewIndex!==null && check.result.answers[reviewIndex] ? (()=>{
    const answer=check.result!.answers[reviewIndex];
    const task=session.task(answer.id);
    const screen=session.screens[session.inspect().screen].screen;
    const stored=session.inspect().checks[screen.page];
    const response=stored?.responses?.[String(check.attempt)]?.[answer.id];
    return {answer,task,response,index:reviewIndex};
  })() : null;
  return <>
    {activity.build ? <section className="writing-build" data-testid="ordered-build">
      <h1 className="course-title">{activity.ask}</h1>
      <p className="writing-build__output" aria-live="polite" aria-label={zh?'已拼词语':'Built sentence'}>{activity.build.built.join(' ')|| (zh?'从下面选择词语':'Choose words below')}</p>
      <WordGrid groups={[{id:'set',label:zh?'词语卡':'Word cards',words:activity.build.cells.map((text,index)=>({id:String(index),text}))}]} activeGroup="set" onGroupChange={()=>{}} onInsert={id=>session.chooseBuild(Number(id))} disabled={activity.build.locked} locale={session.locale}/>
      {!activity.build.locked?<BAButton variant="secondary" onPress={()=>session.resetBuild()}>{zh?'重新开始':'Start again'}</BAButton>:null}
      {activity.build.locked?<BAStatus tone="correct">{zh?'完成的句子：':'Completed sentence: '}{activity.build.expected}</BAStatus>:null}
    </section>:null}
    {activity.writing?<section className="writing-compose" data-testid={activity.writing.type==='apply'?'apply-writing':'frame-fill'}>
      <h1 className="course-title">{activity.ask}</h1>
      <BAField label={activity.writing.label} multiline rows={activity.writing.type==='apply'?7:4}
        value={activity.writing.value} disabled={activity.writing.locked} onChange={value=>session.setWriting(value)} description={activity.writing.tip}/>
      {activity.writing.result?<div className="writing-compose__criteria" aria-label={zh?'写作检查结果':'Writing criteria'}>
        {activity.writing.result.checks.map(c=><BAStatus key={c.name} tone={c.passed?'correct':'warning'}>{c.passed?'✓':'○'} {c.name}</BAStatus>)}
      </div>:null}
    </section>:null}
    {check?<section className="writing-assessment" data-testid="mastery-assessment">
      {check.result ? <div className="writing-assessment__results" data-testid="mastery-results">
        <BAStatus tone={check.result.passed?'correct':'warning'}>
          {check.result.passed?(zh?'你通过了！':'You passed this check.'):zh?'还需要再试一次':'Not yet.'} {check.result.score} / {check.result.total}
        </BAStatus>
        {review ? <>
          <BAButton variant="secondary" onPress={()=>setReviewIndex(null)}>{zh?'全部结果':'All results'}</BAButton>
          <p className="writing-assessment__review-label">{(zh?'第':'Question ')+(review.index+1)} · {review.answer.correct?(zh?'回答正确':'Correct'):(zh?'需要改进':'Needs work')}</p>
          <h2>{session.text(review.task.ask)}</h2>
          {review.task.type==='pick' ? <BAChoice mode={review.task.multi?'multiple':'single'} label={session.text(review.task.ask)} disabled
            selectedKeys={(review.response?.picked??[]).map(x=>String(x))}
            options={(review.task.lines??[]).map((line,index)=>{
              const chosen=(review.response?.picked??[]).includes(index);
              const target=(review.task.answers??[]).includes(index);
              return {key:String(index),prefix:session.engine.choiceLetter(index),label:line,
                state:target?(chosen?'correct':'revealed'):(chosen?'incorrect':'dimmed')};
            })}
            onChange={()=>{}} /> : null}
          {review.task.type==='tapword' ? <div className="course-words" role="group" aria-label={session.text(review.task.ask)}>
            {session.engine.tokens(review.task.text??'').map((word,index)=>{
              const correct=(review.task.targets??[]).some(target=>session.engine.locate(review.task.text??'',target)===index);
              const chosen=review.response?.sel===index;
              return <span key={index} className="course-word" data-feedback={correct?(chosen?'correct':'revealed'):chosen?'incorrect':'dimmed'}>{word.w}</span>;
            })}
          </div>:null}
          {review.task.type==='write'||review.task.type==='edit'?<BAField multiline readOnly label={zh?'提交的答案':'Submitted answer'} value={review.response?.text??''} onChange={()=>{}}/>:null}
          <BAStatus tone={review.answer.correct?'correct':'hint'}>{session.text(review.task.why)}</BAStatus>
        </>:<>
          <ol className="writing-assessment__results-list">{check.result.answers.map((answer,index)=><li key={answer.id}>
            <button type="button" onClick={()=>setReviewIndex(index)} aria-label={(zh?'查看第':'Review question ')+(index+1)}>{zh?'第':'Question '}{index+1} · {answer.correct?'✓': '×'}</button>
          </li>)}</ol>
          {!check.result.passed?<BAButton variant="secondary" onPress={()=>{setReviewIndex(null);session.assessmentNewSet();}}>{zh?'再做一组':'Try a new set'}</BAButton>:null}
        </>}
      </div>:<>
        <div className="writing-assessment__head">
          <h1 className="writing-assessment__index" aria-label={(zh?'题目':'Question')+' '+(check.index+1)+' '+(zh?'共':'of')+' '+check.count}>{check.index+1}</h1>
          <div className="writing-assessment__dots" role="group" aria-label={zh?'题目导航':'Questions'}>
            {check.done.map((done,index)=><button type="button" key={index} aria-current={index===check.index?'step':undefined} aria-label={(zh?'第':'Question ')+(index+1)+(done?(zh?' 已作答':' answered'):'')} onClick={()=>session.assessmentNavigate(index)}>{done?'●':'○'}</button>)}
          </div>
        </div>
        <h2>{check.ask}</h2>
        {check.options?<BAChoice mode="single" label={check.ask}
          options={check.options.map(x=>({key:String(x.index),label:x.text,prefix:x.letter,state:x.selected?'selected':'idle'}))}
          selectedKeys={check.options.filter(x=>x.selected).map(x=>String(x.index))}
          onChange={keys=>{if(keys[0])session.assessmentPick(Number(keys[0]));}}/>:null}
        {check.words?<div className="course-words" role="group" aria-label={check.ask}>
          {check.words.map(word=><button type="button" key={word.index} className="course-word" data-selected={word.selected?'true':undefined} onClick={()=>session.assessmentTap(word.index)}>{word.text}</button>)}
        </div>:null}
        {check.kind==='write'||check.kind==='edit'?<BAField label={zh?'写你的答案':'Your answer'} multiline value={check.text} onChange={value=>session.assessmentText(value)}/>:null}
      </>}

    </section>:null}
  </>;
}
