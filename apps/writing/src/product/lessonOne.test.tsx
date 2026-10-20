import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CourseSession, createMemoryStorage, ALEX_STATE_KEY } from './courseSession';
const html = readFileSync(resolve(process.cwd(), 'apps/writing/source/alex-original.html'), 'utf8');
const create = () => new CourseSession({ html, storage: createMemoryStorage(), search: '?lesson=1' });
function practice(s: CourseSession) {
  s.pressPrimary();
  s.pick(1);
  s.pressPrimary();
  s.pressPrimary();
  s.tapWord(1);
  s.pressPrimary();
  s.pressPrimary();
  [0, 2, 4].forEach((i) => s.pick(i));
  s.pressPrimary();
  s.pressPrimary();
  for (const word of s.currentTask()!.target!) s.buildCard(word);
  s.pressPrimary();
  s.editRegion('L2-04.skill:ts8', 'In my opinion, recess should be longer because kids need time to play.');
  s.pressPrimary();
  s.pressPrimary();
}
const writing =
  'I think a garden would help us learn about plants.\nOur school should have a garden to grow fresh vegetables.\nThe best place for outdoor science lessons is our garden.';
describe('Lesson 1 canonical journey', () => {
  it('completes all five distinct practice interactions without bypassing gates', () => {
    const s = create();
    expect(s.canOpen(1)).toBe(false);
    practice(s);
    expect(s.state.screen).toBe(6);
    expect(s.canOpen(7)).toBe(false);
    expect(s.state.tasks['L2-04.skill:ss.L2-04'].credit).toBe(0.5);
  });
  it('does not grade selections, warns on empty, and distinguishes revealed from correct', () => {
    const s = create();
    s.pressPrimary();
    s.pressPrimary();
    expect(s.practiceState().tries).toBe(0);
    s.pick(0);
    expect(s.practiceState().tries).toBe(0);
    s.pressPrimary();
    expect(s.canOpen(2)).toBe(false);
    s.pick(2);
    s.pressPrimary();
    expect(s.practiceState().status).toBe('shown');
    expect(s.practiceState().credit).toBe(0);
    expect(s.canOpen(2)).toBe(true);
  });
  it('wrong ordered cards never consume tries and the third miss points to the needed card', () => {
    const s = create();
    s.pressPrimary();
    s.pick(1);
    s.pressPrimary();
    s.pressPrimary();
    s.tapWord(1);
    s.pressPrimary();
    s.pressPrimary();
    [0, 2, 4].forEach((i) => s.pick(i));
    s.pressPrimary();
    s.pressPrimary();
    for (let i = 0; i < 3; i++) s.buildCard('garden');
    expect(s.practiceState()).toMatchObject({ tries: 0, missStreak: 3, order: [] });
    expect(s.canOpen(5)).toBe(false);
  });
  it('keeps literal frame words, minimum word counts and vague reason rejection', () => {
    const s = create(),
      t = s.task('ts8'),
      st = { tries: 0, status: 'open' as const };
    for (const v of [
      'Recess should be longer because we need time to play.',
      'In my opinion, recess should ___ because ___.',
      'In my opinion, recess should be longer because it is good.',
    ])
      expect(s.grade(t, st, v).correct).toBe(false);
    expect(
      s.grade(t, st, 'In my opinion, recess should be longer because kids need time to play.').correct,
    ).toBe(true);
  });
  it('Apply follows authored criteria and empty/Chinese checks do not spend tries', async () => {
    const s = create();
    practice(s);
    await s.checkApply();
    expect(s.applyState().tries).toBe(0);
    s.editRegion('L2-04.apply', '这是一个花园。我喜欢学校。我们应该学习。');
    await s.checkApply();
    expect(s.applyState().tries).toBe(0);
    s.editRegion('L2-04.apply', writing);
    await s.checkApply();
    expect(s.applyState().passed).toBe(true);
    expect(s.canOpen(7)).toBe(true);
  });
  it('Apply needs two failures and an explicit move-on, without awarding a pass', async () => {
    const s = create();
    practice(s);
    s.editRegion('L2-04.apply', 'The garden has plants.');
    await s.checkApply();
    s.moveOnApply();
    expect(s.canOpen(7)).toBe(false);
    await s.checkApply();
    expect(s.canOpen(7)).toBe(false);
    s.moveOnApply();
    expect(s.canOpen(7)).toBe(true);
    expect(s.applyState().passed).toBe(false);
  });
  it('P7 warns once, rotates exact authored sets and ends after second failure without mastery', async () => {
    const s = create();
    practice(s);
    s.editRegion('L2-04.apply', writing);
    await s.checkApply();
    s.pressPrimary();
    expect(s.checkIds()).toEqual(['tq1', 'tq2', 'tq3', 'L2-04.mw']);
    s.setQuestion(3);
    s.pressPrimary();
    expect(s.checkState().history).toHaveLength(0);
    s.pressPrimary();
    expect(s.canNext(7)).toBe(false);
    s.newCheckSet();
    expect(s.checkIds()).toEqual(['tq4', 'tq5', 'tq1', 'L2-04.mw']);
    s.setQuestion(3);
    s.pressPrimary();
    s.pressPrimary();
    expect(s.canNext(7)).toBe(true);
    expect(s.checkState().passed).toBe(false);
    s.pressPrimary();
    expect(s.view).toBe('lessonEnd');
  });
  it('P7 requires writing in addition to at least two auto answers, then preserves graded review', async () => {
    const s = create();
    practice(s);
    s.editRegion('L2-04.apply', writing);
    await s.checkApply();
    s.pressPrimary();
    s.selectAnswer(1);
    s.pressPrimary();
    s.selectAnswer(2);
    s.pressPrimary();
    s.selectWord(0);
    s.pressPrimary();
    s.editRegion(s.checkKey(), 'I believe kids should have a pet at home.');
    s.pressPrimary();
    expect(s.checkState().passed).toBe(true);
    expect(s.checkState().history[0].score).toBe(3);
    s.setQuestion(0);
    s.selectAnswer(0);
    expect(s.checkAnswer(0).picked).toEqual([1]);
  });
  it('back, exit and re-entry retain attempts, hints, answer sources and feedback', () => {
    const storage = createMemoryStorage();
    const s = new CourseSession({ html, storage, search: '?lesson=1' });
    s.pressPrimary();
    s.openHint();
    s.pick(0);
    s.pressPrimary();
    const feedback = s.feedback;
    s.backToPath();
    const resumed = new CourseSession({ html, storage });
    resumed.openLesson('G2-O', 1);
    expect(resumed.state.screen).toBe(1);
    expect(resumed.feedback).toBe(feedback);
    expect(resumed.practiceState()).toMatchObject({ tries: 1, hintLv: 1 });
    resumed.editRegion('sample', 'I think', 'typed');
    resumed.editRegion('sample', 'I think garden', 'paste');
    resumed.flush();
    expect(JSON.parse(storage.getItem(ALEX_STATE_KEY)!).regions.sample).toEqual([
      { t: 'I think', s: 'typed' },
      { t: ' garden', s: 'paste' },
    ]);
  });
  it('practice credit follows the original source classifier for typing, grid, paste and reveal', () => {
    const s = create(),
      t = s.task('ts8');
    for (const [source, expected] of [
      ['typed', 1],
      ['voice', 1],
      ['grid', 0.5],
      ['paste', 0],
    ] as const) {
      const how = s.engine.practiceHow(t, 'done', [{ t: 'In my opinion', s: source }]);
      expect(s.engine.practiceCredit(s.config, how)).toBe(expected);
    }
    expect(s.engine.practiceCredit(s.config, s.engine.practiceHow(t, 'shown', []))).toBe(0);
  });
});
