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
    expect(screen.getAllByText(/top bun/i).length).toBeGreaterThan(0);
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

function reach(course: Session, match: (screen: Session['screens'][number]['screen']) => boolean) {
  const target = course.screens.findIndex((ref) => match(ref.screen));
  const state = course.inspect();
  for (let index = 0; index < target; index += 1) {
    const screenRef = course.screens[index].screen;
    if (screenRef.kind === 'task' || screenRef.kind === 'model_task') {
      state.tasks[`${screenRef.page}:${screenRef.task}`] = { tries: 1, status: 'done' };
    } else if (screenRef.kind === 'apply' || screenRef.kind === 'check') {
      state.done[screenRef.page] = true;
    } else {
      state.seen[screenRef.id] = true;
    }
  }
  state.screen = target;
  expect(course.openLesson('G2-O', 1)).toBe(true);
  expect(course.inspect().screen).toBe(target);
}

describe('Lesson 1 screens 5–8', () => {
  it('counts ordered-build misses across a correct tap and Start again', () => {
    const course = session();
    reach(course, (screen) => screen.task === 'ss.L2-04');
    const before = course.inspect().tasks['L2-04.skill:ss.L2-04']?.miss ?? 0;
    course.placeCard('garden');
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04']?.miss).toBe(before + 1);
    course.placeCard('our');
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04']?.miss).toBe(before + 1);
    course.startAgain();
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04']?.built).toEqual([]);
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04']?.miss).toBe(before + 1);
    expect(course.screenDone(course.inspect().screen)).toBe(false);
  });

  it('does not count a short Apply, and offers Move on after two failed tries', () => {
    const course = session();
    reach(course, (screen) => screen.kind === 'apply' && screen.page === 'L2-04.apply');
    course.setCanvas('Hi');
    course.pressPrimary();
    expect(course.feedback).toMatch(/Write a little first/);
    expect(course.inspect().applies['L2-04']?.tries ?? 0).toBe(0);
    course.setCanvas('Hello there friend');
    course.pressPrimary();
    course.setCanvas('Hello there again');
    course.pressPrimary();
    expect(course.inspect().applies['L2-04']?.tries).toBe(2);
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    expect(course.activity()?.applyMoveOn).toBe(true);
    course.moveOn();
    expect(course.screenDone(course.inspect().screen)).toBe(true);
    expect(course.inspect().applies['L2-04']?.passed).toBe(false);
  });

  it('keeps the first failed check closed and completes the second hand-in without a pass', () => {
    const course = session();
    reach(course, (screen) => screen.kind === 'check' && screen.page === 'L2-04.check');
    for (let step = 0; step < 3; step += 1) course.pressPrimary();
    course.pressPrimary();
    expect(course.feedback).toMatch(/still blank/);
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    course.pressPrimary();
    expect(course.feedback).toMatch(/Not yet/);
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    expect(course.inspect().checks['L2-04.check']?.passed).toBe(false);
    course.pressPrimary();
    for (let step = 0; step < 3; step += 1) course.pressPrimary();
    course.pressPrimary();
    course.pressPrimary();
    expect(course.screenDone(course.inspect().screen)).toBe(true);
    expect(course.inspect().checks['L2-04.check']?.passed).toBe(false);
    expect(JSON.stringify(course.inspect())).not.toContain('celebrated');
  });
});
