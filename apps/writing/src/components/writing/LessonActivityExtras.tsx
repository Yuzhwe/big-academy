import { BAButton, BAChoice, BAField, BAStatus } from '@big-academy/design-system';
import type { ActivityModel, CourseSession } from '../../product/courseSession';
import { WordGrid } from './WordGrid';
import './LessonActivityExtras.css';
export function LessonActivityExtras({activity,session}:{activity:ActivityModel;session:CourseSession}) {
  const zh=session.zh;
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
    {activity.assessment?<section className="writing-assessment" data-testid="mastery-assessment">
      <div className="writing-assessment__head">
        <h1 className="writing-assessment__index" aria-label={(zh?'题目':'Question')+' '+(activity.assessment.index+1)+' '+(zh?'共':'of')+' '+activity.assessment.count}>{activity.assessment.index+1}</h1>
        <div className="writing-assessment__dots" role="group" aria-label={zh?'题目导航':'Questions'}>
          {activity.assessment.done.map((done,index)=><button type="button" key={index} aria-current={index===activity.assessment?.index?'step':undefined} aria-label={(zh?'第':'Question ')+(index+1)+(done?(zh?' 已作答':' answered'):'')} onClick={()=>session.assessmentNavigate(index)}>{done?'●':'○'}</button>)}
        </div>
      </div>
      <h2>{activity.assessment.ask}</h2>
      {activity.assessment.options?<BAChoice mode="single" label={activity.assessment.ask} disabled={!!activity.assessment.result}
        options={activity.assessment.options.map(x=>({key:String(x.index),label:x.text,prefix:x.letter,state:x.selected?'selected':'idle'}))}
        selectedKeys={activity.assessment.options.filter(x=>x.selected).map(x=>String(x.index))}
        onChange={keys=>{if(keys[0])session.assessmentPick(Number(keys[0]));}}/>:null}
      {activity.assessment.words?<div className="course-words" role="group" aria-label={activity.assessment.ask}>
        {activity.assessment.words.map(word=><button type="button" key={word.index} className="course-word" data-selected={word.selected?'true':undefined} disabled={!!activity.assessment?.result} onClick={()=>session.assessmentTap(word.index)}>{word.text}</button>)}
      </div>:null}
      {activity.assessment.kind==='write'||activity.assessment.kind==='edit'?<BAField label={zh?'写你的答案':'Your answer'} multiline value={activity.assessment.text} onChange={value=>session.assessmentText(value)} disabled={!!activity.assessment.result}/>:null}
      {activity.assessment.result?<div className="writing-assessment__results">
        <BAStatus tone={activity.assessment.result.passed?'correct':'warning'}>{activity.assessment.result.passed?(zh?'你通过了！':'You passed this check.'):zh?'还需要再试一次':'Not yet.'} {activity.assessment.result.score} / {activity.assessment.result.total}</BAStatus>
        <ol>{activity.assessment.result.answers.map((answer,index)=><li key={answer.id}>{zh?'第':'Question '}{index+1}: {answer.correct?'✓':'×'}</li>)}</ol>
        {!activity.assessment.result.passed?<BAButton variant="secondary" onPress={()=>session.assessmentNewSet()}>{zh?'再做一组':'Try a new set'}</BAButton>:null}
      </div>:null}
    </section>:null}
  </>;
}
