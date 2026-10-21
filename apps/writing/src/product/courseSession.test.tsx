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

    const locked = document.querySelector('[data-lesson-focus="G2-O:2"]') as HTMLButtonElement;
    expect(locked).toBeDisabled();
    expect(locked.closest('[data-lesson-id="G2-O:2"]')).toHaveTextContent(/After Lesson 1/);
    expect(screen.getByRole('heading', { name: /Level 2/ })).toBeInTheDocument();
    expect(course.inspect().screen).toBe(1);
  });
});

describe('Lesson 1 eight-screen rules', () => {
  function open() {
    const storage = createMemoryStorage();
    const course = session('', storage);
    course.openLesson('G2-O', 1);
    return { course, storage };
  }

  it('keeps Previous off on screen 1 and does not preview the practice count', () => {
    const { course } = open();
    expect(course.footer().previousDisabled).toBe(true);
    expect(course.footer().backLabel).toBe('Previous');
    expect(course.activity()?.learn?.nextUp).toBe('');
    expect(course.activity()?.learn?.layers).toHaveLength(3);
    course.pressBack();
    expect(course.view).toBe('lesson');
  });

  it('grades tapword targets, multi-pick only on Check, and ignores a wrong build card', () => {
    const { course } = open();
    course.pressPrimary();
    course.pick(0);
    course.pressPrimary();
    expect(course.activity()?.feedbackKind).toBe('incorrect');
    expect(course.activity()?.pick?.options[0].visual).toBe('wrong');
    course.pick(1);
    course.pressPrimary();
    expect(course.activity()?.feedback).toMatch(/Right\. You chose B/);
    expect(course.particle?.kind).toBe('practice');

    course.pressPrimary();
    const tap = course.activity()?.tapword?.words ?? [];
    const believe = tap.find((word) => word.text === 'believe');
    const should = tap.find((word) => word.text === 'should');
    expect(believe && should).toBeTruthy();
    course.tapWord(believe!.index);
    course.pressPrimary();
    expect(course.activity()?.tapword?.words.find((word) => word.text === 'believe')?.visual).toBe('correct');

    course.pressPrimary();
    expect(course.activity()?.screenId).toBe('L2-04.t.ts3');
    course.pick(0);
    expect(course.activity()?.feedbackKind).toBe('none');
    course.pressPrimary();
    expect(course.activity()?.feedbackKind).toBe('incorrect');
    expect(course.activity()?.screenId).toBe('L2-04.t.ts3');
    course.pick(2);
    course.pick(4);
    course.pressPrimary();
    course.pressPrimary();
    expect(course.activity()?.screenId).toBe('L2-04.t.ss.L2-04');

    const taskKey = `${course.screens[course.inspect().screen].screen.page}:ss.L2-04`;
    course.placeCard('garden');
    expect(course.inspect().tasks[taskKey].tries).toBe(0);
    expect(course.inspect().tasks[taskKey].built ?? []).toEqual([]);
    for (const card of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.']) {
      course.placeCard(card);
    }
    expect(course.inspect().tasks[taskKey].status).toBe('done');
  });

  it('checks frame fill, Apply pass versus move-on, and P7 fail versus mastery', () => {
    const { course, storage } = open();
    const state = course.inspect();
    for (let index = 0; index < 5; index += 1) {
      const screenRef = course.screens[index].screen;
      state.tasks[`${screenRef.page}:${screenRef.task}`] = { tries: 1, status: 'done' };
      state.done[screenRef.page] = true;
      state.seen[screenRef.id] = true;
    }
    state.screen = 5;
    expect(course.activity()?.screenId).toBe('L2-04.t.ts8');
    course.setWriting('In my opinion, recess should be longer because kids need time to run.');
    course.pressPrimary();
    expect(course.inspect().tasks[`${course.screens[5].screen.page}:ts8`].status).toBe('done');

    course.pressPrimary();
    expect(course.activity()?.screenId).toBe('L2-04.apply');
    course.setWriting('I think our school should have a garden.\nI believe a school garden should grow food.\nOur class should use the garden for science.');
    course.pressPrimary();
    expect(course.inspect().applies['L2-04'].passed).toBe(true);
    expect(course.particle?.id).toBe('apply:L2-04.apply');
    course.acknowledgeParticle('apply:L2-04.apply');

    const fresh = session('', createMemoryStorage(storageSnapshot(storage)));
    fresh.openLesson('G2-O', 1);
    expect(fresh.inspect().screen).toBeGreaterThan(0);

    const failed = open().course;
    const failedState = failed.inspect();
    for (let index = 0; index < 7; index += 1) {
      const screenRef = failed.screens[index].screen;
      if (screenRef.task) failedState.tasks[`${screenRef.page}:${screenRef.task}`] = { tries: 1, status: 'done' };
      failedState.done[screenRef.page] = true;
      failedState.seen[screenRef.id] = true;
    }
    failedState.screen = 7;
    for (let step = 0; step < 4; step += 1) failed.pressPrimary();
    expect(failed.activity()?.feedback).toMatch(/still blank/);
    expect(failed.inspect().done['L2-04.check']).toBeUndefined();
    failed.pressPrimary();
    expect(failed.inspect().checks['L2-04.check'].passed).toBe(false);
    expect(failed.inspect().done['L2-04.check']).toBeUndefined();
    expect(failed.particle).toBeNull();
    failed.pressPrimary();
    for (let step = 0; step < 5; step += 1) failed.pressPrimary();
    expect(failed.inspect().done['L2-04.check']).toBe(true);
    expect(failed.inspect().checks['L2-04.check'].passed).toBe(false);
    failed.pressPrimary();
    expect(failed.view).toBe('lessonEnd');
    expect(failed.particle).toBeNull();
  });

  it('celebrates mastery only after a passed check reaches lesson end', () => {
    const course = open().course;
    const state = course.inspect();
    for (let index = 0; index < 7; index += 1) {
      const screenRef = course.screens[index].screen;
      if (screenRef.task) state.tasks[`${screenRef.page}:${screenRef.task}`] = { tries: 1, status: 'done' };
      state.done[screenRef.page] = true;
      state.seen[screenRef.id] = true;
    }
    state.screen = 7;
    course.pick(1);
    course.pressPrimary();
    course.pick(2);
    course.pressPrimary();
    const should = course.activity()?.tapword?.words.find((word) => word.text === 'should');
    course.tapWord(should!.index);
    course.pressPrimary();
    course.setWriting('I think our class should have a pet.');
    course.pressPrimary();
    expect(course.inspect().checks['L2-04.check'].passed).toBe(true);
    expect(course.particle).toBeNull();
    course.pressPrimary();
    expect(course.view).toBe('lessonEnd');
    expect(course.particle?.kind).toBe('mastery');
  });
});

function storageSnapshot(storage: Storage): Record<string, string> {
  const copy: Record<string, string> = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key) copy[key] = storage.getItem(key) ?? '';
  }
  return copy;
}
