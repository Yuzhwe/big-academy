import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CourseApp } from '../course/CourseApp';
import {
  ALEX_STATE_KEY,
  CELEBRATION_KEY,
  LESSON_CELEBRATION_KEY,
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

  it('keeps Screen 1 Previous inside the lesson and disabled', async () => {
    const user = userEvent.setup();
    const course = session();
    course.openLesson('G2-O', 1);
    render(<CourseApp session={course} />);
    const previous = screen.getByRole('button', { name: 'Previous' });
    expect(previous).toBeDisabled();
    await user.click(previous);
    expect(course.view).toBe('lesson');
    expect(course.inspect().screen).toBe(0);
    expect(screen.getByRole('button', { name: 'Back to my path' })).toBeEnabled();
  });

  it('inserts Apply word-grid text without grading or unlocking', async () => {
    const user = userEvent.setup();
    const course = session();
    expect(course.openLayoutReview('L2-04.apply')).toBe(true);
    render(<CourseApp session={course} />);
    expect(screen.getByTestId('layout-review')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Opinion' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tablist', { name: 'Sentence set' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Nouns' }));
    expect(screen.getByRole('tab', { name: 'Nouns' })).toHaveAttribute('aria-selected', 'true');
    const before = JSON.stringify(course.inspect().tasks);
    await user.click(screen.getByRole('button', { name: 'garden' }));
    expect((screen.getByTestId('apply-canvas') as HTMLTextAreaElement).value).toMatch(/garden/i);
    expect(JSON.stringify(course.inspect().tasks)).toBe(before);
    expect(course.inspect().done['L2-04.apply']).toBeUndefined();
    expect(course.canOpen(6)).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Check my writing' }));
    expect(screen.getByTestId('feedback')).toHaveTextContent(/does not count as an attempt/);
    expect(course.inspect().done['L2-04.apply']).toBeUndefined();

    await user.type(screen.getByTestId('apply-canvas'), 'I think our school should have a garden.');
    await user.click(screen.getByRole('button', { name: 'Check my writing' }));
    expect(screen.getByTestId('feedback')).toHaveTextContent(/does not grade this writing yet/);
    expect(course.inspect().done['L2-04.apply']).toBeUndefined();
    expect(course.canOpen(6)).toBe(false);
  });
});

function markScreen(course: Session, index: number) {
  const ref = course.screens[index].screen;
  const state = course.inspect();
  if (ref.kind === 'task' || ref.kind === 'model_task') {
    state.tasks[`${ref.page}:${ref.task}`] = { tries: 1, status: 'done' };
  } else if (ref.kind === 'apply' || ref.kind === 'check') {
    state.done[ref.page] = true;
  } else {
    state.seen[ref.id] = true;
  }
}

function reach(course: Session, local: number) {
  for (let index = 0; index < local; index += 1) markScreen(course, index);
  course.inspect().screen = local;
  expect(course.openLesson('G2-O', 1)).toBe(true);
  expect(course.inspect().screen).toBe(local);
}

describe('phase 2 lesson 1 flow', () => {
  it('debounces an edit and flushes a graded check immediately', () => {
    vi.useFakeTimers();
    try {
      const storage = createMemoryStorage();
      const course = session('', storage);
      course.openLesson('G2-O', 1);
      course.pressPrimary();
      course.pick(1);
      const mid = JSON.parse(storage.getItem(ALEX_STATE_KEY) ?? '{}') as { tasks?: Record<string, { picked?: number[] }> };
      expect(mid.tasks?.['L2-04.skill:ts1']?.picked).toBeUndefined();
      vi.advanceTimersByTime(250);
      const later = JSON.parse(storage.getItem(ALEX_STATE_KEY) ?? '{}') as { tasks: Record<string, { picked?: number[] }> };
      expect(later.tasks['L2-04.skill:ts1'].picked).toEqual([1]);
      course.pressPrimary();
      const graded = JSON.parse(storage.getItem(ALEX_STATE_KEY) ?? '{}') as { tasks: Record<string, { status: string }> };
      expect(graded.tasks['L2-04.skill:ts1'].status).toBe('done');
    } finally {
      vi.useRealTimers();
    }
  });

  it('refuses a locked forward jump and names the unfinished screen', () => {
    const course = session();
    course.openLesson('G2-O', 1);
    course.navigateLocal(3);
    expect(course.inspect().screen).toBe(0);
    expect(course.feedback).toMatch(/That page opens later/);
    expect(course.feedback).toMatch(/Finish this page first/);
    course.pressPrimary();
    course.navigateLocal(3);
    expect(course.inspect().screen).toBe(1);
    expect(course.feedback).toMatch(/That page opens later/);
    expect(course.feedback).toMatch(/Answer this one first/);
    expect(course.canOpen(3)).toBe(false);
    expect(course.topBar()?.tasks[3].status).toBe('locked');
    expect(course.topBar()?.tasks).toHaveLength(8);
  });

  it('restores the screen, answer, and tries after reload', () => {
    const storage = createMemoryStorage();
    const course = session('', storage);
    course.openLesson('G2-O', 1);
    course.pressPrimary();
    course.pick(0);
    course.pressPrimary();
    expect(course.inspect().tasks['L2-04.skill:ts1'].tries).toBe(1);
    course.flush();
    const screenIndex = course.inspect().screen;
    const restored = new CourseSession({ html, storage });
    restored.openLesson('G2-O', 1);
    expect(restored.inspect().screen).toBe(screenIndex);
    expect(restored.inspect().tasks['L2-04.skill:ts1']).toMatchObject({ tries: 1, status: 'open' });
    expect(restored.feedback).not.toMatch(/You chose A/);
  });

  it('keeps option sentences in English while the instruction is Chinese', () => {
    const course = session();
    course.openLesson('G2-O', 1);
    course.toggleLocale();
    expect(course.activity()?.learn?.teach).toMatch(/主题句/);
    expect(course.activity()?.learn?.strong).toMatch(/Our school should have a garden/);
    course.pressPrimary();
    const pick = course.activity()?.pick;
    expect(course.activity()?.ask).toMatch(/主题句/);
    expect(pick?.options.map((option) => option.text).join(' ')).toMatch(/Gardens have plants/);
    expect(pick?.options.map((option) => option.text).join(' ')).not.toMatch(/花园/);
  });

  it('builds the ordered sentence, keeps cumulative misses, and reveals nothing early', () => {
    const course = session();
    reach(course, 4);
    const wrong = () => {
      course.buildTap('garden');
    };
    wrong();
    expect(course.activity()?.build?.bench ?? '').not.toMatch(/garden/);
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04'].miss).toBe(1);
    course.buildTap('our');
    course.restartBuild();
    expect(course.activity()?.build?.bench ?? '').toBe('');
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04'].miss).toBe(1);
    wrong();
    wrong();
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04'].miss).toBe(3);
    expect(course.feedback).toMatch(/Read it out loud/);
    for (const token of ['our', 'school', 'should', 'have', 'a', 'garden', 'for', 'two', 'big', 'reasons', '.']) {
      course.buildTap(token);
    }
    expect(course.screenDone(4)).toBe(true);
    expect(course.canOpen(5)).toBe(true);
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04'].miss).toBe(3);
    expect(course.activity()?.build?.groups).toHaveLength(1);
  });

  it('grades the recess frame without treating a tab change as a check', () => {
    const course = session();
    reach(course, 5);
    expect(course.activity()?.write?.draft).toMatch(/___/);
    const before = course.activity()?.write?.draft;
    course.setWordGroup('opinion');
    expect(course.activity()?.write?.draft).toBe(before);
    expect(course.inspect().tasks['L2-04.skill:ts8']?.tries ?? 0).toBe(0);
    course.pressPrimary();
    expect(course.screenDone(5)).toBe(false);
    expect(course.inspect().tasks['L2-04.skill:ts8'].tries).toBe(1);
    course.setWritingText('In my opinion, recess should be longer because kids need time to run.');
    course.pressPrimary();
    expect(course.screenDone(5)).toBe(true);
    expect(course.feedback).toMatch(/what you think/);

    const vague = session();
    reach(vague, 5);
    vague.setWritingText('In my opinion, recess should be longer because it is good.');
    vague.pressPrimary();
    expect(vague.screenDone(5)).toBe(false);
    vague.pressPrimary();
    expect(vague.inspect().tasks['L2-04.skill:ts8'].status).toBe('shown');
    expect(vague.activity()?.write?.revealed).toMatch(/because/);
    expect(vague.activity()?.write?.revealed).not.toMatch(/kids need time to run/);
  });

  it('checks Apply with the offline grader and withholds Move on after a safety flag', () => {
    const course = session();
    reach(course, 6);
    course.setWritingText('Hi');
    course.pressPrimary();
    expect(course.feedback).toMatch(/Write a little first/);
    expect((course.inspect().applies['L2-04'] as { tries?: number } | undefined)?.tries ?? 0).toBe(0);
    course.setWritingText('I like lunch and books today.');
    course.pressPrimary();
    const failing = course.inspect().applies['L2-04'] as { tries: number; passed: boolean };
    expect(failing.tries).toBe(1);
    expect(failing.passed).toBe(false);
    expect(course.screenDone(6)).toBe(false);
    course.setWritingText('Cats sleep on warm chairs daily.');
    course.pressPrimary();
    expect(course.activity()?.apply?.moveOn).toBe(true);
    course.moveOn();
    expect(course.screenDone(6)).toBe(true);
    expect((course.inspect().applies['L2-04'] as { passed: boolean }).passed).toBe(false);
    expect(course.celebration).toBeNull();
    expect(course.lessonCelebration).toBeNull();

    const passing = session();
    reach(passing, 6);
    passing.setWritingText(
      'I think our school should have a garden.\nI believe a school garden is the best idea.\nOur school should grow a garden for science.',
    );
    passing.pressPrimary();
    expect(passing.screenDone(6)).toBe(true);
    expect((passing.inspect().applies['L2-04'] as { passed: boolean }).passed).toBe(true);
    expect(passing.lessonCelebration).toBeNull();

    const safety = session();
    reach(safety, 6);
    safety.setWritingText('I want to die in the garden today because it hurts.');
    safety.pressPrimary();
    safety.setWritingText('I want to die in the garden today because it hurts me.');
    safety.pressPrimary();
    expect(safety.screenDone(6)).toBe(false);
    expect(safety.activity()?.apply?.moveOn).toBe(false);
    expect(safety.activity()?.apply?.safetyHeld).toBe(true);
    expect(safety.feedback).toMatch(/show your teacher/);

    const cjk = session();
    reach(cjk, 6);
    cjk.setWritingText('我认为学校应该有一个花园 I think yes');
    cjk.pressPrimary();
    expect((cjk.inspect().applies['L2-04'] as { tries: number }).tries).toBe(1);
    expect(cjk.screenDone(6)).toBe(false);
  });

  it('keeps the check question index off the eight top-bar steps and does not celebrate an unmastered finish', () => {
    const course = session('?skills=L2-04:writing');
    course.openLesson('G2-O', 1);
    course.navigateLocal(7);
    course.pressPrimary();
    course.pressPrimary();
    course.pressPrimary();
    course.pressPrimary();
    expect(course.feedback).toMatch(/still blank/);
    expect((course.inspect().checks['L2-04.check'] as { finished?: boolean }).finished).toBe(false);
    course.pressPrimary();
    expect(course.activity()?.check?.mastered).toBe(false);
    expect(course.activity()?.check?.summary).toMatch(/Not yet/);
    expect(course.screenDone(7)).toBe(false);
    expect(course.celebration).toBeNull();
    expect(course.liveState(0)).not.toBe('skipped');
    expect(course.footer().primaryLabel).toBe('Try a new set');
    course.pressPrimary();
    expect(course.activity()?.check?.stage).toBe('answering');
    expect(course.activity()?.check?.numeral).toBe(1);
    expect(course.topBar()?.tasks).toHaveLength(8);
    expect(course.topBar()?.current).toBe(7);

    const fresh = session();
    reach(fresh, 7);
    fresh.selectCheckQuestion(2);
    expect(fresh.activity()?.check?.numeral).toBe(3);
    expect(fresh.topBar()?.current).toBe(7);
    expect(fresh.topBar()?.tasks).toHaveLength(8);
    fresh.selectCheckQuestion(0);
    const answer = (index: number) => {
      fresh.pick(index);
      fresh.pressPrimary();
    };
    answer(1);
    answer(2);
    const should = fresh.activity()?.check?.tapword?.words.find((word) => word.text === 'should');
    expect(should).toBeTruthy();
    fresh.tapWord(should?.index ?? -1);
    fresh.pressPrimary();
    fresh.setWritingText('I think kids should have a pet at home.');
    fresh.pressPrimary();
    expect(fresh.activity()?.check?.mastered).toBe(true);
    expect(fresh.activity()?.check?.summary).toMatch(/You passed this check/);
    expect(fresh.screenDone(7)).toBe(true);
    expect(fresh.celebration).toBeNull();
    expect(fresh.lessonCelebration?.lessonId).toBe('G2-O:1');
    const progress = fresh.inspect();
    fresh.settleLessonCelebration(true);
    expect(fresh.lessonCelebration).toBeNull();
    expect(fresh.inspect().checks['L2-04.check']).toEqual(progress.checks['L2-04.check']);
    expect(fresh.screenDone(7)).toBe(true);
    expect(fresh.topBar()?.tasks).toHaveLength(8);
    expect(fresh.topBar()?.current).toBe(7);

    const missed = session();
    reach(missed, 7);
    missed.pick(1);
    missed.pressPrimary();
    missed.pick(2);
    missed.pressPrimary();
    const word = missed.activity()?.check?.tapword?.words.find((item) => item.text === 'should');
    missed.tapWord(word?.index ?? -1);
    missed.pressPrimary();
    missed.setWritingText('I think lunch is the best meal.');
    missed.pressPrimary();
    expect(missed.activity()?.check?.mastered).toBe(false);
    expect(missed.screenDone(7)).toBe(false);
    missed.pressPrimary();
    missed.pick(0);
    missed.pressPrimary();
    missed.pick(0);
    missed.pressPrimary();
    missed.pick(0);
    missed.pressPrimary();
    missed.setWritingText('No pet here at all.');
    missed.pressPrimary();
    expect(missed.screenDone(7)).toBe(true);
    expect(missed.activity()?.check?.mastered).toBe(false);
    expect(missed.activity()?.check?.summary).toMatch(/Not yet/);
    expect(missed.celebration).toBeNull();
    expect(missed.lessonCelebration).toBeNull();
    expect(missed.footer().primaryLabel).toMatch(/End of lesson/);
    expect(missed.inspect().checks['L2-04.check']).toMatchObject({ q: 3, passed: false, finished: true });
  });

  it('keeps the full-lesson celebration receipt out of course progress', () => {
    const storage = createMemoryStorage();
    const course = session('', storage);
    reach(course, 7);
    course.pick(1);
    course.pressPrimary();
    course.pick(2);
    course.pressPrimary();
    const should = course.activity()?.check?.tapword?.words.find((word) => word.text === 'should');
    course.tapWord(should?.index ?? -1);
    course.pressPrimary();
    course.setWritingText('I think kids should have a pet at home.');
    course.pressPrimary();
    expect(course.lessonCelebration?.lessonId).toBe('G2-O:1');
    const progress = storage.getItem(ALEX_STATE_KEY);
    course.settleLessonCelebration(false);
    expect(storage.getItem(LESSON_CELEBRATION_KEY)).toBeNull();
    expect(storage.getItem(ALEX_STATE_KEY)).toBe(progress);
    const retry = new CourseSession({ html, storage });
    retry.openLesson('G2-O', 1);
    expect(retry.lessonCelebration?.lessonId).toBe('G2-O:1');
    expect(retry.celebration).toBeNull();
    const afterOpen = storage.getItem(ALEX_STATE_KEY);
    retry.settleLessonCelebration(true);
    expect(storage.getItem(ALEX_STATE_KEY)).toBe(afterOpen);
    expect(storage.getItem(LESSON_CELEBRATION_KEY)).toContain('G2-O:1');
    expect(storage.getItem(CELEBRATION_KEY)).toBeNull();
    const done = new CourseSession({ html, storage });
    done.openLesson('G2-O', 1);
    expect(done.lessonCelebration).toBeNull();
    expect(done.screenDone(7)).toBe(true);
    expect(done.activity()?.check?.mastered).toBe(true);
  });
});
