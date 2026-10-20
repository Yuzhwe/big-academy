import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CourseSession, createMemoryStorage } from './courseSession';

const html = readFileSync(resolve(process.cwd(), 'apps/writing/source/alex-original.html'), 'utf8');

function openLesson() {
  const course = new CourseSession({ html, storage: createMemoryStorage() });
  expect(course.openLesson('G2-O', 1)).toBe(true);
  return course;
}

const GARDEN = [
  'Our school should have a garden because students can grow food.',
  'I believe a school garden would teach every class how plants grow.',
  'I think our school garden should give children a real place to work.',
].join('\n');

describe('Lesson 1 eight-screen flow', () => {
  it('grades practice, apply, and a passing check without a second score', () => {
    const course = openLesson();
    expect(course.activity()?.kind).toBe('learn');
    course.pressPrimary();

    course.pick(1);
    course.pressPrimary();
    expect(course.activity()?.feedback).toMatch(/Right/);
    course.pressPrimary();

    const believe = course.activity()?.tapword?.words.find((word) => word.text === 'believe');
    expect(believe).toBeTruthy();
    course.tapWord(believe!.index);
    course.pressPrimary();
    course.pressPrimary();

    for (const index of [0, 2, 4]) course.pick(index);
    course.pressPrimary();
    expect(course.activity()?.feedback).toMatch(/Right|Yes|That’s it|Good/);
    course.pressPrimary();

    const before = course.inspect().tasks['L2-04.skill:ss.L2-04']?.tries ?? 0;
    course.placeCard('garden');
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04']?.tries ?? 0).toBe(before);
    expect(course.activity()?.build?.cards.find((card) => card.text === 'garden')?.shake).toBe(true);
    for (const word of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.']) {
      course.placeCard(word);
    }
    expect(course.activity()?.build?.closed).toBe(true);
    course.pressPrimary();

    course.setDraft('In my opinion, recess should last longer because children need time to play outside.');
    course.pressPrimary();
    expect(course.activity()?.frame?.closed).toBe(true);
    course.pressPrimary();

    course.setDraft(GARDEN);
    course.pressPrimary();
    expect(course.activity()?.apply?.passed).toBe(true);
    course.pressPrimary();

    answerCheck(course, true);
    course.pressPrimary();
    expect(course.view).toBe('lessonEnd');
    expect(course.activity()?.lessonOutcome).toBe('passed');
    expect(course.activity()?.title).toMatch(/passed/i);
  });

  it('completes a second failed check without a pass, and review reopens screen 1', () => {
    const course = openLesson();
    jumpToCheck(course);
    answerCheck(course, false);
    expect(course.inspect().done['L2-04.check']).toBeUndefined();
    course.retryCheck();
    answerCheck(course, false);
    expect(course.inspect().done['L2-04.check']).toBe(true);
    expect(course.activity()?.check?.passed).toBe(false);
    course.pressPrimary();
    expect(course.activity()?.lessonOutcome).toBe('not-mastered');
    course.backToPathFromBreak();
    course.openLesson('G2-O', 1);
    expect(course.screens[course.inspect().screen]?.screen.id).toBe('L2-04.learn');
  });

  it('warns once about a blank check question, then hands in anyway', () => {
    const course = openLesson();
    jumpToCheck(course);
    course.pick(1);
    course.pressPrimary();
    course.pick(2);
    course.pressPrimary();
    const should = course.activity()?.tapword?.words.find((word) => word.text === 'should');
    course.tapWord(should!.index);
    course.pressPrimary();
    expect(course.footer().primaryTestId).toBe('hand-in-check');
    course.pressPrimary();
    expect(course.activity()?.check?.blankWarning).toMatch(/blank/i);
    expect(course.footer().primaryLabel).toMatch(/anyway/i);
    course.pressPrimary();
    expect(course.activity()?.check?.stage).toBe('results');
  });

  it('lets apply move on after two failed checks without a pass stamp', () => {
    const course = openLesson();
    jumpToApply(course);
    course.setDraft('The sky is blue today and the clouds look soft.');
    course.pressPrimary();
    course.pressPrimary();
    expect(course.activity()?.apply?.canMoveOn).toBe(true);
    expect(course.activity()?.apply?.passed).toBe(false);
    course.moveOnApply();
    expect(course.activity()?.apply?.movedOn).toBe(true);
    expect(course.activity()?.apply?.passed).toBe(false);
    expect(course.inspect().done['L2-04.apply']).toBe(true);
  });
});

function markBefore(course: CourseSession, screenId: string) {
  const index = course.screens.findIndex((ref) => ref.screen.id === screenId);
  course.screens.forEach((ref, screenIndex) => {
    if (screenIndex >= index) return;
    if (ref.screen.kind === 'task' || ref.screen.kind === 'model_task') {
      course.inspect().tasks[`${ref.screen.page}:${ref.screen.task}`] = { tries: 1, status: 'done' };
    } else if (ref.screen.kind === 'apply' || ref.screen.kind === 'check') {
      course.inspect().done[ref.screen.page] = true;
    } else course.inspect().seen[ref.screen.id] = true;
  });
  course.inspect().screen = index;
  course.openLesson('G2-O', 1);
  expect(course.screens[course.inspect().screen]?.screen.id).toBe(screenId);
}

function jumpToApply(course: CourseSession) {
  markBefore(course, 'L2-04.apply');
}

function jumpToCheck(course: CourseSession) {
  markBefore(course, 'L2-04.check');
}

function answerCheck(course: CourseSession, pass: boolean) {
  const writing = 'I believe kids should have a pet at home.';
  for (let guard = 0; guard < 8 && course.activity()?.check?.stage === 'answering'; guard += 1) {
    const activity = course.activity()!;
    const ask = activity.ask;
    if (activity.pick) {
      let index = 0;
      if (pass) {
        if (ask.includes('learn to cook')) index = 1;
        else if (ask.includes('FACT')) index = 2;
        else if (ask.includes('city or a village')) index = 0;
        else if (ask.includes('TOO NARROW')) index = 1;
      }
      course.pick(index);
    }
    if (activity.tapword) {
      const word = activity.tapword.words.find((item) => item.text === (pass ? 'should' : 'Our'));
      if (word) course.tapWord(word.index);
    }
    if (activity.writing) course.setDraft(pass ? writing : 'Hello.');
    const handingIn = course.footer().primaryTestId === 'hand-in-check';
    course.pressPrimary();
    if (handingIn && course.activity()?.check?.blankWarning) course.pressPrimary();
  }
}
