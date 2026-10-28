import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
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
  it('loads 43 runtime G2-O screens and keeps lesson 2 locked until lesson 1 is done', () => {
    const course = session();
    expect(course.screens).toHaveLength(43);
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
    course.pick(0);
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
    expect(openBar?.tasks).toHaveLength(6);
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
    expect(document.querySelector('[data-testid="unit-fold"]')).toBeNull();
    expect(document.querySelector('.course-unit__identity')).toBeTruthy();
    expect(document.querySelector('.course-unit ul, .course-unit li')).toBeNull();
    expect(document.querySelector('.course-unit__goal')?.tagName).toBe('P');
    // An animated incoming card intentionally blocks accidental pointer entry.
    // The UI test waits for the first-visit animation before interacting.
    await waitFor(() => expect(document.querySelector('.staircase-viewport')).toHaveAttribute('data-intro', 'settled'), { timeout: 18000 });
    await user.click(document.querySelector('[data-lesson-focus="G2-O:1"]') as HTMLElement);

    await waitFor(() => expect(screen.getByRole('heading', { name: /good topic sentence/i })).toBeInTheDocument());
    expect(screen.getByTestId('lesson-footer')).toHaveAttribute('data-layout', 'pair');
    await user.click(await screen.findByRole('radio', { name: /Our school should have a garden/ }));
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByTestId('feedback')).toHaveTextContent(/Right\. You chose B/);
    expect(screen.getByTestId('feedback')).toHaveAttribute('data-outcome', 'correct');
    expect(screen.getByTestId('practice-burst')).toHaveAttribute('data-preset', 'ribbons-explosions');
    expect(screen.getByTestId('practice-burst')).toHaveAttribute('data-lesson', 'false');

    await user.click(screen.getByRole('button', { name: 'Back to my path' }));
    await waitFor(() => expect(document.querySelector('[data-lesson-id="G2-O:1"]')).not.toBeNull());
    const lessonOne = document.querySelector('[data-lesson-id="G2-O:1"]');
    expect(lessonOne).toHaveAttribute('data-state', 'continue');
    expect(lessonOne?.querySelector('[data-testid="lesson-row"]')).toHaveTextContent('Enter');

    await user.click(document.querySelector('[data-lesson-focus="G2-O:2"]') as HTMLElement);
    expect(screen.getByTestId('locked-note')).toHaveTextContent(/Lesson 1/);
    expect(screen.getByRole('heading', { name: /Level 2/ })).toBeInTheDocument();
    expect(course.inspect().screen).toBe(0);
  }, 20000);
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

describe('default L0/L1 display-only completion', () => {
  it('shows Level 0 and Level 1 lessons completed without writing progress or mastery', () => {
    const storage = createMemoryStorage();
    const course = session('', storage);
    const record = storage.getItem(ALEX_STATE_KEY);
    const saved = JSON.parse(record ?? '{}') as { done: Record<string, boolean>; tasks: Record<string, unknown>; checks: Record<string, unknown>; skills?: Record<string, string> };
    expect(saved.done).toEqual({});
    expect(saved.tasks).toEqual({});
    expect(saved.checks).toEqual({});
    expect(saved.skills).toBeUndefined();
    for (const levelId of ['L0', 'L1']) {
      const nodes = course.pathNodes(levelId);
      const lessons = nodes.filter((node) => node.kind === 'lesson');
      const milestones = nodes.filter((node) => node.kind === 'milestone');
      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons.every((node) => node.lesson?.courseState === 'done' && node.lesson.action === 'review')).toBe(true);
      expect(lessons.every((node) => node.lesson?.detail?.startsWith('Done'))).toBe(true);
      expect(lessons.some((node) => node.lesson?.detail === 'Opens later')).toBe(false);
      expect(milestones.every((node) => node.milestone?.completed)).toBe(true);
    }
    const live = course.pathNodes('L2').filter((node) => node.kind === 'lesson');
    expect(live.some((node) => node.lesson?.courseState !== 'done')).toBe(true);
    const l1Intro = course.pathNodes('L1').find((node) => node.kind === 'intro')?.intro ?? '';
    const l1 = course.levelPath.levels.find((level) => level.id === 'L1');
    expect(l1Intro).toBe(`${course.text(l1?.name)}. One step at a time, up to the top.`);
    expect(l1Intro).not.toMatch(/look around|open later|之后才打开|可以先看看/i);
    const l0 = course.levelPath.levels.find((level) => level.id === 'L0');
    const l0Intro = course.pathNodes('L0').find((node) => node.kind === 'intro')?.intro ?? '';
    expect(l0Intro).toBe(`${course.text(l0?.name)}. One step at a time, up to the top.`);
    const l2Intro = course.pathNodes('L2').find((node) => node.kind === 'intro')?.intro ?? '';
    expect(l2Intro).toMatch(/^In Level 2 you learn/);
    expect(storage.getItem(ALEX_STATE_KEY)).toBe(record);
    expect(course.inspect().tasks).toEqual({});
    expect(course.inspect().done).toEqual({});
    expect(course.unitMilestoneDone(course.playUnit(), true)).toBe(false);
    expect(course.openLesson('G2-O', 2)).toBe(false);
    const l1Unit = course.pathNodes('L1').find((node) => node.kind === 'unit')?.unit?.id ?? '';
    expect(course.openLesson(l1Unit, 1)).toBe(true);
    expect(course.view).toBe('preview');
    expect(course.inspect().done).toEqual({});
    expect(course.inspect().skills).toBeUndefined();
    course.backToPath();
    course.switchLevel('L1');
    course.replayMilestone(l1Unit);
    expect(course.celebration?.unitId).toBe(l1Unit);
    expect(course.celebration?.replay).toBe(true);
    expect(course.unitMilestoneDone(course.playUnit(), true)).toBe(false);
    expect(storage.getItem(ALEX_STATE_KEY)).toBe(record);
  });
});

describe('Lesson 1 screens 5–8', () => {
  it('shows one word hint after two wrong taps and keeps the placed word', async () => {
    const user = userEvent.setup();
    const course = session();
    reach(course, (screen) => screen.task === 'ss.L2-04');
    render(<CourseApp session={course} />);
    expect(screen.queryByRole('button', { name: /Start again|重新开始/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument(); // PRODUCT §12.1: one authored build group
    expect(screen.getByTestId('lesson-footer')).toHaveAttribute('data-span', 'rail');
    expect(screen.getByTestId('build-bench').textContent).not.toMatch(/…|\.{3}/);
    expect(screen.getAllByTestId('bench-blank')).toHaveLength(11);
    expect(screen.getByTestId('build-bench').querySelectorAll('button')).toHaveLength(0);
    const garden = screen.getByRole('button', { name: /^garden(?: ·.*)?$/ });
    await user.click(garden);
    expect(screen.getByRole('button', { name: /^garden(?: ·.*)?$/ })).not.toHaveAttribute('data-hint', 'true');
    expect(screen.getAllByTestId('bench-blank')).toHaveLength(11);
    await user.click(screen.getByRole('button', { name: /^garden(?: ·.*)?$/ }));
    expect(screen.getByRole('button', { name: /^garden(?: ·.*)?$/ })).toHaveAttribute('data-hint', 'true');
    expect(screen.getByRole('button', { name: 'school' })).not.toHaveAttribute('data-hint', 'true');
    expect(screen.getByTestId('feedback')).toHaveAttribute('data-outcome', 'wrong');
    await user.click(screen.getByRole('button', { name: 'our' }));
    expect(screen.getByTestId('bench-text')).toHaveTextContent(/our/i);
    expect(screen.getAllByTestId('bench-blank')).toHaveLength(10);
    expect(screen.getByTestId('build-bench').querySelectorAll('button')).toHaveLength(0);
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04']?.wrongTaps?.garden).toBe(2);
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04']?.built).toEqual(['our']);
    expect(course.screenDone(course.inspect().screen)).toBe(false);
  });

  it('does not count a short Apply, and offers Move on after two failed tries', () => {
    const course = session();
    reach(course, (screen) => screen.kind === 'apply' && screen.page === 'L2-04.apply');
    expect(course.activity()?.wordGrid?.groups.map((group) => group.label)).toEqual(['Opinion', 'Nouns', 'Adjectives', 'Marks']);
    course.setCanvas('Hi');
    expect(course.footer().primaryDisabled).toBe(true);
    course.pressPrimary();
    expect(course.feedback).toBe(''); // disabled primary cannot submit or create feedback
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

  it.skip('keeps the first failed check closed and completes the second hand-in without a pass', () => {
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

describe('integration v1 recovery and assessment boundaries',()=>{
 it('persists wrong-attempt feedback without regrading on reload',()=>{
  const storage=createMemoryStorage();const course=session('',storage);course.openLesson('G2-O',1);course.pressPrimary();course.pick(0);course.pressPrimary();const feedback=course.feedback;
  const restored=session('',storage);restored.openLesson('G2-O',1);expect(restored.activity()?.feedback).toBe(feedback);expect(restored.inspect().tasks['L2-04.skill:ts1'].tries).toBe(1);
 });
 it('inserts in a focused frame blank at the caret',()=>{
  const course=session();reach(course,s=>s.task==='ts8');course.setBlank(1,'kids play');course.focusBlank(1);course.setCaret(5,5);course.placeCard('need');expect(course.activity()?.frame?.blanks[1].value).toBe('kids need play');
 });
 it('preserves pasted and word-grid source spans while typing elsewhere',()=>{
  const course=session();reach(course,s=>s.kind==='apply');course.markPaste();course.setCanvas('Our garden.');course.setCaret(4,4);course.placeCard('school');course.setCanvas('Our school garden. More');
  const spans=course.inspect().regions['L2-04.apply'];expect(spans.some(s=>s.s==='paste')).toBe(true);expect(spans.some(s=>s.s==='grid')).toBe(true);expect(spans.at(-1)?.s).toBe('typed');
 });
 it.skip('requires writing plus at least two auto answers and preserves attempt-specific responses',()=>{
  const course=session();reach(course,s=>s.kind==='check');
  const answer=(picks:number[],writing:string)=>{course.pick(picks[0]);course.pressPrimary();course.pick(picks[1]);course.pressPrimary();if(course.activity()?.tapword)course.tapWord(2);else course.pick(picks[2]);course.pressPrimary();course.setCanvas(writing);course.pressPrimary();};
  answer([1,2,0],'pets');expect(course.inspect().checks['L2-04.check'].passed).toBe(false);course.pressPrimary();
  answer([2,2,2],'I believe kids should have pets at home.');expect(course.inspect().checks['L2-04.check'].passed).toBe(false);expect(course.screenDone(course.inspect().screen)).toBe(true);
  course.retryCheck();expect(course.inspect().checks['L2-04.check'].attempt).toBe(2);expect(course.inspect().regions['L2-04.check:a0:L2-04.mw']).toBeDefined();expect(course.inspect().regions['L2-04.check:a1:L2-04.mw']).toBeDefined();
 });
});

describe('integration v1 authored hints and tapword feedback',()=>{
 it('offers Apply hints without revealing, grading, or using an attempt',()=>{
  const course=session();reach(course,s=>s.kind==='apply');course.openHint();course.openHint();course.openHint();expect(course.activity()?.hints).toHaveLength(2);expect(course.activity()?.hintAction).toBeNull();expect(course.inspect().applies['L2-04'].tries).toBe(0);expect(course.screenDone(course.inspect().screen)).toBe(false);
 });
 it('locks a correctly checked tapword and keeps its correct mark on return',()=>{
  const course=session();reach(course,s=>s.task==='ts4');course.tapWord(1);course.pressPrimary();expect(course.activity()?.tapword?.locked).toBe(true);expect(course.activity()?.tapword?.words[1].correct).toBe(true);course.backToPath();course.openLesson('G2-O',1);expect(course.activity()?.tapword?.words[1].correct).toBe(true);
 });
});

describe('Review 06 runtime changes', () => {
  it('filters standalone Teach and Check pages and keeps Lesson 1 at six activities', () => {
    const course = session();
    expect(course.screens).toHaveLength(43);
    expect(course.liveIdx(0).map(index => course.screens[index].screen.id)).toEqual([
      'L2-04.t.ts1', 'L2-04.t.ts4', 'L2-04.t.ts3', 'L2-04.t.ss.L2-04', 'L2-04.t.ts8', 'L2-04.apply',
    ]);
  });

  it('keeps Tapword Shown open until a later correct Check', () => {
    const course = session();
    reach(course, screen => screen.task === 'ts4');
    const task = course.task('ts4');
    const fish = course.engine.tokens(task.text ?? '').findIndex(token => token.w === 'fish');
    course.tapWord(fish);
    course.pressPrimary();
    course.tapWord(fish);
    course.pressPrimary();
    const key = 'L2-04.skill:ts4';
    expect(course.inspect().tasks[key]?.status).toBe('shown');
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    expect(course.footer().primaryDisabled).toBe(true);
    const believe = course.engine.tokens(task.text ?? '').findIndex(token => token.w === 'believe');
    course.tapWord(believe);
    course.pressPrimary();
    expect(course.inspect().tasks[key]?.status).toBe('done');
    expect(course.screenDone(course.inspect().screen)).toBe(true);
  });

  it('requires an explicit Check after the final Guided Word Build token', () => {
    const course = session();
    reach(course, screen => screen.task === 'ss.L2-04');
    const task = course.task('ss.L2-04');
    for (const token of task.target ?? []) course.placeCard(token);
    const key = 'L2-04.skill:ss.L2-04';
    expect(course.inspect().tasks[key]?.status).toBe('open');
    expect(course.primaryReady()).toBe(true);
    course.pressPrimary();
    expect(course.inspect().tasks[key]?.status).toBe('done');
  });
});


describe('Review 02 contextual primary prerequisites', () => {
  it('disables an untouched single pick without grading, then enables Check after a choice', () => {
    const course = session();
    course.openLesson('G2-O', 1);
    expect(course.primaryReady()).toBe(false);
    expect(course.footer().primaryDisabled).toBe(true);
    const before = JSON.stringify(course.inspect().tasks);
    course.pressPrimary();
    expect(JSON.stringify(course.inspect().tasks)).toBe(before);
    course.pick(1);
    expect(course.primaryReady()).toBe(true);
    expect(course.footer().primaryDisabled).toBe(false);
    course.pressPrimary();
    expect(course.footer().primaryDisabled).toBe(false); // ready to advance after grading
  });

  it('enables multi-select Check after the first selection without treating it as correct', () => {
    const course = session();
    course.openLesson('G2-O', 1);
    const multiple = course.liveIdx(0)[2];
    const screen = course.screens[multiple].screen;
    const taskId = screen.task!;
    const authored = course.config.tasks.find(item => item.id === taskId)!;
    expect(authored.multi).toBe(true);
    const need = authored.answers?.length ?? 0;
    expect(need).toBe(3);
    course.inspect().screen = multiple;
    const key = `${screen.page}:${taskId}`;
    const selected = Array.from({length:need-1},(_,i)=>i);
    course.inspect().tasks[key] = {tries:0,status:'open',picked:selected};
    expect(course.footer().primaryDisabled).toBe(false);
    selected.push(need-1);
    expect(course.footer().primaryDisabled).toBe(false);
    selected.push(need);
    expect(course.footer().primaryDisabled).toBe(false);
    selected.splice(0, selected.length);
    expect(course.footer().primaryDisabled).toBe(true);
  });

  it.skip('preserves the authored blank-question navigation and first Hand in warning on P7', () => {
    const course = session();
    course.openLesson('G2-O', 1);
    course.inspect().screen = course.liveIdx(0)[7];
    expect(course.primaryReady()).toBe(true);
    expect(course.footer().primaryDisabled).toBe(false);
    expect(course.footer().primaryTestId).toBe('next-question');
    course.pressPrimary();
    expect(course.footer().primaryDisabled).toBe(false);
  });
});


describe('Review 03: hint-only coaching and one-selection Check', () => {
  it('never substitutes an answer or consumes a try after the entire hint ladder', () => {
    for (const id of ['ts1', 'ts4', 'ts3', 'ss.L2-04', 'ts8']) {
      const course = session();
      reach(course, s => s.task === id);
      const screenRef = course.screens[course.inspect().screen].screen;
      const taskKey = `${screenRef.page}:${screenRef.task}`;
      const before = JSON.stringify(course.inspect().regions);
      for (let step = 0; step < 5; step++) course.openHint();
      const record = course.inspect().tasks[taskKey];
      expect(record.status, id).toBe('open');
      expect(record.tries, id).toBe(0);
      expect(course.activity()?.hintAction, id).toBeNull();
      expect(course.screenDone(course.inspect().screen), id).toBe(false);
      expect(JSON.stringify(course.inspect().regions)).toBe(before);
      expect(record.picked?.length ?? 0).toBe(0);
      expect(record.sel ?? null).toBeNull();
    }
  });

  it('enables P3 multi Check at one option, but still judges against all authored correct options', () => {
    const course = session();
    reach(course, s => s.task === 'ts3');
    expect(course.footer().primaryDisabled).toBe(true);
    course.pick(1); // one fact, not the required three opinions
    expect(course.footer().primaryDisabled).toBe(false);
    course.pressPrimary();
    const screenRef = course.screens[course.inspect().screen].screen;
    const record = course.inspect().tasks[`${screenRef.page}:${screenRef.task}`];
    expect(record.tries).toBe(1);
    expect(record.status).toBe('open');
    expect(course.screenDone(course.inspect().screen)).toBe(false);
  });

  it('simplifies every Unit meta while preserving per-unit lesson totals and minutes', () => {
    const course = session();
    for (const id of ['L0','L1','L2']) {
      const units = course.pathNodes(id).filter(node => node.unit).map(node => node.unit!);
      for (const unit of units) {
        expect(unit.meta).toMatch(/^\d+ lessons(?: · \d+ mins)?$/);
        expect(unit.meta).not.toMatch(/about|of|Writing unit/i);
      }
    }
    course.toggleLocale();
    expect(course.pathNodes('L2').find(node => node.unit)?.unit?.meta).toMatch(/^\d+ 课(?: · \d+ 分钟)?$/);
  });
});

describe('Review 05 isolated lesson tests',()=>{
  it('resets lesson answers, tries, hints and gates in memory and preserves the real record byte for byte',()=>{
    const storage=createMemoryStorage({unrelated:'keep'}),formal=session('',storage);
    formal.openLesson('G2-O',1);formal.pressPrimary();formal.pick(0);formal.pressPrimary();formal.openHint();
    const before=storage.getItem(ALEX_STATE_KEY),receipts=storage.getItem(CELEBRATION_KEY);
    const test=formal.createLessonTestSession();
    expect(test.inspect().screen).toBe(0);expect(test.inspect().tasks).toEqual({});
    expect(test.canOpen(1)).toBe(false);expect(test.canOpen(5)).toBe(false);
    test.pressPrimary();test.pick(1);test.pressPrimary();test.openHint();test.backToPath();test.observePath();test.flush();
    expect(storage.getItem(ALEX_STATE_KEY)).toBe(before);expect(storage.getItem(CELEBRATION_KEY)).toBe(receipts);
    expect(storage.getItem('unrelated')).toBe('keep');expect(formal.inspect().screen).toBe(0);
    expect(formal.inspect().tasks['L2-04.skill:ts1'].tries).toBe(1);
    expect(test.inspect()).not.toBe(formal.inspect());
  });
  it('can retest a completed lesson, clear its skip and isolate even a full-unit milestone',()=>{
    const storage=createMemoryStorage(),formal=session('?skills=L2-04:writing',storage);
    satisfyAll(formal);formal.openLesson('G2-O',1);formal.flush();
    const before=storage.getItem(ALEX_STATE_KEY),test=formal.createLessonTestSession();
    expect(test.screenDone(0)).toBe(false);expect(test.inspect().skills?.['L2-04']).toBeUndefined();
    expect(test.unitMilestoneDone(test.playUnit(),true)).toBe(false);
    satisfyAll(test);test.backToPath();test.observePath();test.flush();
    expect(test.unitMilestoneDone(test.playUnit(),true)).toBe(true);
    expect(storage.getItem(ALEX_STATE_KEY)).toBe(before);
    const restored=session('',storage);restored.openLesson('G2-O',1);expect(restored.liveState(0)).toBe('skipped');
  });
  it('leaves every other lesson record intact in the isolated copy',()=>{
    const formal=session();formal.inspect().regions['L2-05.apply']=[{t:'Other lesson',s:'typed'}];
    formal.inspect().checks['L2-05.check']={attempt:1,q:2,history:[]};
    formal.openLesson('G2-O',1);const test=formal.createLessonTestSession();
    expect(test.inspect().regions['L2-05.apply']).toEqual([{t:'Other lesson',s:'typed'}]);
    expect(test.inspect().checks['L2-05.check'].q).toBe(2);
  });
  it('never derives Level flag completion from the display-only L0/L1 examples',()=>{
    const course=session();expect(course.pathNodes('L1').filter(n=>n.milestone).every(n=>n.milestone?.completed)).toBe(true);
    expect(course.levelRewardDone('L1')).toBe(false);expect(course.levelRewardDone('L2')).toBe(false);
  });
});


describe('Review 06 acceptance gates', () => {
  it('keeps every runtime lesson free from standalone P2/P7 while preserving all nine lesson records', () => {
    const course = session();
    expect(course.config.lessons).toHaveLength(9);
    expect(course.config.lessons.flatMap(lesson => lesson.screens).every(screen => screen.template !== 'P2' && screen.template !== 'P7')).toBe(true);
    expect(course.screens.filter(ref => ref.li === 0).map(ref => ref.screen.id)).toEqual([
      'L2-04.t.ts1', 'L2-04.t.ts4', 'L2-04.t.ts3', 'L2-04.t.ss.L2-04', 'L2-04.t.ts8', 'L2-04.apply',
    ]);
  });
  it('enters Lesson End only after the sixth, Apply, activity is complete', () => {
    const course = session();
    course.openLesson('G2-O', 1);
    satisfyAll(course, 0);
    const indexes = course.liveIdx(0);
    course.inspect().screen = indexes[indexes.length - 1];
    expect(course.screens[course.inspect().screen].screen.kind).toBe('apply');
    course.pressPrimary();
    expect(course.view).toBe('lessonEnd');
    expect(course.inspect().checks['L2-04.check']?.passed).toBeUndefined();
  });
});


describe('Review 06 final refinement: reversible WordGrid and correct-target semantics', () => {
  it('toggles a stable ordered-build tile without changing any other built words', () => {
    const course = session();
    reach(course, screen => screen.task === 'ss.L2-04');
    const group = course.activity()?.wordGrid?.groups[0];
    const our = group?.words.find(word => word.text === 'our');
    const school = group?.words.find(word => word.text === 'school');
    expect(our).toBeDefined();
    expect(school).toBeDefined();
    course.placeCard(our!.text, our!.id);
    course.placeCard(school!.text, school!.id);
    expect(course.activity()?.build?.bench).toMatch(/our school/i);
    expect(course.activity()?.wordGrid?.groups[0].words.find(word => word.id === our!.id)?.used).toBe(true);
    course.placeCard(our!.text, our!.id);
    expect(course.inspect().tasks['L2-04.skill:ss.L2-04']?.built).toEqual(['school']);
    expect(course.activity()?.wordGrid?.groups[0].words.find(word => word.id === our!.id)?.used).toBe(false);
    expect(course.activity()?.wordGrid?.groups[0].words.find(word => word.id === school!.id)?.used).toBe(true);
  });

  it('removes only the corresponding frame fill when reselecting its stable card ID', () => {
    const course = session();
    reach(course, screen => screen.task === 'ts8');
    const word = course.activity()?.wordGrid?.groups[0].words[0];
    expect(word).toBeDefined();
    course.focusBlank(0);
    course.setCaret(0, 0);
    course.placeCard(word!.text, word!.id);
    expect(course.activity()?.frame?.blanks[0].value).toContain(word!.text);
    expect(course.activity()?.wordGrid?.groups[0].words[0].used).toBe(true);
    course.placeCard(word!.text, word!.id);
    expect(course.activity()?.frame?.blanks[0].value).toBe('');
    expect(course.activity()?.wordGrid?.groups[0].words[0].used).toBe(false);
  });

  it('reveals unpicked valid Tapword target only after successful Check', () => {
    const course = session();
    reach(course, screen => screen.task === 'ts4');
    const task = course.task('ts4');
    const tokens = course.engine.tokens(task.text ?? '');
    const should = tokens.findIndex(token => token.w === 'should');
    const believe = tokens.findIndex(token => token.w === 'believe');
    expect(should).toBeGreaterThanOrEqual(0);
    expect(believe).toBeGreaterThanOrEqual(0);
    course.tapWord(should);
    expect(course.activity()?.tapword?.words[believe].revealed).toBe(false);
    course.pressPrimary();
    expect(course.activity()?.tapword?.words[should].correct).toBe(true);
    expect(course.activity()?.tapword?.words[believe].revealed).toBe(true);
    expect(course.activity()?.tapword?.words[believe].selected).toBe(false);
  });
});
