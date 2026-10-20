import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CourseApp } from '../course/CourseApp';
import {
  ALEX_STATE_KEY,
  CELEBRATION_KEY,
  CourseSession,
  createMemoryStorage,
  type CourseSession as Session,
} from './courseSession';

const html = readFileSync(resolve(process.cwd(), 'apps/writing/source/alex-original.html'), 'utf8');

function session(search = '', storage = createMemoryStorage()) {
  return new CourseSession({ html, storage, search });
}

function satisfyAll(course: Session, lessonIndex?: number) {
  const state = course.inspect();
  const allowed = lessonIndex == null ? null : new Set(course.liveIdx(lessonIndex));
  course.screens.forEach((ref, index) => {
    if (allowed && !allowed.has(index)) return;
    const screenRef = ref.screen;
    if (screenRef.kind === 'task' || screenRef.kind === 'model_task') {
      state.tasks[`${screenRef.page}:${screenRef.task}`] = { tries: 1, status: 'done' };
    } else if (screenRef.kind === 'apply' || screenRef.kind === 'check') {
      state.done[screenRef.page] = true;
    } else if (screenRef.kind === 'plan_check') {
      state.done.plan = true;
    } else if (screenRef.kind === 'draft_write' || screenRef.kind === 'rev_cups' || screenRef.kind === 'rev_final') {
      state.feedback.drafts.push({ text: 'Our school should have a garden because it gives us real work.' });
      state.feedback.finished = true;
    } else if (screenRef.kind === 'plan_layer') {
      state.seen[screenRef.id] = true;
      for (const field of screenRef.fields ?? []) {
        state.regions[`plan.${field}`] = [{ t: 'Students should use the garden.', s: 'typed' }];
      }
    } else {
      state.seen[screenRef.id] = true;
    }
  });
}

describe('Alex course session', () => {
  it('loads 52 G2-O screens and keeps lesson 2 locked until lesson 1 is done', () => {
    const course = session();
    expect(course.screens).toHaveLength(52);
    expect(course.config.lessons).toHaveLength(9);
    expect(course.liveState(0)).toBe('current');
    expect(course.cardAction(course.playUnit(), 0, course.liveState(0))).toBe('start');
    expect(course.liveState(1)).toBe('locked');
    expect(course.canOpen(0)).toBe(true);
    expect(course.canOpen(course.liveIdx(1)[0])).toBe(false);
    expect(course.inspect().unlockAll).toBe(false);
  });

  it('refuses a locked lesson deep link and ignores a raw screen index', () => {
    const blocked = session('?lesson=2');
    expect(blocked.view).toBe('path');
    expect(blocked.inspect().screen).toBe(0);
    expect(blocked.message).toMatch(/Lesson 1|前一课/);

    const indexed = session('?screen=40');
    expect(indexed.view).toBe('path');
    expect(indexed.inspect().screen).toBe(0);
    expect(indexed.canOpen(40)).toBe(false);
  });

  it('clears a saved teacher unlock flag', () => {
    const storage = createMemoryStorage();
    const first = session('', storage);
    const saved = JSON.parse(storage.getItem(ALEX_STATE_KEY) ?? '{}') as { unlockAll?: boolean; screen?: number; v?: number };
    saved.unlockAll = true;
    saved.screen = 40;
    storage.setItem(ALEX_STATE_KEY, JSON.stringify(saved));
    const second = new CourseSession({ html, storage });
    expect(second.inspect().unlockAll).toBe(false);
    expect(second.canOpen(40)).toBe(false);
    expect(second.inspect().screen).toBe(0);
    expect(first.inspect().unlockAll).toBe(false);
  });

  it('checks a real L2-04 pick with Alex choiceGrade and saves under the Alex key', () => {
    const storage = createMemoryStorage();
    const course = session('', storage);
    expect(course.openLesson('G2-O', 1)).toBe(true);
    course.pressPrimary();
    expect(course.screens[course.inspect().screen].screen.task).toBe('ts1');
    course.pick(0);
    course.pressPrimary();
    expect(course.feedback).toMatch(/You chose A/);
    expect(course.screens[course.inspect().screen].screen.task).toBe('ts1');
    course.pick(1);
    course.pressPrimary();
    expect(course.feedback).toMatch(/Right\. You chose B/);
    expect(course.screenDone(course.inspect().screen)).toBe(true);
    const saved = JSON.parse(storage.getItem(ALEX_STATE_KEY) ?? '{}') as {
      tasks: Record<string, { status: string }>;
      unlockAll: boolean;
    };
    expect(saved.tasks['L2-04.skill:ts1'].status).toBe('done');
    expect(saved.unlockAll).toBe(false);
    expect(JSON.stringify(saved)).not.toContain('celebrated');
  });

  it('shows Continue only after saved work, and Review after the lesson is done', () => {
    const course = session();
    course.openLesson('G2-O', 1);
    course.backToPath();
    expect(course.cardAction(course.playUnit(), 0, course.liveState(0))).toBe('start');

    course.openLesson('G2-O', 1);
    course.pressPrimary();
    course.backToPath();
    expect(course.liveState(0)).toBe('current');
    expect(course.cardAction(course.playUnit(), 0, course.liveState(0))).toBe('continue');
    expect(course.liveState(1)).toBe('locked');

    satisfyAll(course, 0);
    for (const index of course.liveIdx(0)) {
      expect(course.screenDone(index), course.screens[index].screen.id).toBe(true);
    }
    expect(course.liveState(0)).toBe('done');
    expect(course.cardAction(course.playUnit(), 0, 'done')).toBe('review');
    expect(course.liveState(1)).toBe('available');
    expect(course.canOpen(course.liveIdx(1)[0])).toBe(true);
    expect(course.openLesson('G2-O', 2)).toBe(true);
    expect(course.unitMilestoneDone(course.playUnit(), true)).toBe(false);
  });

  it('applies Alex skill skip and revokes it when the check fails', () => {
    const course = session('?skills=L2-04:writing');
    expect(course.liveState(0)).toBe('skipped');
    expect(course.cardAction(course.playUnit(), 0, 'skipped')).toBe('review');
    expect(course.screenDone(0)).toBe(true);
    expect(course.liveState(1)).toBe('available');
    const bar = course.topBar();
    course.openLesson('G2-O', 1);
    const openBar = course.topBar();
    expect(openBar?.tasks.every((task) => task.status === 'skipped')).toBe(true);
    expect(openBar?.tasks).toHaveLength(8);
    course.checkFailed('L2-04');
    expect(course.liveState(0)).not.toBe('skipped');
    expect(course.screenDone(0)).toBe(false);
    expect(course.liveState(1)).toBe('locked');
    expect(course.canOpen(course.liveIdx(1)[0])).toBe(false);
    expect(bar).toBeNull();
  });

  it('auto-celebrates one new milestone once and does not treat the receipt as progress', () => {
    const storage = createMemoryStorage();
    const course = session('', storage);
    course.observePath();
    expect(course.celebration).toBeNull();
    expect(course.unitMilestoneDone(course.playUnit(), true)).toBe(false);
    satisfyAll(course);
    course.backToPath();
    course.observePath();
    expect(course.celebration?.unitId).toBe('G2-O');
    expect(course.celebration?.replay).toBe(false);
    const progress = storage.getItem(ALEX_STATE_KEY);
    course.dismissCelebration();
    course.observePath();
    expect(course.celebration).toBeNull();
    expect(storage.getItem(ALEX_STATE_KEY)).toBe(progress);
    expect(storage.getItem(CELEBRATION_KEY)).toContain('G2-O');

    const state = course.inspect();
    delete state.seen[course.screens[0].screen.id];
    delete state.tasks[`${course.screens[1].screen.page}:${course.screens[1].screen.task}`];
    course.observePath();
    expect(course.unitMilestoneDone(course.playUnit(), true)).toBe(false);
    satisfyAll(course);
    course.observePath();
    expect(course.celebration).toBeNull();
    expect(course.openNotice).toMatch(/still open/);
  });
});

describe('course slice UI', () => {
  it('starts lesson 1, checks the topic sentence, and returns to Continue', async () => {
    const user = userEvent.setup();
    const course = session();
    render(<CourseApp session={course} />);

    expect(screen.getByRole('heading', { name: /Level 2/ })).toBeInTheDocument();
    expect(screen.getByTestId('level-goal')).toHaveAttribute('data-formula', 'open');
    await user.click(document.querySelector('[data-lesson-focus="G2-O:1"]') as HTMLElement);

    expect(screen.getByRole('heading', { name: /Topic sentences/ })).toBeInTheDocument();
    expect(screen.getByText(/top bun/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('radio', { name: /Our school should have a garden/ }));
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByTestId('feedback')).toHaveTextContent(/Right\. You chose B/);

    await user.click(screen.getByRole('button', { name: 'Back to my path' }));
    const lessonOne = document.querySelector('[data-lesson-id="G2-O:1"]');
    expect(lessonOne).toHaveAttribute('data-state', 'continue');
    expect(lessonOne?.querySelector('[data-testid="lesson-row"]')).toHaveTextContent('Continue');

    await user.click(document.querySelector('[data-lesson-focus="G2-O:2"]') as HTMLElement);
    expect(screen.getByTestId('locked-note')).toHaveTextContent(/Lesson 1/);
    expect(screen.getByRole('heading', { name: /Level 2/ })).toBeInTheDocument();
    expect(course.inspect().screen).toBe(1);
  });
});

const BUILD_ORDER = ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.'];
const APPLY_PASS = [
  'I think our school should have a garden.',
  'I believe a school garden should help us learn.',
  'Our school should have a garden because it gives us real work.',
].join('\n');

function openLessonOne(course: Session) {
  expect(course.openLesson('G2-O', 1)).toBe(true);
}

describe('L2 lesson 1 original eight screens', () => {
  it('keeps the source screen order and does not celebrate a selection', () => {
    const course = session();
    openLessonOne(course);
    const ids = course.liveIdx(0).map((index) => course.screens[index].screen.id);
    expect(ids).toEqual([
      'L2-04.learn',
      'L2-04.t.ts1',
      'L2-04.t.ts4',
      'L2-04.t.ts3',
      'L2-04.t.ss.L2-04',
      'L2-04.t.ts8',
      'L2-04.apply',
      'L2-04.check',
    ]);
    course.pressPrimary();
    course.pick(1);
    expect(course.lessonBurst).toBe(false);
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    expect(course.topBar()?.tasks).toHaveLength(8);
  });

  it('shows an answer only after the second wrong try, and keeps it when navigating back', () => {
    const course = session();
    openLessonOne(course);
    course.pressPrimary();
    course.pick(0);
    course.pressPrimary();
    expect(course.feedback).toMatch(/You chose A/);
    expect(course.screenDone(1)).toBe(false);
    course.pick(0);
    course.pressPrimary();
    expect(course.inspect().tasks['L2-04.skill:ts1'].status).toBe('shown');
    expect(course.inspect().tasks['L2-04.skill:ts1'].credit).toBe(0);
    expect(course.feedback).toMatch(/right answer is B/i);
    course.pressPrimary();
    expect(course.screens[course.inspect().screen].screen.id).toBe('L2-04.t.ts4');
    course.pressBack();
    expect(course.screens[course.inspect().screen].screen.id).toBe('L2-04.t.ts1');
    expect(course.inspect().tasks['L2-04.skill:ts1'].status).toBe('shown');
    expect(course.activity()?.pick?.options.find((option) => option.index === 1)?.visual).toBe('shown');
  });

  it('completes build, fill, apply, and the check without unlocking the next lesson early', () => {
    const storage = createMemoryStorage();
    const course = session('', storage);
    openLessonOne(course);
    course.pressPrimary();
    course.pick(1);
    course.pressPrimary();
    expect(course.feedback).toMatch(/Right\. You chose B/);
    course.pressPrimary();

    course.tapWord(0);
    course.pressPrimary();
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    course.tapWord(1);
    course.pressPrimary();
    expect(course.screenDone(course.inspect().screen)).toBe(true);
    course.pressPrimary();

    course.pick(0);
    course.pressPrimary();
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    course.pick(2);
    course.pick(4);
    course.pressPrimary();
    expect(course.feedback).toMatch(/Right/);
    course.pressPrimary();

    expect(course.activity()?.screenId).toBe('L2-04.t.ss.L2-04');
    course.buildCell('school');
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    for (const word of BUILD_ORDER) course.buildCell(word);
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04']).toMatchObject({ status: 'done', how: 'set', credit: 0.5 });
    course.pressPrimary();

    course.setWriting('In my opinion, recess should be good because it is nice.');
    course.pressPrimary();
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    course.setWriting('In my opinion, recess should be longer because kids need time to run.');
    course.pressPrimary();
    expect(course.inspect().tasks['L2-04.skill:ts8'].status).toBe('done');
    course.pressPrimary();

    course.setWriting('Hello there friend');
    course.pressPrimary();
    expect(course.activity()?.apply?.passed).toBe(false);
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    course.setWriting(APPLY_PASS);
    course.pressPrimary();
    expect(course.activity()?.apply?.passed).toBe(true);
    expect(course.feedback).toMatch(/own writing/);
    course.pressPrimary();

    expect(course.activity()?.screenId).toBe('L2-04.check');
    expect(course.topBar()?.current).toBe(7);
    expect(course.lessonBurst).toBe(false);
    expect(course.liveState(1)).toBe('locked');
    course.pick(1);
    course.pressPrimary();
    expect(course.topBar()?.current).toBe(7);
    expect(course.activity()?.assessment?.index).toBe(1);
    course.pick(2);
    course.pressPrimary();
    course.tapWord(2);
    course.pressPrimary();
    course.setWriting('I think kids should have a pet at home.');
    course.pressPrimary();
    expect(course.activity()?.assessment?.passed).toBe(true);
    expect(course.activity()?.assessment?.stage).toBe('results');
    expect(course.inspect().done['L2-04.check']).toBe(true);
    // Original Pages.canOpen: the next lesson opens when this lesson's screens are done.
    expect(course.liveState(1)).toBe('available');
    course.pressPrimary();
    expect(course.view).toBe('lessonEnd');
    expect(course.lessonBurst).toBe(true);
    expect(storage.getItem(ALEX_STATE_KEY)).not.toContain('lessonBurst');
    expect(storage.getItem(CELEBRATION_KEY)).toContain('G2-O:1');
    course.backToPath();
    expect(course.cardAction(course.playUnit(), 0, course.liveState(0))).toBe('review');
    expect(course.liveState(1)).toBe('available');
  });

  it('warns about blank check answers, then fails and offers a new set', () => {
    const course = session();
    openLessonOne(course);
    for (let step = 0; step < 20 && course.screens[course.inspect().screen].screen.id !== 'L2-04.check'; step += 1) {
      const id = course.screens[course.inspect().screen].screen.id;
      if (id === 'L2-04.t.ts1') course.pick(1);
      if (id === 'L2-04.t.ts4') course.tapWord(1);
      if (id === 'L2-04.t.ts3') {
        course.pick(0);
        course.pick(2);
        course.pick(4);
      }
      if (id === 'L2-04.t.ss.L2-04') for (const word of BUILD_ORDER) course.buildCell(word);
      if (id === 'L2-04.t.ts8') course.setWriting('In my opinion, recess should be longer because kids need time to run.');
      if (id === 'L2-04.apply') course.setWriting(APPLY_PASS);
      course.pressPrimary();
    }
    expect(course.activity()?.screenId).toBe('L2-04.check');
    course.pressPrimary();
    course.pressPrimary();
    course.pressPrimary();
    course.pressPrimary();
    expect(course.feedback).toMatch(/still blank/);
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    course.pressPrimary();
    expect(course.activity()?.assessment?.passed).toBe(false);
    expect(course.footer().primaryTestId).toBe('retry-check-foot');
    const first = course.engine.masteryItems(course.pageOf('L2-04.check')!, 0);
    course.retryAssessment();
    const second = course.engine.masteryItems(course.pageOf('L2-04.check')!, 1);
    expect(second.slice(0, 3)).not.toEqual(first.slice(0, 3));
    expect(course.activity()?.assessment?.stage).toBe('answering');
  });

  it('lets apply writing move on without marking it a correct answer', () => {
    const course = session();
    openLessonOne(course);
    while (course.screens[course.inspect().screen].screen.id !== 'L2-04.apply') {
      const id = course.screens[course.inspect().screen].screen.id;
      if (id === 'L2-04.t.ts1') course.pick(1);
      if (id === 'L2-04.t.ts4') course.tapWord(4);
      if (id === 'L2-04.t.ts3') {
        course.pick(0);
        course.pick(2);
        course.pick(4);
      }
      if (id === 'L2-04.t.ss.L2-04') for (const word of BUILD_ORDER) course.buildCell(word);
      if (id === 'L2-04.t.ts8') course.setWriting('In my opinion, recess should be longer because kids need time to run.');
      course.pressPrimary();
    }
    course.setWriting('Hello there friend');
    course.pressPrimary();
    course.pressPrimary();
    expect(course.activity()?.apply?.canMoveOn).toBe(true);
    expect(course.activity()?.apply?.passed).toBe(false);
    course.moveOnApply();
    expect(course.screenDone(course.inspect().screen)).toBe(true);
    expect(course.activity()?.apply?.passed).toBe(false);
  });
});
