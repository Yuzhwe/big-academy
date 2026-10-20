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

    const lockedLesson = document.querySelector('[data-lesson-focus="G2-O:2"]') as HTMLElement;
    expect(lockedLesson).toBeDisabled();
    expect(screen.getByRole('heading', { name: /Level 2/ })).toBeInTheDocument();
    expect(course.inspect().screen).toBe(1);
  });
});


describe('R1 Lesson 1 authored Apply and P7 gates', () => {
  const atLessonCheck = (course: Session) => {
    satisfyAll(course, 0);
    delete course.inspect().done['L2-04.check'];
    expect(course.openLesson('G2-O', 1)).toBe(true);
    course.navigateLocal(7);
    expect(course.screens[course.inspect().screen].screen.id).toBe('L2-04.check');
  };

  it('opens a completed lesson in Review at the first screen, retaining the assessed result', () => {
    const course = session();
    satisfyAll(course, 0);
    expect(course.openLesson('G2-O', 1)).toBe(true);
    course.navigateLocal(7);
    expect(course.inspect().screen).toBe(7);
    course.backToPath();
    expect(course.openLesson('G2-O', 1)).toBe(true);
    expect(course.inspect().screen).toBe(0);
    expect(course.canOpenLocal(7)).toBe(true);
  });

  it('presents the authored third assessment question as tapword, without grading before Hand in', () => {
    const course = session();
    atLessonCheck(course);
    course.assessmentQuestion(2);
    expect(course.activity()?.assessment?.question.id).toBe('tq3');
    expect(course.activity()?.assessment?.question.type).toBe('tapword');
    course.answerAssessment([2]); // Our / town / should / ...
    expect(course.activity()?.assessment?.results).toBeUndefined();
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    course.assessmentQuestion(0);
    course.answerAssessment([1]);
    course.assessmentQuestion(1);
    course.answerAssessment([2]);
    course.assessmentQuestion(3);
    course.answerAssessment('I think kids should have a pet at home.');
    course.pressPrimary();
    expect(course.activity()?.assessment?.results).toEqual([true, true, true, true]);
    expect(course.activity()?.assessment?.passed).toBe(true);
    expect(course.screenDone(course.inspect().screen)).toBe(true);
  });

  it('keeps failed first hand-in locked, warns once on blanks, and never calls second failure mastery', () => {
    const course = session();
    atLessonCheck(course);
    course.assessmentQuestion(3);
    course.pressPrimary(); // One unanswered warning, no grade
    expect(course.activity()?.assessment?.warning).toBe(true);
    expect(course.activity()?.assessment?.results).toBeUndefined();
    course.pressPrimary(); // Hand in anyway
    expect(course.activity()?.assessment?.passed).toBe(false);
    expect(course.screenDone(course.inspect().screen)).toBe(false);
    course.pressPrimary(); // Try a new set
    expect(course.activity()?.assessment?.attempt).toBe(1);
    expect(course.activity()?.assessment?.question.id).toBe('tq4');
    course.assessmentQuestion(3);
    course.pressPrimary();
    course.pressPrimary();
    expect(course.activity()?.assessment?.passed).toBe(false);
    expect(course.activity()?.assessment?.finished).toBe(true);
    expect(course.screenDone(course.inspect().screen)).toBe(true);
  });

  it('restores typed Apply text and does not convert Move on into a passed writing check', () => {
    const storage = createMemoryStorage();
    const course = session('', storage);
    satisfyAll(course, 0);
    delete course.inspect().done['L2-04.apply'];
    delete course.inspect().done['L2-04.check'];
    expect(course.openLesson('G2-O', 1)).toBe(true);
    course.navigateLocal(6);
    course.setWriting('A garden is good for everyone.');
    course.pressPrimary();
    course.pressPrimary();
    expect(course.activity()?.apply?.tries).toBe(2);
    expect(course.activity()?.apply?.passed).toBe(false);
    const resumed = session('', storage);
    expect(resumed.inspect().screen).toBe(course.inspect().screen);
    expect(resumed.openLesson('G2-O', 1)).toBe(true);
    expect(resumed.activity()?.apply?.text).toBe('A garden is good for everyone.');
    resumed.moveOnApply();
    expect(resumed.screenDone(resumed.inspect().screen)).toBe(true);
    expect(resumed.activity()?.apply?.passed).toBe(false);
  });
});
