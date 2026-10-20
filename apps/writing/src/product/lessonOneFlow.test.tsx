import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CourseSession, createMemoryStorage } from './courseSession';

const html = readFileSync(resolve(process.cwd(), 'apps/writing/source/alex-original.html'), 'utf8');

function course() {
  return new CourseSession({ html, storage: createMemoryStorage() });
}

function openLesson(session = course()) {
  expect(session.openLesson('G2-O', 1)).toBe(true);
  return session;
}

const PASSING_APPLY = [
  'I think our school should have a garden.',
  'Our school should grow a garden for science.',
  'A school garden is the best outdoor classroom.',
].join('\n');

describe('Lesson 1 flow', () => {
  it('reveals a pick on the second miss and still completes the screen', () => {
    const session = openLesson();
    session.pressPrimary();
    session.pick(0);
    session.pressPrimary();
    expect(session.feedback).toMatch(/Try again/);
    expect(session.screenDone(session.inspect().screen)).toBe(false);
    session.pick(0);
    session.pressPrimary();
    expect(session.feedback).toMatch(/right answer is B/i);
    expect(session.activity()?.pick?.options.find((option) => option.letter === 'B')?.mark).toBe('revealed');
    expect(session.screenDone(session.inspect().screen)).toBe(true);
    expect(session.topBar()?.tasks[1]?.revealed).toBe(true);
  });

  it('shakes a wrong build card without a try, then accepts the ordered sentence', () => {
    const session = openLesson();
    advanceUntil(session, 'task');
    while (session.screens[session.inspect().screen].screen.task !== 'ss.L2-04') {
      const screen = session.screens[session.inspect().screen].screen;
      session.inspect().tasks[`${screen.page}:${screen.task}`] = { tries: 1, status: 'done' };
      session.pressPrimary();
    }
    const wrong = session.activity()?.build?.cards.find((card) => card.text === 'garden');
    expect(wrong).toBeTruthy();
    session.placeBuild(wrong!.index);
    session.placeBuild(wrong!.index);
    session.placeBuild(wrong!.index);
    const task = session.inspect().tasks['L2-04.skill:ss.L2-04'];
    expect(task.tries).toBe(0);
    expect(task.miss).toBe(3);
    expect(task.built ?? []).toEqual([]);
    expect(session.activity()?.build?.cards.some((card) => card.pulse)).toBe(true);
    for (const word of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.']) {
      const card = session.activity()?.build?.cards.find((item) => item.text === word && !item.used);
      expect(card, word).toBeTruthy();
      session.placeBuild(card!.index);
    }
    expect(session.screenDone(session.inspect().screen)).toBe(true);
    expect(session.inspect().tasks['L2-04.skill:ss.L2-04'].status).toBe('done');
  });

  it('counts an Apply try only after a real English attempt, then allows move on', () => {
    const session = openLesson();
    advanceUntil(session, 'apply');
    expect(session.screens[session.inspect().screen].screen.kind).toBe('apply');
    session.setWriting('Hi');
    session.pressPrimary();
    expect(session.feedback).toMatch(/Write a little first/);
    expect(session.inspect().applies['L2-04'].tries).toBe(0);
    session.setWriting('我想要一个花园，因为很好。');
    session.pressPrimary();
    expect(session.feedback).toMatch(/English/);
    expect(session.inspect().applies['L2-04'].tries).toBe(0);
    session.setWriting('I think the library is quiet.\nBooks should stay indoors.\nReading is the best indoor habit.');
    session.pressPrimary();
    session.pressPrimary();
    expect(session.inspect().applies['L2-04'].tries).toBe(2);
    expect(session.screenDone(session.inspect().screen)).toBe(false);
    expect(session.activity()?.apply?.canMoveOn).toBe(true);
    session.moveOnApply();
    expect(session.screenDone(session.inspect().screen)).toBe(true);
    expect(session.inspect().applies['L2-04'].passed).toBe(false);
  });

  it('rejects a leftover frame blank before the frame grader', () => {
    const session = openLesson();
    advanceUntil(session, 'task');
    while (session.screens[session.inspect().screen].screen.task !== 'ts8') {
      const screen = session.screens[session.inspect().screen].screen;
      if (screen.task) session.inspect().tasks[`${screen.page}:${screen.task}`] = { tries: 1, status: 'done' };
      session.pressPrimary();
    }
    session.setWriting('In my opinion, recess should ___ because ___.');
    session.pressPrimary();
    expect(session.feedback).toMatch(/Fill each ___/);
    expect(session.inspect().tasks['L2-04.skill:ts8'].tries).toBe(1);
    session.setWriting('In my opinion, recess should be longer because kids need time to play.');
    session.pressPrimary();
    expect(session.inspect().tasks['L2-04.skill:ts8'].status).toBe('done');
  });

  it('passes Apply without marking a correct stamp on the page record beyond done', () => {
    const session = openLesson();
    advanceUntil(session, 'apply');
    session.setWriting(PASSING_APPLY);
    session.pressPrimary();
    expect(session.inspect().applies['L2-04'].passed).toBe(true);
    expect(session.screenDone(session.inspect().screen)).toBe(true);
    expect(session.footer().primaryTestId).toBe('next');
  });

  it('warns once on a blank check, then completes the screen only after the second set fails', () => {
    const session = openLesson();
    advanceUntil(session, 'check');
    expect(session.screens[session.inspect().screen].screen.kind).toBe('check');
    session.jumpCheckQuestion(3);
    session.pressPrimary();
    expect(session.feedback).toMatch(/blank/i);
    expect(session.footer().primaryTestId).toBe('hand-in-check');
    expect(session.screenDone(session.inspect().screen)).toBe(false);
    session.pressPrimary();
    expect(session.feedback).toMatch(/Not yet/);
    expect(session.screenDone(session.inspect().screen)).toBe(false);
    expect(session.inspect().checks['L2-04.check'].attempt).toBe(0);
    session.pressPrimary();
    expect(session.inspect().checks['L2-04.check'].attempt).toBe(1);
    expect(session.screens[session.inspect().screen].screen.id).toBe('L2-04.check');
    session.jumpCheckQuestion(3);
    session.pressPrimary();
    session.pressPrimary();
    expect(session.screenDone(session.inspect().screen)).toBe(true);
    expect(session.inspect().checks['L2-04.check'].passed).toBe(false);
    expect(session.footer().primaryLabel).toMatch(/End of lesson/);
    session.pressPrimary();
    expect(session.view).toBe('lessonEnd');
    expect(session.activity()?.ending?.mastered).toBe(false);
  });

  it('passes the first check set and resumes a review at screen 1', () => {
    const session = openLesson();
    advanceUntil(session, 'check');
    answerPassingCheck(session);
    expect(session.inspect().checks['L2-04.check'].passed).toBe(true);
    expect(session.screenDone(session.inspect().screen)).toBe(true);
    session.pressPrimary();
    expect(session.view).toBe('lessonEnd');
    expect(session.activity()?.ending?.mastered).toBe(true);
    session.backToPathFromEnd();
    expect(session.view).toBe('path');
    expect(session.liveState(0)).toBe('done');
    session.openLesson('G2-O', 1);
    expect(session.screens[session.inspect().screen].screen.id).toBe('L2-04.learn');
  });
});

function advanceUntil(session: CourseSession, kind: string) {
  let guard = 0;
  while (session.screens[session.inspect().screen].screen.kind !== kind && guard < 12) {
    guard += 1;
    const screen = session.screens[session.inspect().screen].screen;
    if (screen.task) session.inspect().tasks[`${screen.page}:${screen.task}`] = { tries: 1, status: 'done' };
    else if (screen.kind === 'apply') session.inspect().done[screen.page] = true;
    else session.inspect().seen[screen.id] = true;
    session.pressPrimary();
  }
}

function answerPassingCheck(session: CourseSession) {
  const answers = [1, 2, null, 'I think kids should have a pet at home.'];
  answers.forEach((answer, index) => {
    if (index > 0) session.jumpCheckQuestion(index);
    if (typeof answer === 'number') session.pick(answer);
    else if (index === 2) session.tapWord(session.activity()?.check?.tapword?.words.find((word) => word.text === 'should')?.index ?? 2);
    else session.setWriting(String(answer));
  });
  session.jumpCheckQuestion(3);
  session.pressPrimary();
}
