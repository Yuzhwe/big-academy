import { describe, expect, it } from 'vitest';
import { CourseSession, createMemoryStorage } from './courseSession';
import alexHtml from '../../source/alex-original.html?raw';

function at(index:number) {
  const session=new CourseSession({html:alexHtml,storage:createMemoryStorage()});
  session.inspect().screen=index;
  session.view='lesson';
  return session;
}
describe('L2/G2-O Lesson 1 authored P4–P7 integration',()=>{
  it('accepts the P4 ordered authored set without check shortcuts',()=>{
    const course=at(4);
    expect(course.activity()?.build?.built).toHaveLength(0);
    course.chooseBuild(1);
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04'].tries).toBe(0);
    expect(course.activity()?.build?.built).toHaveLength(0);
    const cells=course.task('ss.L2-04').cells??[];
    cells.forEach((_,i)=>course.chooseBuild(i));
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04'].status).toBe('done');
    expect(course.canNext(4)).toBe(true);
  });
  it('grades frame fill on check and leaves the activity open on first failure',()=>{
    const course=at(5);
    course.setWriting('In my opinion, recess should ___ because ___.');
    course.pressPrimary();
    expect(course.inspect().tasks['L2-04.skill:ts8'].status).toBe('open');
    expect(course.inspect().tasks['L2-04.skill:ts8'].tries).toBe(1);
    course.setWriting('In my opinion, recess should be longer because kids need time to run.');
    course.pressPrimary();
    expect(course.inspect().tasks['L2-04.skill:ts8'].status).toBe('done');
  });
  it('keeps offline Apply failures and allows move-on after two counted checks',()=>{
    const course=at(6);
    course.setWriting('Hi');
    course.pressPrimary();
    expect(course.inspect().applies['L2-04.apply'].checks).toBe(0);
    course.setWriting('Our school should have a garden.');
    course.pressPrimary();course.pressPrimary();
    expect(course.inspect().applies['L2-04.apply'].checks).toBe(2);
    expect(course.canNext(6)).toBe(false);
    course.pressPrimary();
    expect(course.canNext(6)).toBe(true);
    expect(course.inspect().applies['L2-04.apply'].moveOn).toBe(true);
  });
  it('requires writing plus two auto responses to pass original P7 mastery',()=>{
    const course=at(7);
    expect(course.activity()?.assessment?.id).toBe('tq1');
    course.assessmentPick(1);course.pressPrimary();
    expect(course.activity()?.assessment?.id).toBe('tq2');
    course.assessmentPick(2);course.pressPrimary();
    expect(course.activity()?.assessment?.id).toBe('tq3');
    course.assessmentTap(2);course.pressPrimary();
    expect(course.activity()?.assessment?.id).toBe('L2-04.mw');
    course.assessmentText('I think kids should have a pet at home.');
    course.pressPrimary();
    expect(course.inspect().checks['L2-04.check'].result?.score).toBe(4);
    expect(course.inspect().checks['L2-04.check'].passed).toBe(true);
    expect(course.screenDone(7)).toBe(true);
  });
  it('does not complete a failed first P7 set; completes an unsuccessful second set without mastery',()=>{
    const course=at(7);
    for(let q=0;q<3;q++)course.pressPrimary();
    course.pressPrimary();
    expect(course.inspect().checks['L2-04.check'].result).toBeUndefined();
    course.pressPrimary();
    expect(course.inspect().checks['L2-04.check'].result?.passed).toBe(false);
    expect(course.screenDone(7)).toBe(false);
    course.pressPrimary();
    expect(course.activity()?.assessment?.id).toBe('tq4');
    for(let q=0;q<3;q++)course.pressPrimary();
    course.pressPrimary();course.pressPrimary();
    expect(course.inspect().checks['L2-04.check'].result?.passed).toBe(false);
    expect(course.screenDone(7)).toBe(true);
  });
  it('reveals authored Apply hints without grading, changing attempts or unlocking',()=>{
    const course=at(6);
    const initial=course.activity();
    expect(initial?.hintAction).toBe('hint');
    course.openHint();
    expect(course.activity()?.hints).toHaveLength(1);
    expect(course.inspect().applies['L2-04.apply'].checks).toBe(0);
    expect(course.canNext(6)).toBe(false);
    course.openHint();
    expect(course.activity()?.hints).toHaveLength(2);
    expect(course.activity()?.hintAction).toBeNull();
  });
});