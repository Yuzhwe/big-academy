/**
 * Student course session.
 *
 * Navigation, completion, skip, and unlock call the same decisions as Alex
 * `Pages`, `Skip`, `Home`, and `Stairs` in `alex-original.html`.
 * This module does not keep a second progress store.
 *
 * UI-only milestone celebration receipts live in a different storage key and
 * never grant or revoke a lesson.
 */

import {
  bilingual,
  loadAlexSource,
  type AlexConfig,
  type AlexPage,
  type AlexScreen,
  type AlexTask,
  type AnalyzerApi,
  type ApplyCheck,
  type Bilingual,
  type EngineApi,
  type GridCell,
  type LevelPath,
  type PathLevel,
  type PathUnit,
  type ScreenRef,
  type StepTag,
} from './loadAlexSource';
import type { ChoiceVisualState } from '@big-academy/design-system';

export const ALEX_STATE_KEY = 'g2o_unit_state_v4';
export const CELEBRATION_KEY = 'ba_writing_milestone_receipts_v1';

export type LessonAction = 'start' | 'continue' | 'review' | 'locked';
export type LessonCourseState = 'locked' | 'current' | 'available' | 'done' | 'skipped' | 'view';
export type TaskChipStatus = 'done' | 'current' | 'available' | 'locked' | 'skipped';
export type CourseView = 'path' | 'lesson' | 'preview' | 'lessonEnd';

export interface TaskProgress {
  tries: number;
  status: 'open' | 'done' | 'shown';
  picked?: number[];
  wrong?: number[];
  hintLv?: number;
  sel?: number | null;
  bad?: number | null;
  miss?: number;
  /** Ordered-build wrong taps, one count per word tile. */
  wrongTaps?: Record<string, number>;
  built?: string[];
  blanks?: string[];
  focusBlank?: number;
}

export interface ApplyRecord {
  tries: number;
  passed: boolean;
  movedOn?: boolean;
  safety?: boolean;
  result?: {
    passed: boolean;
    checks: ApplyCheck[];
    feedback: string;
    zh?: string;
    glow?: string;
    safety_flag?: boolean;
  } | null;
}

export interface CheckHistoryEntry {
  attempt: number;
  passed: boolean;
  score: number;
  total: number;
  results: { id: string; correct: boolean; writing: boolean; explanation?: string; zh?: string }[];
}

export interface CheckRecord {
  passed?: boolean;
  finished?: boolean;
  attempt: number;
  q: number;
  blankAsk?: boolean;
  view?: number | null;
  history: CheckHistoryEntry[];
}

export interface AlexState {
  v: 4;
  feedbackByScreen?: Record<string, { text: string; tone: 'correct' | 'wrong'; locale: 'en' | 'zh' }>;
  screen: number;
  page: number;
  seen: Record<string, boolean>;
  overlay: string;
  done: Record<string, boolean>;
  unlockAll: boolean;
  zh: boolean;
  teacher: boolean;
  size: number;
  spell: boolean;
  kb: boolean;
  strip: boolean;
  listen: boolean;
  regions: Record<string, { t: string; s: string }[]>;
  tasks: Record<string, TaskProgress>;
  checks: Record<string, CheckRecord>;
  plan: { topic: string; checks: number; result: unknown };
  applies: Record<string, ApplyRecord>;
  feedback: { drafts: { text?: string }[]; cups: Record<string, unknown>; finished?: boolean };
  reflection: unknown;
  events: { t: number; type: string; page?: string; screen?: number; data?: Record<string, unknown> }[];
  grid: { collapsed: boolean; tab: Record<string, string>; open: Record<string, boolean> };
  created: string;
  skills?: Record<string, string>;
  allowSkip?: boolean;
  skipChoice?: Record<string, 'skip' | 'review'>;
  stoppedAt?: number | null;
  /** Set by Stop for today. Cleared when that next lesson starts. */
  welcomePending?: boolean;
}

interface CelebrationReceipt {
  initialized: boolean;
  seenDone: Record<string, boolean>;
  celebrated: Record<string, boolean>;
  practice: Record<string, boolean>;
}

export interface PathLessonCard {
  unitId: string;
  lessonId: string;
  number: number;
  title: string;
  minutes: number;
  courseState: LessonCourseState;
  action: LessonAction;
  detail: string;
  playable: boolean;
}

export interface PathMilestone {
  unitId: string;
  title: string;
  completed: boolean;
}

export interface PathNode {
  kind: 'intro' | 'unit' | 'lesson' | 'milestone' | 'goal';
  id: string;
  lesson?: PathLessonCard;
  milestone?: PathMilestone;
  unit?: {
    id: string;
    index: number;
    typeLabel: string;
    title: string;
    meta: string;
    goals: string[];
  };
  goal?: { title: string; detail: string };
  intro?: string;
}

export interface SkipOffer {
  stepId: string;
  mode: 'offer' | 'note';
  text: string;
}

export interface ActivityModel {
  supported: boolean;
  template: string;
  kind: string;
  title: string;
  ask: string;
  learn?: {
    heading: string;
    teach: string;
    weak?: string;
    strong?: string;
    nextUp: string;
    weakLabel: string;
    strongLabel: string;
  };
  pick?: {
    multi: boolean;
    options: {
      index: number;
      letter: string;
      text: string;
      selected: boolean;
      wrong: boolean;
      state: ChoiceVisualState;
    }[];
    hint: string;
    locked?: boolean;
  };
  tapword?: {
    words: { index: number; text: string; selected: boolean; wrong: boolean; correct?: boolean; revealed?: boolean }[];
    locked?: boolean;
  };
  build?: {
    bench: string;
    revealed?: string;
    ordered?: boolean;
    remaining?: number;
    cards: { text: string; used: boolean; hint: boolean; shake: boolean }[];
  };
  frame?: {
    parts: string[];
    blanks: { label: string; value: string; minWords: number }[];
    focus: number;
  };
  canvas?: { text: string; tip: string; label: string };
  wordGrid?: {
    groups: { id: string; label: string; words: { id: string; text: string; used?: boolean; hint?: boolean; shake?: boolean }[] }[];
    active: string;
  };
  applyMoveOn?: boolean;
  check?: {
    phase: 'answer' | 'results' | 'graded';
    number: number;
    total: number;
    dots: { answered: boolean; current: boolean }[];
    passed?: boolean;
    scoreLine?: string;
    rows?: { index: number; ask: string; correct: boolean }[];
    tryNew?: boolean;
  };
  layers?: { id: string; label: string; value: string; emphasis: boolean }[];
  unsupportedReason?: string;
  skip: SkipOffer | null;
  hints: string[];
  hintAction: 'hint' | 'another' | null;
  coach: string[];
  coachMore: boolean;
  feedback: string;
  feedbackTone: 'correct' | 'wrong';
}

export interface FooterModel {
  backLabel: string;
  backDisabled?: boolean;
  primaryLabel: string;
  primaryTestId: string;
  primaryDisabled?: boolean;
}

export interface TopBarModel {
  lessonNumber: string;
  lessonTitle: string;
  tags: string[];
  tasks: { id: string; label: string; status: TaskChipStatus; number: number }[];
  current: number;
}

export interface CelebrationEvent {
  unitId: string;
  title: string;
  replay: boolean;
}

const SEEN_KINDS = [
  'learn',
  'model_read',
  'plan_topic',
  'plan_layer',
  'draft_ready',
  'rev_comments',
  'rep_paragraph',
  'rep_grew',
  'rep_reflect',
];

const YES = ['Yes.', 'Right.', 'That’s it.', 'Yes.', 'Good.'];

function freshState(): AlexState {
  return {
    v: 4,
    screen: 0,
    page: 0,
    seen: {},
    overlay: 'none',
    done: {},
    unlockAll: false,
    zh: false,
    teacher: false,
    size: 1,
    spell: false,
    kb: true,
    strip: true,
    listen: false,
    regions: {},
    tasks: {},
    checks: {},
    plan: { topic: 'garden', checks: 0, result: null },
    applies: {},
    feedback: { drafts: [], cups: {} },
    reflection: null,
    events: [],
    grid: { collapsed: false, tab: {}, open: {} },
    created: new Date().toISOString(),
  };
}

function freshReceipt(): CelebrationReceipt {
  return { initialized: false, seenDone: {}, celebrated: {}, practice: {} };
}

function regionText(segs: { t: string }[] | undefined): string {
  return (segs ?? []).map((segment) => segment.t).join('');
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const copy = items.slice();
  let state = 0;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) >>> 0;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (state * 1103515245 + 12345) >>> 0;
    const swap = state % (index + 1);
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

export interface CourseSessionOptions {
  html: string;
  storage?: Storage;
  search?: string;
}

export class CourseSession {
  readonly config: AlexConfig;
  readonly levelPath: LevelPath;
  readonly engine: EngineApi;
  readonly analyzer: AnalyzerApi;
  readonly screens: ScreenRef[];

  private readonly storage: Storage;
  private readonly sourceHtml: string;
  private readonly listeners = new Set<() => void>();
  private revision = 0;
  private yesCount = 0;
  private coachBeat: Record<string, number> = {};
  private receipt: CelebrationReceipt;

  state: AlexState;
  view: CourseView = 'path';
  levelId: string;
  message = '';
  feedback = '';
  feedbackTone: 'correct' | 'wrong' = 'wrong';
  celebration: CelebrationEvent | null = null;
  /** Presentation only. Never written into the course record. */
  practiceBurst: { id: string; lesson: boolean } | null = null;
  openNotice = '';
  returnFocus: { unitId: string; number: number } | null = null;
  /** UI receipt only. Not part of Alex course state. */
  private returnTo: { unitId: string; number: number } | null = null;
  private shakeCard: string | null = null;
  /** Designer query only. Never copied into the learner record. */
  caret = { start: Number.MAX_SAFE_INTEGER, end: Number.MAX_SAFE_INTEGER };
  private pasted = false;
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(options: CourseSessionOptions) {
    this.sourceHtml = options.html;
    const source = loadAlexSource(options.html);
    this.config = source.config;
    this.levelPath = source.levelPath;
    this.engine = source.engine;
    this.analyzer = source.analyzer;
    this.screens = this.engine.screens(this.config);
    this.storage = options.storage ?? localStorage;
    this.levelId = this.levelPath.current_level;
    const loaded = this.readState();
    this.state = loaded.state;
    this.state.unlockAll = false;
    this.receipt = this.readReceipt();
    if (!loaded.fromStorage && new URLSearchParams(options.search ?? '').get('locale') === 'zh') {
      this.state.zh = true;
    }
    this.applySkillQuery(options.search ?? '');
    if (!this.canOpen(this.state.screen)) this.state.screen = this.firstOpen();
    this.state.page = this.pageIndex(this.screens[this.state.screen]?.screen.page ?? '');
    this.save();
    this.applyEntryQuery(options.search ?? '');
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.revision;

  /** Review-only simulation: a fresh lesson in a wholly separate memory store.
   * The real session remains alive, including its exact view and resume point.
   * No storage key, receipt, timer or progress object is shared with the copy.
   */
  createLessonTestSession(): CourseSession {
    this.flush();
    const index = this.curLesson();
    const indexes = this.liveIdx(index);
    const refs = indexes.map(i => this.screens[i]);
    const copy = structuredClone(this.state);
    const pages = new Set(refs.map(ref => ref.screen.page));
    const ids = new Set(refs.map(ref => ref.screen.id));
    const lessonId = this.config.lessons[index].id ?? refs[0].screen.page.split('.')[0];
    const roots = new Set([lessonId,...refs.map(ref=>ref.screen.page.split('.')[0]),...refs.map(ref=>ref.step.skill).filter((id):id is string=>!!id)]);
    refs.forEach(ref=>ids.add(ref.step.id));
    const inLesson = (key: string) => ids.has(key) || pages.has(key) || [...roots].some(root=>key===root||key.startsWith(root+'.')||key.startsWith(root+':'));
    for (const records of [copy.seen,copy.done,copy.tasks,copy.regions,copy.checks,copy.applies,copy.feedbackByScreen,copy.grid.tab,copy.grid.open,copy.skills,copy.skipChoice]) {
      if (records) for (const key of Object.keys(records)) if (inLesson(key)) delete records[key as keyof typeof records];
    }
    copy.screen = indexes[0]; copy.page = this.pageIndex(refs[0].screen.page);
    copy.unlockAll = false; copy.stoppedAt = null; copy.welcomePending = false;
    copy.overlay = 'none';
    copy.events = copy.events.filter(event => !(event.page && inLesson(event.page)) && !indexes.includes(event.screen ?? -1));
    const memory = createMemoryStorage({[ALEX_STATE_KEY]:JSON.stringify(copy)});
    const test = new CourseSession({html:this.sourceHtml,storage:memory});
    test.openLesson(this.playUnit().id, index + 1);
    return test;
  }

  /** Decorative flag state uses real unit completion, never the L0/L1 fixtures. */
  levelRewardDone(levelId = this.levelId): boolean {
    const level = this.level(levelId);
    return level.units.length > 0 && level.units.every(unit => this.unitMilestoneDone(unit, !!level.current));
  }

  get locale(): 'en' | 'zh' {
    return this.state.zh ? 'zh' : 'en';
  }

  get zh(): boolean {
    return this.state.zh;
  }

  text(value: Bilingual | string | null | undefined): string {
    return bilingual(value, this.zh);
  }

  toggleLocale(): void {
    this.state.zh = !this.state.zh;
    this.save();
    this.emit();
  }

  dismissMessage(): void {
    this.message = '';
    this.emit();
  }

  dismissCelebration(): void {
    this.celebration = null;
    this.emit();
  }

  level(id = this.levelId): PathLevel {
    const found = this.levelPath.levels.find((item) => item.id === id);
    if (!found) throw new Error(`Unknown level ${id}`);
    return found;
  }

  unit(id: string): PathUnit | null {
    for (const level of this.levelPath.levels) {
      const found = level.units.find((item) => item.id === id);
      if (found) return found;
    }
    return null;
  }

  playUnit(): PathUnit {
    const unit = this.unit(this.levelPath.current_unit);
    if (!unit) throw new Error('Playable unit is missing from LEVEL_PATH');
    return unit;
  }

  task(id: string): AlexTask {
    const found = this.engine.taskById(this.config, id);
    if (!found) throw new Error(`Missing task ${id}`);
    return found;
  }

  pageOf(id: string) {
    return this.config.pages.find((page) => page.id === id) ?? null;
  }

  /** Live Alex state object. Tests may arrange fields that `Pages.done` reads. */
  inspect(): AlexState {
    return this.state;
  }

  screenDone(index: number): boolean {
    const ref = this.screens[index];
    if (!ref) return false;
    const screen = ref.screen;
    if (this.stepSkipped(ref.step)) return true;
    const drafts = this.state.feedback.drafts;
    switch (screen.kind) {
      case 'task':
      case 'model_task': {
        const taskState = this.state.tasks[`${screen.page}:${screen.task}`];
        return !!taskState && taskState.status !== 'open';
      }
      case 'apply':
      case 'check':
        return !!this.state.done[screen.page];
      case 'plan_check':
        return !!this.state.done.plan;
      case 'draft_write':
        return drafts.length > 0;
      case 'rev_cups':
        return drafts.length >= 2 || !!this.state.feedback.finished;
      case 'rev_final':
        return !!this.state.feedback.finished;
      case 'plan_layer':
        return !!this.state.seen[screen.id] && this.planFields(screen.fields);
      default:
        return !!this.state.seen[screen.id];
    }
  }

  ready(index: number): boolean {
    const kind = this.screens[index]?.screen.kind;
    if (kind === 'plan_layer') return this.planFields(this.screens[index].screen.fields);
    if (kind === 'rep_reflect') return true;
    return SEEN_KINDS.includes(kind ?? '');
  }

  canNext(index: number): boolean {
    return this.screenDone(index) || this.ready(index);
  }

  firstOpen(): number {
    for (let index = 0; index < this.screens.length; index += 1) {
      if (!this.screenDone(index)) return index;
    }
    return this.screens.length - 1;
  }

  canOpen(index: number): boolean {
    if (index < 0 || index >= this.screens.length) return false;
    return this.state.unlockAll || index <= this.firstOpen() || this.screenDone(index);
  }

  liveIdx(lessonIndex: number): number[] {
    return this.screens.map((_, index) => index).filter((index) => this.screens[index].li === lessonIndex);
  }

  curLesson(): number {
    return this.screens[this.state.screen]?.li ?? 0;
  }

  liveState(lessonIndex: number): LessonCourseState {
    const indexes = this.liveIdx(lessonIndex);
    if (!indexes.length) return 'locked';
    if (indexes.every((index) => this.stepSkipped(this.screens[index].step))) return 'skipped';
    if (indexes.every((index) => this.screenDone(index))) return 'done';
    if (lessonIndex === this.curLesson()) return 'current';
    const firstReal = indexes.find((index) => !this.stepSkipped(this.screens[index].step)) ?? indexes[0];
    return this.canOpen(firstReal) ? 'available' : 'locked';
  }

  liveDone(): boolean {
    return this.config.lessons.every((_, index) => {
      const state = this.liveState(index);
      return state === 'done' || state === 'skipped';
    });
  }

  mastered(skill: string): boolean {
    return !!this.state.checks[`${skill}.check`]?.passed || this.skillStatus(skill) === 'writing';
  }

  unitDone(id: string): boolean {
    const unit = this.unit(id);
    if (!unit) return false;
    if (unit.playable) return this.liveDone();
    if (unit.type === 'skill') return this.mastered(id);
    return false;
  }

  prereqOk(unit: PathUnit): boolean {
    if (unit.type === 'genre') {
      const level = this.level(unit.level);
      const genres = level.units.filter((item) => item.type === 'genre');
      const index = genres.findIndex((item) => item.id === unit.id);
      if (index > 0 && !this.unitDone(genres[index - 1].id)) return false;
    }
    return unit.prereq.every(
      (prereq) =>
        (unit.embeds ?? []).includes(prereq) ||
        !this.unitIn(prereq, unit.level ?? '') ||
        this.unitDone(prereq) ||
        this.mastered(prereq),
    );
  }

  lessonStates(unit: PathUnit): LessonCourseState[] {
    if (unit.playable) return unit.lessons.map((_, index) => this.liveState(index));
    if (!this.level(unit.level).current) return unit.lessons.map(() => 'view' as const);
    const open = this.prereqOk(unit);
    let first = true;
    return unit.lessons.map((lesson) => {
      if (lesson.kind === 'skill' && lesson.skills?.length && lesson.skills.every((skill) => this.mastered(skill))) {
        return 'skipped';
      }
      if (open && first) {
        first = false;
        return 'available';
      }
      return 'locked';
    });
  }

  unitMilestoneDone(unit: PathUnit, live: boolean): boolean {
    if (!live) return false;
    return this.lessonStates(unit).every((state) => state === 'done' || state === 'skipped');
  }

  cardAction(unit: PathUnit, lessonIndex: number, courseState: LessonCourseState): LessonAction {
    if (courseState === 'locked' || courseState === 'view') return 'locked';
    if (courseState === 'done' || courseState === 'skipped') return 'review';
    if (unit.playable && this.hasResumableWork(lessonIndex)) return 'continue';
    return 'start';
  }

  pathNodes(levelId = this.levelId): PathNode[] {
    const level = this.level(levelId);
    const live = !!level.current;
    const nodes: PathNode[] = [
      {
        kind: 'intro',
        id: `${level.id}:intro`,
        intro: this.introText(level),
      },
    ];
    const seeded = this.showsPreviewSeed(level.id);
    level.units.forEach((unit, unitIndex) => {
      const states = seeded
        ? unit.lessons.map(() => 'done' as const)
        : live
          ? this.lessonStates(unit)
          : unit.lessons.map(() => 'view' as const);
      nodes.push({
        kind: 'unit',
        id: unit.id,
        unit: {
          id: unit.id,
          index: unitIndex + 1,
          typeLabel: this.unitTypeLabel(unit),
          title: this.shortTitle(unit.title),
          meta: this.zh
            ? `${unit.lessons.length} 课${unit.min == null ? '' : ` · ${unit.min} 分钟`}`
            : `${unit.lessons.length} lessons${unit.min == null ? '' : ` · ${unit.min} mins`}`,
          goals: unit.playable ? (this.config.unit_goals ?? []).map((goal) => this.text(goal)) : [],
        },
      });
      unit.lessons.forEach((lesson, lessonIndex) => {
        const courseState = states[lessonIndex] ?? 'locked';
        nodes.push({
          kind: 'lesson',
          id: `${unit.id}:${lesson.n}`,
          lesson: {
            unitId: unit.id,
            lessonId: `${unit.id}:${lesson.n}`,
            number: lesson.n,
            title: this.text(lesson.title),
            minutes: lesson.min ?? 0,
            courseState,
            action: this.cardAction(unit, lessonIndex, courseState),
            detail: this.lessonDetail(level, unit, lessonIndex, courseState),
            playable: !!unit.playable,
          },
        });
      });
      nodes.push({
        kind: 'milestone',
        id: `${unit.id}:milestone`,
        milestone: {
          unitId: unit.id,
          title: this.shortTitle(unit.title),
          completed: seeded || this.unitMilestoneDone(unit, live),
        },
      });
    });
    const nextLevel = this.levelPath.levels[this.levelPath.levels.indexOf(level) + 1];
    nodes.push({
      kind: 'goal',
      id: `${level.id}:goal`,
      goal: {
        title: this.zh ? '升级目标' : 'Level goal',
        detail: nextLevel
          ? this.zh
            ? `第 ${nextLevel.id.slice(1)} 级`
            : `Level ${nextLevel.id.slice(1)}`
          : this.zh
            ? '最高级'
            : 'Top level',
      },
    });
    return nodes;
  }

  switchLevel(levelId: string): void {
    if (!this.levelPath.levels.some((level) => level.id === levelId)) return;
    this.levelId = levelId;
    this.view = 'path';
    this.message = '';
    this.save();
    this.emit();
  }

  openLesson(unitId: string, lessonNumber: number): boolean {
    const unit = this.unit(unitId);
    if (!unit) return false;
    if (unit.playable) {
      const lessonIndex = lessonNumber - 1;
      const indexes = this.liveIdx(lessonIndex);
      const courseState = this.liveState(lessonIndex);
      if (courseState === 'locked' && !this.showsPreviewSeed(unit.level ?? '')) {
        this.message = this.lockWhy(unit, lessonNumber);
        this.returnFocus = { unitId, number: lessonNumber };
        this.view = 'path';
        this.emit();
        return false;
      }
      let target =
        courseState === 'done' ? indexes[0] : lessonIndex === this.curLesson()
          ? this.state.screen
          : (indexes.find((index) => !this.screenDone(index) && !this.stepSkipped(this.screens[index].step)) ??
            indexes[0]);
      if (!this.canOpen(target)) target = indexes[0];
      this.remember(unitId, lessonNumber);
      this.view = 'lesson';
      this.say('');
      this.message = '';
      const welcome = !!this.state.welcomePending && lessonIndex === this.screens[target]?.li;
      this.go(target);
      if (welcome) {
        this.state.welcomePending = false;
        this.state.stoppedAt = null;
        this.say(this.zh ? '欢迎回来。' : 'Welcome back.');
        this.save();
        this.emit();
      }
      return true;
    }
    const courseState = this.lessonStates(unit)[lessonNumber - 1];
    if (!this.showsPreviewSeed(unit.level ?? '') && (courseState === 'locked' || courseState === 'view')) {
      this.message =
        courseState === 'view'
          ? this.zh
            ? `这一级之后才开始。你现在在 ${this.levelPath.current_level}，先把这一级走完。`
            : `This level comes later. You are in ${this.levelPath.current_level} now, so finish the steps there first.`
          : this.zh
            ? '这一课要先学完前面的课才会打开。'
            : 'This one opens after the lessons before it.';
      this.returnFocus = { unitId, number: lessonNumber };
      this.view = 'path';
      this.emit();
      return false;
    }
    this.remember(unitId, lessonNumber);
    this.view = 'preview';
    this.message = '';
    this.emit();
    return true;
  }

  previewModel(): { title: string; body: string } | null {
    if (!this.returnTo) return null;
    const unit = this.unit(this.returnTo.unitId);
    const lesson = unit?.lessons[this.returnTo.number - 1];
    if (!unit || !lesson) return null;
    return {
      title: `${this.lessonWord(lesson.n)} · ${this.text(lesson.title)}`,
      body: this.zh
        ? '这一课还不能在这里做。G2-O 是现在可以学习的单元。其他课按原课程先修条件打开，这里不另写内容。'
        : 'This lesson is not playable here. G2-O is the live unit. Other lessons stay behind the original prerequisites, and this slice does not invent their activities.',
    };
  }

  backToPath(): void {
    if (this.returnTo) this.returnFocus = { ...this.returnTo };
    this.view = 'path';
    this.say('');
    this.message = '';
    this.save();
    this.emit();
  }

  /** True after Stop for today, until that next lesson is opened. */
  get stoppedForToday(): boolean {
    return !!this.state.stoppedAt;
  }

  /**
   * Lesson-break exits. Both park the resume screen on the next lesson.
   * Stop for today also stores a timestamp and a one-time welcome.
   */
  leaveLesson(kind: 'path' | 'stop'): void {
    if (this.view !== 'lessonEnd') return;
    const next = this.nextTarget(this.state.screen);
    this.state.screen = next;
    this.state.page = this.pageIndex(this.screens[next]?.screen.page ?? '');
    this.state.stoppedAt = kind === 'stop' ? Date.now() : null;
    this.state.welcomePending = kind === 'stop';
    this.view = 'path';
    this.say('');
    this.log(kind === 'stop' ? 'stop_today' : 'lesson_path');
    this.save();
    this.emit();
  }

  /**
   * First visit records milestones that are already done and does not celebrate.
   * One newly achieved unit auto-celebrates once.
   * Several new units, or a unit reached again after it was lost, stay open.
   */
  observePath(): void {
    if (this.view !== 'path') return;
    const level = this.level(this.levelId);
    if (!level.current) return;
    const achieved = new Map(level.units.map((unit) => [unit.id, this.unitMilestoneDone(unit, true)] as const));
    if (!this.receipt.initialized) {
      this.receipt.initialized = true;
      for (const [unitId, done] of achieved) this.receipt.seenDone[unitId] = done;
      this.writeReceipt();
      return;
    }
    const transitions: string[] = [];
    let dirty = false;
    for (const [unitId, done] of achieved) {
      if (done && !this.receipt.seenDone[unitId]) transitions.push(unitId);
      if (this.receipt.seenDone[unitId] !== done) {
        this.receipt.seenDone[unitId] = done;
        dirty = true;
      }
    }
    if (!transitions.length) {
      if (dirty) this.writeReceipt();
      return;
    }
    if (transitions.length === 1 && !this.receipt.celebrated[transitions[0]]) {
      const unitId = transitions[0];
      this.receipt.celebrated[unitId] = true;
      this.openNotice = '';
      this.celebration = {
        unitId,
        title: this.shortTitle(this.unit(unitId)?.title ?? { en: unitId }),
        replay: false,
      };
    } else if (transitions.length === 1) {
      this.openNotice = this.zh
        ? '这个里程碑在变化之后又达成了。撤销后再达成时是否自动庆祝仍未决定，这次不自动播放。'
        : 'This milestone was reached again after it changed. Whether a later return should celebrate automatically is still open, so nothing plays automatically.';
    } else {
      this.openNotice = this.zh
        ? '有多个里程碑同时新达成。怎么庆祝仍未决定（Q-M05），这次不自动播放。'
        : 'More than one milestone was newly reached. How to celebrate them together is still open (Q-M05), so nothing plays automatically.';
    }
    this.writeReceipt();
    this.emit();
  }

  replayMilestone(unitId: string): void {
    const unit = this.unit(unitId);
    const level = this.level(this.levelId);
    if (!unit || unit.level !== this.levelId) return;
    const seeded = this.showsPreviewSeed(level.id);
    if (!seeded && (!level.current || !this.unitMilestoneDone(unit, true))) return;
    this.celebration = { unitId, title: this.shortTitle(unit.title), replay: true };
    this.emit();
  }

  private showsPreviewSeed(levelId: string): boolean {
    // High-fidelity path preview: L0/L1 are visually complete by default.
    // This does not mutate saved learner grades, mastered skills or L2 gates.
    return levelId === 'L0' || levelId === 'L1';
  }

  topBar(): TopBarModel | null {
    if (this.view !== 'lesson' && this.view !== 'lessonEnd') return null;
    const lessonIndex = this.screens[this.state.screen]?.li ?? 0;
    const indexes = this.liveIdx(lessonIndex);
    const unit = this.playUnit();
    const lesson = unit.lessons[lessonIndex];
    const localCurrent = Math.max(0, indexes.indexOf(this.state.screen));
    return {
      lessonNumber: this.lessonWord(lesson?.n ?? lessonIndex + 1),
      lessonTitle: this.text(lesson?.title ?? this.screens[this.state.screen]?.lesson.title),
      tags: [unit.id],
      current: localCurrent,
      tasks: indexes.map((globalIndex, localIndex) => {
        const ref = this.screens[globalIndex];
        const skipped = this.stepSkipped(ref.step);
        const done = this.screenDone(globalIndex);
        const open = this.canOpen(globalIndex);
        let status: TaskChipStatus;
        if (skipped) status = 'skipped';
        else if (done) status = 'done';
        else if (globalIndex === this.state.screen) status = 'current';
        else if (!open) status = 'locked';
        else status = 'available';
        return {
          id: ref.screen.id,
          label: this.text(ref.screen.title) || ref.screen.id,
          status,
          number: localIndex + 1,
        };
      }),
    };
  }

  canOpenLocal = (localIndex: number): boolean => {
    const globalIndex = this.localToGlobal(localIndex);
    if (globalIndex < 0) return false;
    return this.canOpen(globalIndex);
  };

  navigateLocal(localIndex: number): void {
    const globalIndex = this.localToGlobal(localIndex);
    if (globalIndex < 0) return;
    const backward = globalIndex < this.state.screen;
    if (!backward && !this.canOpen(globalIndex)) {
      this.say(this.lockedMsg(this.firstOpen()));
      this.emit();
      return;
    }
    this.view = 'lesson';
    this.go(globalIndex, backward);
  }

  activity(): ActivityModel | null {
    if (this.view === 'lessonEnd') return this.lessonEndActivity();
    if (this.view !== 'lesson') return null;
    const ref = this.screens[this.state.screen];
    const screen = ref.screen;
    const page = this.pageOf(screen.page);
    const skip = this.skipOffer(ref.step, screen);
    const coach = this.coachLines(screen);
    const base = {
      template: screen.template,
      kind: screen.kind,
      title: this.text(screen.title),
      ask: '',
      skip,
      hints: [] as string[],
      hintAction: null as ActivityModel['hintAction'],
      coach,
      coachMore: this.coachHasMore(screen),
      feedback: this.feedback || (this.state.feedbackByScreen?.[screen.id]?.locale === this.locale ? this.state.feedbackByScreen[screen.id].text : ''),
      feedbackTone: this.feedback ? this.feedbackTone : this.state.feedbackByScreen?.[screen.id]?.tone ?? 'wrong',
    };

    if (screen.kind === 'learn' && screen.template === 'P2') {
      const skill = page?.skill ? this.engine.skillById(this.config, page.skill) : null;
      return {
        ...base,
        supported: true,
        learn: {
          heading: this.text(ref.step.title),
          teach: this.text(page?.teach),
          weak: skill?.example?.weak,
          strong: skill?.example?.strong,
          weakLabel: this.zh ? '还不是' : 'Not yet',
          strongLabel: this.zh ? '更好' : 'Better',
          nextUp: '',
        },
        layers: this.hamburgerLayers(page?.skill, this.text(page?.teach)),
      };
    }

    if ((screen.kind === 'task' || screen.kind === 'model_task') && screen.task) {
      const task = this.task(screen.task);
      const key = this.taskKey(screen);
      const taskState = this.taskState(key);
      const hints = (task.coach?.hints ?? []).slice(0, taskState.hintLv ?? 0).map((hint) => this.text(hint));
      const hintAction = this.hintAction(task, taskState);
      if (task.type === 'pick' && task.lines && task.answers) {
        const picked = taskState.picked ?? [];
        const wrong = taskState.wrong ?? [];
        const closed = taskState.status !== 'open';
        return {
          ...base,
          supported: true,
          ask: this.text(task.ask),
          hints,
          hintAction,
          pick: {
            multi: !!task.multi,
            hint: task.multi
              ? this.zh
                ? `选择 ${task.answers.length} 项 · 已选 ${picked.length}`
                : `Choose ${task.answers.length} · ${picked.length} chosen`
              : '',
            options: task.lines.map((line, index) => ({
              index,
              letter: this.engine.choiceLetter(index),
              text: line,
              selected: picked.includes(index),
              wrong: wrong.includes(index) && !closed,
              state: this.choiceVisual(task, taskState, index),
            })),
          },
        };
      }
      if (task.type === 'tapword' && task.text && task.need !== 'all') {
        const tokens = this.engine.tokens(task.text);
        return {
          ...base,
          supported: true,
          ask: this.text(task.ask),
          hints,
          hintAction,
          tapword: {
            locked: taskState.status !== 'open',
            words: tokens.map((token, index) => ({
              index,
              text: token.w,
              selected: taskState.sel === index && taskState.status !== 'shown',
              correct: taskState.status === 'done' && taskState.sel === index,
              wrong: taskState.status !== 'done' && taskState.bad === index,
              revealed: taskState.status === 'shown' && (task.targets ?? []).some((target) => this.engine.locate(task.text ?? '', target) === index),
            })),
          },
        };
      }
      if (task.type === 'build') {
        return { ...base, supported: true, ask: this.text(task.ask), hints, hintAction, ...this.buildModel(task, taskState) };
      }
      if (task.type === 'write' || task.frameFill) {
        return { ...base, supported: true, ask: this.text(task.ask), hints, hintAction, ...this.frameModel(task, key, taskState) };
      }
    }

    if (screen.kind === 'apply') return { ...base, supported: true, ...this.applyModel(screen) };
    if (screen.kind === 'check') return { ...base, supported: true, ...this.checkModel(screen) };

    return {
      ...base,
      supported: false,
      ask: screen.task ? this.text(this.task(screen.task).ask) : this.text(screen.title),
      unsupportedReason: this.zh
        ? `这一屏是 ${screen.template} / ${screen.kind}。垂直切片还没有接上这个模板，所以这里不能把它标成完成。`
        : `This screen is ${screen.template} / ${screen.kind}. The vertical slice does not run this template yet, so it cannot be marked done here.`,
    };
  }

  /** Presentation-only readiness follows authored task checks; this never grades or changes records. */
  primaryReady(index = this.state.screen): boolean {
    if (this.view === 'lessonEnd' || this.view === 'preview') return true;
    const screen = this.screens[index]?.screen;
    if (!screen) return false;
    if (screen.kind === 'check') {
      // P7 explicitly allows blank internal questions and has an authored one-time
      // blank warning on Hand in. Never turn that workflow into a mandatory answer gate.
      return true;
    }
    if (this.canNext(index)) return true;
    if (screen.kind === 'apply') {
      const text = this.engine.stripPictures(regionText(this.state.regions[screen.page])).trim();
      return this.analyzer.wordCount(text) >= 3;
    }
    if (screen.kind !== 'task' && screen.kind !== 'model_task') return false;
    if (!screen.task) return false;
    const task = this.task(screen.task);
    const key = this.taskKey(screen);
    const answer = this.state.tasks[key];
    if (task.type === 'pick') return (answer?.picked?.length ?? 0) >= 1; // readiness is not correctness
    if (task.type === 'tapword' && task.need !== 'all') return answer?.sel != null;
    if (task.type === 'build') return false; // automatically checked as word cards complete the sentence
    if (task.frameFill) {
      const blanks = answer?.blanks ?? [];
      const count = task.frameFill.frame.split('___').length - 1;
      return count > 0 && blanks.slice(0, count).length === count && blanks.slice(0, count).every(v => !!v.trim());
    }
    if (task.type === 'write') return !!regionText(this.state.regions[key]).trim();
    return false;
  }

  footer(): FooterModel {
    if (this.view === 'lessonEnd') {
      return {
        backLabel: this.zh ? '返回' : 'Back',
        primaryLabel: this.zh ? '继续' : 'Keep going',
        primaryTestId: 'keep-going',
      };
    }
    if (this.view === 'preview') {
      return {
        backLabel: this.zh ? '我的路径' : 'My path',
        primaryLabel: this.zh ? '我的路径' : 'My path',
        primaryTestId: 'back-to-path',
      };
    }
    const index = this.state.screen;
    const screen = this.screens[index]?.screen;
    const backLabel = this.zh ? '上一页' : 'Previous';
    const backDisabled = index === 0;
    if (screen?.kind === 'check') return { ...this.checkFooter(screen, backLabel, backDisabled), primaryDisabled: !this.primaryReady(index) };
    if (screen?.kind === 'apply' && !this.canNext(index)) {
      const record = this.applyRecord(screen);
      return {
        backLabel,
        backDisabled,
        primaryLabel: record.tries ? (this.zh ? '再检查一次' : 'Check again') : this.zh ? '检查我的写作' : 'Check my writing',
        primaryTestId: 'check-writing',
        primaryDisabled: !this.primaryReady(index),
      };
    }
    if (!this.canNext(index)) {
      return {
        backLabel,
        backDisabled,
        primaryLabel: this.blockedLabel(index),
        primaryTestId: 'check',
        primaryDisabled: !this.primaryReady(index),
      };
    }
    return {
      backLabel,
      backDisabled,
      primaryLabel: this.nextLabel(index),
      primaryTestId: 'next',
      primaryDisabled: !this.primaryReady(index),
    };
  }

  pressBack(): void {
    if (this.view === 'preview' || this.view === 'path') {
      this.backToPath();
      return;
    }
    if (this.view === 'lessonEnd') {
      this.view = 'lesson';
      this.emit();
      return;
    }
    const screen = this.screens[this.state.screen]?.screen;
    if (screen?.kind === 'check') {
      const record = this.checkRecord(screen);
      if (record.finished && record.view != null) {
        record.view = null;
        this.save();
        this.emit();
        return;
      }
      if (!record.finished && record.q > 0) {
        record.q -= 1;
        record.blankAsk = false;
        this.save();
        this.emit();
        return;
      }
    }
    if (this.state.screen === 0) {
      this.emit();
      return;
    }
    this.go(this.state.screen - 1, true);
  }

  pressPrimary(): void {
    if (!this.primaryReady()) return;
    if (this.view === 'preview') {
      this.backToPath();
      return;
    }
    if (this.view === 'lessonEnd') {
      this.state.stoppedAt = null;
      this.state.welcomePending = false;
      this.go(this.nextTarget(this.state.screen));
      return;
    }
    const index = this.state.screen;
    const screen = this.screens[index].screen;
    if (screen.kind === 'check') {
      this.pressCheckPrimary(screen);
      return;
    }
    if (screen.kind === 'apply' && !this.canNext(index)) {
      this.applyCheck(screen);
      return;
    }
    if (!this.canNext(index)) {
      if (screen.kind === 'task' || screen.kind === 'model_task') {
        const task = screen.task ? this.task(screen.task) : null;
        if (task?.type === 'pick') this.pickCheck(task, this.taskKey(screen));
        else if (task?.type === 'tapword' && task.need !== 'all') this.wordCheck(task, this.taskKey(screen));
        else if (task?.type === 'build') {
          this.say(this.zh ? '先用下面的词卡把句子拼出来。' : 'Build it with the word cards below first.');
          this.log('next_blocked');
          this.emit();
        } else if (task?.type === 'write' || task?.frameFill) this.writeCheck(task, this.taskKey(screen));
        else {
          this.say(`${this.lockedMsg(index)} ${this.activity()?.unsupportedReason ?? ''}`.trim());
          this.emit();
        }
        return;
      }
      this.say(this.lockedMsg(index));
      this.emit();
      return;
    }
    this.next();
  }

  pick(index: number): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return;
    if (screen.kind === 'check') {
      const item = this.currentCheckItem(screen);
      if (!item || item.task.type !== 'pick' || this.checkRecord(screen).finished) return;
      this.selectPick(item.task, this.taskState(item.key), index);
      return;
    }
    if (!screen.task) return;
    const task = this.task(screen.task);
    if (task.type !== 'pick') return;
    const key = this.taskKey(screen);
    const taskState = this.taskState(key);
    if (taskState.status !== 'open') return;
    this.selectPick(task, taskState, index);
  }

  tapWord(index: number): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return;
    if (screen.kind === 'check') {
      const item = this.currentCheckItem(screen);
      if (!item || item.task.type !== 'tapword' || item.task.need === 'all' || this.checkRecord(screen).finished) return;
      const taskState = this.taskState(item.key);
      taskState.sel = taskState.sel === index ? null : index;
      taskState.bad = null;
      this.save(true);
      this.emit();
      return;
    }
    if (!screen.task) return;
    const task = this.task(screen.task);
    if (task.type !== 'tapword' || task.need === 'all') return;
    const taskState = this.taskState(this.taskKey(screen));
    if (taskState.status !== 'open') return;
    taskState.sel = taskState.sel === index ? null : index;
    taskState.bad = null;
    this.save(true);
    this.emit();
  }

  openHint(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (screen?.kind === 'apply') {
      const task = this.task(this.pageOf(screen.page)?.task ?? '');
      const record = this.taskState(screen.page + ':hints');
      record.hintLv = Math.min((record.hintLv ?? 0) + 1, task.coach?.hints?.length ?? 0);
      this.save(); this.emit(); return;
    }
    if (!screen?.task) return;
    const task = this.task(screen.task);
    const taskState = this.taskState(this.taskKey(screen));
    if (taskState.status !== 'open') return;
    const hints = task.coach?.hints ?? [];
    const level = taskState.hintLv ?? 0;
    if (level < hints.length) {
      taskState.hintLv = level + 1;
      this.log('hint_open', { task: task.id });
      this.save();
      this.emit();
      return;
    }
    // Hint controls never submit, grade or reveal an answer.
    // Existing formal wrong-attempt rules remain responsible for shown.
    return;
  }

  showAnother(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.coach) return;
    const total = 1 + (screen.coach.beats?.length ?? 0);
    const beat = this.coachBeat[screen.id] ?? 0;
    if (beat < total - 1) {
      this.coachBeat[screen.id] = beat + 1;
      this.log('coach_beat', { screen: screen.id });
      this.emit();
    }
  }

  chooseSkip(choice: 'skip' | 'review'): void {
    const step = this.screens[this.state.screen]?.step;
    if (!step?.skill || this.skipState(step) !== 'offer') return;
    this.state.skipChoice = this.state.skipChoice ?? {};
    this.state.skipChoice[step.id] = choice;
    this.log(choice === 'skip' ? 'skill_step_skipped' : 'skill_step_review');
    this.save();
    if (choice === 'skip') {
      const last = this.screens.findIndex(
        (ref) => ref.step === step && ref.n === step.screens.length - 1,
      );
      this.go(this.nextTarget(last));
      return;
    }
    this.emit();
  }

  /** Alex `Skip.checkFailed`: a failed check returns a skipped skill to learning. */
  checkFailed(skill: string): void {
    const step = this.engine.stepTags(this.config).find((item) => item.skill === skill);
    if (!step || !this.stepSkipped(step)) return;
    this.state.skills = this.state.skills ?? {};
    this.state.skills[skill] = 'learning';
    if (this.state.skipChoice) delete this.state.skipChoice[step.id];
    this.log('skill_skip_revoked');
    this.save();
    this.emit();
  }

  consumeReturnFocus(): { unitId: string; number: number } | null {
    const focus = this.returnFocus;
    this.returnFocus = null;
    return focus;
  }

  placeCard(text: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return;
    if (screen.kind === 'task' && screen.task) {
      const task = this.task(screen.task);
      if (task.type === 'build') {
        this.buildTap(task, this.taskKey(screen), text);
        return;
      }
    }
    this.insertWord(text);
  }

  startAgain(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.task) return;
    const task = this.task(screen.task);
    if (task.type !== 'build') return;
    const taskState = this.taskState(this.taskKey(screen));
    if (taskState.status !== 'open') return;
    taskState.built = [];
    delete this.state.regions[this.taskKey(screen)];
    this.shakeCard = null;
    this.save();
    this.emit();
  }

  setBlank(index: number, value: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.task) return;
    const taskState = this.taskState(this.taskKey(screen));
    if (taskState.status !== 'open') return;
    const blanks = taskState.blanks ?? [];
    blanks[index] = value;
    taskState.blanks = blanks;
    taskState.focusBlank = index;
    this.save(true);
    this.emit();
  }

  focusBlank(index: number): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.task) return;
    this.taskState(this.taskKey(screen)).focusBlank = index;
    this.emit();
  }

  setCanvas(value: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return;
    const key = this.canvasKey(screen);
    if (!key) return;
    const old = regionText(this.state.regions[key]);
    let prefix = 0;
    while (prefix < old.length && prefix < value.length && old[prefix] === value[prefix]) prefix++;
    let suffix = 0;
    while (suffix < old.length - prefix && suffix < value.length - prefix && old[old.length - 1 - suffix] === value[value.length - 1 - suffix]) suffix++;
    this.replaceRegion(key, prefix, old.length - suffix, value.slice(prefix, value.length - suffix), this.pasted ? 'paste' : 'typed');
    this.pasted = false;
    this.save(true);
    this.emit();
  }

  selectGrid(groupId: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return;
    this.state.grid.tab[this.gridKey(screen)] = groupId;
    this.save(true);
    this.emit();
  }

  moveOn(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen || screen.kind !== 'apply') return;
    const page = this.pageOf(screen.page);
    const task = page?.task ? this.task(page.task) : null;
    const record = this.applyRecord(screen);
    if (record.passed || record.tries < (task?.continue_after ?? 2) || this.state.done[screen.page]) return;
    record.movedOn = true;
    this.state.done[screen.page] = true;
    this.log('apply_move_on');
    this.save();
    this.emit();
  }

  openCheckQuestion(index: number): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen || screen.kind !== 'check') return;
    const record = this.checkRecord(screen);
    if (record.finished) return;
    record.q = index;
    this.save();
    this.emit();
  }

  openCheckResult(index: number | null): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen || screen.kind !== 'check') return;
    const record = this.checkRecord(screen);
    if (!record.finished) return;
    record.view = index;
    this.save();
    this.emit();
  }

  retryCheck(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (screen?.kind !== 'check') return;
    const record = this.checkRecord(screen);
    if (!record.finished || record.passed) return;
    record.attempt += 1;
    record.finished = false;
    record.q = 0;
    record.view = null;
    record.blankAsk = false;
    this.say('');
    this.save();
    this.emit();
  }

  currentTaskClosed(): boolean {
    const screen = this.screens[this.state.screen]?.screen;
    return !!screen?.task && this.taskState(this.taskKey(screen)).status !== 'open';
  }

  setCaret(start: number, end: number): void { this.caret = { start, end }; }
  markPaste(): void { this.pasted = true; }

  dismissPractice(): void {
    this.practiceBurst = null;
    this.emit();
  }

  private selectPick(task: AlexTask, taskState: TaskProgress, index: number): void {
    if (taskState.status !== 'open') return;
    taskState.picked = taskState.picked ?? [];
    taskState.wrong = [];
    if (task.multi) {
      const found = taskState.picked.indexOf(index);
      if (found >= 0) taskState.picked.splice(found, 1);
      else taskState.picked.push(index);
    } else {
      taskState.picked = [index];
    }
    this.log('pick', { task: task.id });
    this.save(true);
    this.emit();
  }

  private choiceVisual(task: AlexTask, taskState: TaskProgress, index: number): ChoiceVisualState {
    const answers = task.answers ?? [];
    const picked = taskState.picked ?? [];
    const wrong = taskState.wrong ?? [];
    const isAnswer = answers.includes(index);
    if (taskState.status === 'done') return isAnswer ? 'correct' : 'dim';
    if (taskState.status === 'shown') {
      if (isAnswer) return 'correctUnselected';
      if (wrong.includes(index) || picked.includes(index)) return 'wrong';
      return 'dim';
    }
    if (wrong.includes(index)) return 'wrong';
    if (picked.includes(index)) return 'selected';
    return 'default';
  }

  private hamburgerLayers(skill: string | undefined, teach: string): ActivityModel['layers'] {
    const plan = this.config.pages.find((page) => page.kind === 'plan');
    const slots = plan?.slots ?? [];
    const slot = (field: string) => slots.find((item) => item.field === field);
    const label = (field: string) => {
      const item = slot(field);
      if (!item) return '';
      return this.zh ? item.zh || item.label : item.label;
    };
    return [
      { id: 'top', label: label('opinion'), value: teach, emphasis: skill === 'L2-04' },
      { id: 'fill', label: label('reason1'), value: slot('reason1')?.ph ?? '', emphasis: false },
      { id: 'bottom', label: label('closing'), value: slot('closing')?.ph ?? '', emphasis: false },
    ];
  }

  private buildModel(task: AlexTask, taskState: TaskProgress): Pick<ActivityModel, 'build' | 'wordGrid'> {
    const built = taskState.built ?? [];
    const bench = this.benchFrom(built);
    const cards = this.setCards(task).map((text) => ({
      text,
      used: false,
      hint: !!task.in_order && (taskState.wrongTaps?.[text] ?? 0) >= 2,
      shake: this.shakeCard === text,
    }));
    const used = built.slice();
    for (const card of cards) {
      const found = used.indexOf(card.text);
      if (found >= 0) {
        card.used = true;
        used.splice(found, 1);
      }
    }
    const taskWords = cards.map((card, index) => ({
      id: `${card.text}-${index}`,
      text: card.text,
      used: card.used,
      hint: card.hint,
      shake: card.shake,
    }));
    return {
      build: {
        bench,
        ordered: !!task.in_order,
        remaining: task.in_order ? Math.max(0, (task.target?.length ?? 0) - built.length) : 0,
        revealed: taskState.status === 'shown' ? task.answer_text : undefined,
        cards,
      },
      wordGrid: {
        groups: [{ id: 'set', label: this.zh ? '本题词块' : 'Sentence set', words: taskWords }],
        active: 'set',
      },
    };
  }

  private frameModel(task: AlexTask, key: string, taskState: TaskProgress): Pick<ActivityModel, 'frame' | 'wordGrid'> {
    const parts = (task.frameFill?.frame ?? '').split('___');
    const blanks = (task.frameFill?.blanks ?? []).map((blank, index) => ({
      label: blank.label,
      value: taskState.blanks?.[index] ?? '',
      minWords: blank.min_words,
    }));
    const page = this.pageOf(this.screens[this.state.screen].screen.page);
    const level = page?.grid?.level && page.grid.level !== 'off' ? page.grid.level : 'chunks';
    return {
      frame: {
        parts,
        blanks,
        focus: taskState.focusBlank ?? 0,
      },
      wordGrid: this.trioGrid(
        key,
        (task.cells ?? []).map((cell, index) => ({ id: `task-${index}-${this.cellText(cell)}`, text: this.cellText(cell) })),
        level,
        task,
      ),
    };
  }

  private applyModel(screen: AlexScreen): Pick<ActivityModel, 'ask' | 'canvas' | 'wordGrid' | 'applyMoveOn' | 'feedback' | 'feedbackTone' | 'hints' | 'hintAction'> {
    const page = this.pageOf(screen.page);
    const task = page?.task ? this.task(page.task) : null;
    const record = this.applyRecord(screen);
    const failed = (record.result?.checks ?? []).filter((item) => !item.met);
    const extra = failed[1] ? (this.zh ? `另外：${failed[1].zh || failed[1].label}` : `Also: ${failed[1].tip || failed[1].label}`) : '';
    const remembered = record.result
      ? [
          record.safety
            ? this.zh
              ? '我想和你谈谈这段。请给老师看。'
              : 'I’d like to talk with you about this. Please show your teacher.'
            : this.zh
              ? record.result.zh || record.result.feedback
              : record.result.feedback,
          extra,
        ]
          .filter(Boolean)
          .join(' ')
      : this.feedback;
    return {
      ask: this.text(task?.ask),
      hints: (task?.coach?.hints ?? []).slice(0, this.state.tasks[screen.page + ':hints']?.hintLv ?? 0).map(hint => this.text(hint)),
      hintAction: (this.state.tasks[screen.page + ':hints']?.hintLv ?? 0) < (task?.coach?.hints?.length ?? 0) ? (this.state.tasks[screen.page + ':hints']?.hintLv ? 'another' : 'hint') : null,
      feedback: remembered,
      feedbackTone: record.result ? (record.passed && !record.safety ? 'correct' : 'wrong') : this.feedbackTone,
      canvas: {
        text: regionText(this.state.regions[screen.page]),
        tip: this.text(task?.tip),
        label: this.text(task?.ask),
      },
      wordGrid: this.wordGrid(page, task, screen.page),
      applyMoveOn: !record.passed && record.tries >= (task?.continue_after ?? 2) && !this.state.done[screen.page],
    };
  }

  private checkModel(screen: AlexScreen): Pick<ActivityModel, 'ask' | 'pick' | 'tapword' | 'canvas' | 'check'> & Partial<Pick<ActivityModel, 'feedback' | 'feedbackTone'>> {
    const page = this.pageOf(screen.page);
    if (!page) return { ask: '', check: { phase: 'answer', number: 1, total: 0, dots: [] } };
    const record = this.checkRecord(screen);
    const ids = this.engine.masteryItems(page, record.attempt);
    const dots = ids.map((id, index) => ({
      answered: this.questionAnswered(this.task(id), `${page.id}:a${record.attempt}:${id}`),
      current: index === Math.min(record.q, ids.length - 1),
    }));
    if (record.finished && record.view == null) {
      const last = record.history[record.history.length - 1];
      return {
        ask: '',
        check: {
          phase: 'results',
          number: 0,
          total: ids.length,
          dots,
          passed: !!record.passed,
          scoreLine: last ? (this.zh ? `${last.score} / ${last.total}` : `${last.score} of ${last.total}`) : '',
          rows: (last?.results ?? []).map((item, index) => ({ index, ask: this.text(this.task(item.id).ask), correct: item.correct })),
          tryNew: !record.passed,
        },
      };
    }
    const index = record.finished && record.view != null ? record.view : Math.min(record.q, ids.length - 1);
    const id = ids[index];
    const task = id ? this.task(id) : null;
    const key = id ? `${page.id}:a${record.attempt}:${id}` : '';
    const taskState = key ? this.taskState(key) : { tries: 0, status: 'open' as const };
    const graded = record.finished && record.view != null ? record.history[record.history.length - 1]?.results[record.view] : undefined;
    const body = task ? this.checkBody(task, taskState, !!graded, graded?.correct) : {};
    return {
      ask: task ? this.text(task.ask) : '',
      ...body,
      ...(graded ? { feedback: this.zh ? graded.zh || graded.explanation || '' : graded.explanation || '', feedbackTone: graded.correct ? 'correct' as const : 'wrong' as const } : {}),
      check: {
        phase: graded ? 'graded' : 'answer',
        number: index + 1,
        total: ids.length,
        dots,
        passed: record.passed,
        tryNew: !!record.finished && !record.passed,
      },
    };
  }

  private checkBody(
    task: AlexTask,
    taskState: TaskProgress,
    graded: boolean,
    correct?: boolean,
  ): Pick<ActivityModel, 'pick' | 'tapword' | 'canvas'> {
    if (task.type === 'pick' && task.lines) {
      const picked = taskState.picked ?? [];
      return {
        pick: {
          multi: !!task.multi,
          locked: graded,
          hint: '',
          options: task.lines.map((line, index) => ({
            index,
            letter: this.engine.choiceLetter(index),
            text: line,
            selected: picked.includes(index),
            wrong: false,
            state: graded ? this.gradedChoiceState(task, taskState, index, !!correct) : picked.includes(index) ? 'selected' : 'default',
          })),
        },
      };
    }
    if (task.type === 'tapword' && task.text) {
      const tokens = this.engine.tokens(task.text);
      const targets = (task.targets ?? []).map((target) => this.engine.locate(task.text ?? '', target));
      return {
        tapword: {
          locked: graded,
          words: tokens.map((token, index) => ({
            index,
            text: token.w,
            selected: taskState.sel === index,
            wrong: graded && taskState.sel === index && !targets.includes(index),
            revealed: graded && targets.includes(index),
          })),
        },
      };
    }
    return {
      canvas: {
        text: regionText(this.state.regions[this.canvasKey(this.screens[this.state.screen].screen) ?? '']),
        tip: '',
        label: this.text(task.ask),
      },
    };
  }

  private gradedChoiceState(task: AlexTask, taskState: TaskProgress, index: number, correct: boolean): ChoiceVisualState {
    const answers = task.answers ?? [];
    const picked = taskState.picked ?? [];
    if (answers.includes(index)) return correct && picked.includes(index) ? 'correct' : 'correctUnselected';
    if (picked.includes(index)) return 'wrong';
    return 'dim';
  }

  private checkFooter(screen: AlexScreen, backLabel: string, backDisabled: boolean): FooterModel {
    const record = this.checkRecord(screen);
    const page = this.pageOf(screen.page);
    const total = page ? this.engine.masteryItems(page, record.attempt).length : 0;
    const question = Math.min(record.q, Math.max(0, total - 1));
    if (!record.finished) {
      const last = question >= total - 1;
      return {
        backLabel: this.zh ? '返回' : 'Back',
        backDisabled: backDisabled && question === 0,
        primaryLabel: last
          ? record.blankAsk
            ? this.zh
              ? '仍然交卷'
              : 'Hand in anyway'
            : this.zh
              ? '交上我的检查'
              : 'Hand in my check'
          : this.zh
            ? '下一题'
            : 'Next question',
        primaryTestId: last ? 'hand-in-check' : 'next-question',
      };
    }
    if (record.view != null) {
      return { backLabel, backDisabled: false, primaryLabel: this.zh ? '全部结果' : 'All results', primaryTestId: 'all-results' };
    }
    if (!this.state.done[screen.page]) {
      return { backLabel, backDisabled, primaryLabel: this.zh ? '再做一组' : 'Try a new set', primaryTestId: 'retry-check' };
    }
    return { backLabel, backDisabled, primaryLabel: this.nextLabel(this.state.screen), primaryTestId: 'next' };
  }

  private pressCheckPrimary(screen: AlexScreen): void {
    const record = this.checkRecord(screen);
    const page = this.pageOf(screen.page);
    if (!page) return;
    const total = this.engine.masteryItems(page, record.attempt).length;
    if (!record.finished) {
      if (record.q < total - 1) {
        record.q += 1;
        this.save();
        this.emit();
        return;
      }
      this.tryHandIn(screen, page);
      return;
    }
    if (record.view != null) {
      record.view = null;
      this.save();
      this.emit();
      return;
    }
    if (!this.state.done[screen.page]) {
      record.attempt += 1;
      record.finished = false;
      record.q = 0;
      record.view = null;
      record.blankAsk = false;
      this.say('');
      this.save();
      this.emit();
      return;
    }
    this.next();
  }

  private tryHandIn(screen: AlexScreen, page: AlexPage): void {
    const record = this.checkRecord(screen);
    const ids = this.engine.masteryItems(page, record.attempt);
    const blank = ids
      .map((id, index) => (this.questionAnswered(this.task(id), `${page.id}:a${record.attempt}:${id}`) ? -1 : index + 1))
      .filter((index) => index > 0);
    if (blank.length && !record.blankAsk) {
      record.blankAsk = true;
      const list = blank.join(', ');
      this.say(
        this.zh
          ? `还有题没做：${list}。可以回去试一试，也可以直接交。`
          : (blank.length === 1 ? `Question ${list} is` : `Questions ${list} are`) + ' still blank. You can go back and try, or hand it in as it is.',
      );
      this.log('check_blank_warn');
      this.save();
      this.emit();
      return;
    }
    record.blankAsk = false;
    this.handInCheck(screen, page);
  }

  private handInCheck(screen: AlexScreen, page: AlexPage): void {
    const record = this.checkRecord(screen);
    const ids = this.engine.masteryItems(page, record.attempt);
    const results = ids.map((id) => {
      const task = this.task(id);
      const key = `${page.id}:a${record.attempt}:${id}`;
      const grade = this.gradeItem(task, key);
      return { id, correct: !!grade.correct, writing: id === page.writing, explanation: grade.explanation, zh: grade.zh };
    });
    const pass = this.engine.masteryPass(results);
    record.finished = true;
    record.passed = !!record.passed || pass.passed;
    record.view = null;
    record.history.push({ attempt: record.attempt, passed: pass.passed, score: pass.score, total: pass.total, results });
    if (pass.passed || record.attempt >= 1) this.state.done[page.id] = true;
    this.say(
      pass.passed
        ? this.zh
          ? `你通过了这次检查。${pass.score} / ${pass.total}。`
          : `You passed this check. ${pass.score} of ${pass.total}.`
        : this.zh
          ? `还没有。${pass.score} / ${pass.total}。`
          : `Not yet. ${pass.score} of ${pass.total}.`,
      pass.passed ? 'correct' : 'wrong',
    );
    this.log('check_done', { score: pass.score, passed: pass.passed });
    if (!pass.passed && page.skill) this.checkFailed(page.skill);
    this.save();
    this.emit();
  }

  private questionAnswered(task: AlexTask, key: string): boolean {
    const taskState = this.state.tasks[key];
    if (!taskState && !this.state.regions[key]) return false;
    if (task.type === 'pick') return !!(taskState?.picked && taskState.picked.length);
    if (task.type === 'tapword') return taskState?.sel != null;
    const text = regionText(this.state.regions[key]).trim();
    return !!text && text !== (task.text || '').trim();
  }

  private gradeItem(task: AlexTask, key: string): { correct: boolean; explanation: string; zh?: string } {
    const taskState = this.taskState(key);
    if (task.type === 'pick') return { correct: this.engine.choiceGrade(task, taskState.picked ?? []).correct, explanation: '' };
    if (task.type === 'tapword') {
      const targets = (task.targets ?? []).map((target) => this.engine.locate(task.text ?? '', target));
      return { correct: taskState.sel != null && targets.includes(taskState.sel), explanation: '' };
    }
    const text = regionText(this.state.regions[key]).trim();
    if (!text || text.includes('___')) {
      return { correct: false, explanation: 'Fill each ___ first.', zh: '先把每个 ___ 填上。' };
    }
    if (task.rules) {
      return this.analyzer.checkProduction(
        { check: task.rules, success: task.ok?.en, successZh: task.ok?.zh },
        text,
      );
    }
    return { correct: false, explanation: 'Not yet.', zh: '还不对。' };
  }

  private applyCheck(screen: AlexScreen): void {
    const page = this.pageOf(screen.page);
    const task = page?.task ? this.task(page.task) : null;
    const text = this.engine.stripPictures(regionText(this.state.regions[screen.page])).trim();
    if (this.analyzer.wordCount(text) < 3) {
      this.say(this.zh ? '先写一点，我再来读。' : 'Write a little first. Then I’ll read it.');
      this.log('next_blocked');
      this.emit();
      return;
    }
    const record = this.applyRecord(screen);
    const safety = this.analyzer.safetyScreen(text);
    const graded = safety
      ? {
          passed: false,
          checks: [] as ApplyCheck[],
          feedback: 'I’d like to talk with you about this. Please show your teacher.',
          zh: '我想和你谈谈这段。请给老师看。',
          glow: '',
          safety_flag: true,
        }
      : { ...this.analyzer.checkApply(page?.skill ?? '', text), safety_flag: false };
    record.tries += 1;
    record.passed = !!graded.passed;
    record.safety = !!graded.safety_flag;
    record.result = graded;
    if (graded.passed) {
      this.state.done[screen.page] = true;
      this.notePractice(screen.page, false);
    }
    const failed = graded.checks.filter((item) => !item.met);
    const also = failed[1] ? (this.zh ? `另外：${failed[1].zh || failed[1].label}` : `Also: ${failed[1].tip || failed[1].label}`) : '';
    this.say([this.zh ? graded.zh || graded.feedback : graded.feedback, also].filter(Boolean).join(' '), graded.passed ? 'correct' : 'wrong');
    this.log('apply_check', { passed: graded.passed, task: task?.id });
    this.save();
    this.emit();
  }

  private writeCheck(task: AlexTask, key: string): void {
    const taskState = this.taskState(key);
    if (taskState.status !== 'open') return;
    const text = task.frameFill ? this.composedFrame(task, taskState) : regionText(this.state.regions[key]).trim();
    if (text.includes('___')) {
      taskState.tries += 1;
      this.say(this.zh ? '先把每个 ___ 填上。' : 'Fill each ___ first.');
      if (taskState.tries >= 2) this.finish(task, key, 'shown');
      else {
        this.save();
        this.emit();
      }
      return;
    }
    const grade = task.frameFill
      ? this.engine.frameFill(text, task.frameFill, task.ok)
      : task.rules
        ? this.analyzer.checkProduction({ check: task.rules, success: task.ok?.en, successZh: task.ok?.zh }, text)
        : { correct: false, explanation: 'Not yet.', zh: '还不对。' };
    taskState.tries += 1;
    if (grade.correct) {
      this.finish(task, key, 'done');
      if (task.ok) this.say(this.affirm(this.text(task.ok)), 'correct');
      this.emit();
      return;
    }
    if (taskState.tries >= 2) {
      this.finish(task, key, 'shown');
      return;
    }
    this.say(this.zh ? grade.zh || grade.explanation : grade.explanation);
    this.log('task_try');
    this.save();
    this.emit();
  }

  private buildTap(task: AlexTask, key: string, cellText: string): void {
    const taskState = this.taskState(key);
    if (taskState.status !== 'open') return;
    taskState.built = taskState.built ?? [];
    if (task.in_order) {
      const want = task.target?.[taskState.built.length];
      if (cellText !== want) {
        const taps = { ...(taskState.wrongTaps ?? {}) };
        taps[cellText] = (taps[cellText] ?? 0) + 1;
        taskState.wrongTaps = taps;
        taskState.miss = (taskState.miss ?? 0) + 1;
        this.shakeCard = cellText;
        const hinted = taps[cellText] >= 2;
        const why = this.text(task.why);
        this.say(
          hinted && (task.coach?.words?.[cellText] || why)
            ? this.text(task.coach?.words?.[cellText]) || why
            : this.zh
              ? '这个词还不是下一个。'
              : 'That word does not come next.',
        );
        this.log('set_miss', { task: task.id, cell: cellText });
        this.save();
        this.emit();
        return;
      }
    }
    this.shakeCard = null;
    taskState.built.push(cellText);
    this.state.regions[key] = [{ t: this.benchFrom(taskState.built), s: 'set' }];
    if (task.target && taskState.built.length === task.target.length) {
      const bench = this.benchFrom(taskState.built);
      const ok = (!!task.answer_text && this.engine.sameText(bench, task.answer_text)) || JSON.stringify(taskState.built) === JSON.stringify(task.target);
      taskState.tries += 1;
      if (ok) {
        this.finish(task, key, 'done');
        return;
      }
      if (taskState.tries >= 2) {
        this.finish(task, key, 'shown');
        return;
      }
      this.say(this.text(task.why));
      taskState.built = [];
      delete this.state.regions[key];
      this.log('task_try');
      this.save();
      this.emit();
      return;
    }
    this.save();
    this.emit();
  }

  private insertWord(text: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return;
    if (screen.kind === 'task' && screen.task && this.task(screen.task).frameFill) {
      const taskState = this.taskState(this.taskKey(screen));
      if (taskState.status !== 'open') return;
      const index = taskState.focusBlank ?? 0;
      const blanks = taskState.blanks ?? [];
      const current = blanks[index] ?? '';
      const from = Math.min(this.caret.start, current.length), to = Math.min(this.caret.end, current.length);
      const inserted = this.engine.smartInsert(current, from, to, text, 'grid');
      blanks[index] = inserted.value;
      this.caret = { start: inserted.caret, end: inserted.caret };
      taskState.blanks = blanks;
      this.save();
      this.emit();
      return;
    }
    const key = this.canvasKey(screen);
    if (!key) return;
    const current = regionText(this.state.regions[key]);
    const kind = /^[.,!?]$/.test(text) ? 'mark' : /\s/.test(text) ? 'chunk' : 'grid';
    const from = Math.min(this.caret.start, current.length), to = Math.min(this.caret.end, current.length);
    const next = this.engine.smartInsert(current, from, to, text, kind);
    const tailLength = current.length - to;
    const inserted = next.value.slice(from, next.value.length - tailLength);
    this.replaceRegion(key, from, to, inserted, kind === 'chunk' ? 'chunk' : 'grid');
    this.caret = { start: next.caret, end: next.caret };
    this.save();
    this.emit();
  }

  private replaceRegion(key: string, start: number, end: number, inserted: string, source: string): void {
    const segments = this.state.regions[key] ?? [];
    const slice = (from: number, to: number) => {
      let offset = 0;
      return segments.flatMap(segment => {
        const a = Math.max(0, from - offset), b = Math.min(segment.t.length, to - offset);
        offset += segment.t.length;
        return b > a ? [{ t: segment.t.slice(a, b), s: segment.s }] : [];
      });
    };
    this.state.regions[key] = [...slice(0, start), ...(inserted ? [{ t: inserted, s: source }] : []), ...slice(end, Number.MAX_SAFE_INTEGER)];
  }

  private canvasKey(screen: AlexScreen): string | null {
    if (screen.kind === 'apply') return screen.page;
    if (screen.kind === 'check') {
      const item = this.currentCheckItem(screen);
      return item?.task.type === 'write' || item?.task.type === 'edit' ? item.key : null;
    }
    return null;
  }

  private currentCheckItem(screen: AlexScreen): { task: AlexTask; key: string; id: string } | null {
    const page = this.pageOf(screen.page);
    if (!page) return null;
    const record = this.checkRecord(screen);
    const ids = this.engine.masteryItems(page, record.attempt);
    const index = record.finished && record.view != null ? record.view : Math.min(record.q, Math.max(0, ids.length - 1));
    const id = ids[index];
    if (!id) return null;
    return { id, task: this.task(id), key: `${page.id}:a${record.attempt}:${id}` };
  }

  private applyRecord(screen: AlexScreen): ApplyRecord {
    const page = this.pageOf(screen.page);
    const skill = page?.skill ?? screen.page;
    return this.state.applies[skill] ?? (this.state.applies[skill] = { tries: 0, passed: false, result: null });
  }

  private checkRecord(screen: AlexScreen): CheckRecord {
    const current = this.state.checks[screen.page];
    if (current && Array.isArray(current.history)) return current;
    const fresh: CheckRecord = {
      attempt: 0,
      finished: !!current?.finished,
      passed: !!current?.passed,
      history: [],
      q: 0,
      view: null,
    };
    this.state.checks[screen.page] = fresh;
    return fresh;
  }

  private trioGrid(
    key: string,
    taskWords: { id: string; text: string; used?: boolean; hint?: boolean; shake?: boolean }[],
    level: string,
    task: AlexTask,
  ): NonNullable<ActivityModel['wordGrid']> {
    const labels = { task: '本题词块', opinion: '观点', marks: '标点' } as const;
    const ids = ['task', 'opinion', 'marks'] as const;
    const saved = this.state.grid.tab[key];
    const active = ids.some((id) => id === saved) ? saved : 'task';
    return {
      active,
      groups: ids.map((id) => ({
        id,
        label: labels[id],
        words:
          id === 'task'
            ? taskWords
            : this.gridWords(id, task, level).map((word, index) => ({ id: `${id}-${index}-${word}`, text: word })),
      })),
    };
  }

  private wordGrid(page: AlexPage | null, task: AlexTask | null, key: string): ActivityModel['wordGrid'] {
    const spec = this.engine.gridFor(this.config, page, task);
    if (spec.locked || !spec.tabs.length) return undefined;
    const activeSaved = this.state.grid.tab[key];
    const active = spec.tabs.includes(activeSaved) ? activeSaved : spec.tabs[0];
    return {
      active,
      groups: spec.tabs.map((id) => ({
        id,
        label: this.gridLabel(id, task),
        words: this.gridWords(id, task, spec.level).map((word, index) => ({ id: `${id}-${index}-${word}`, text: word })),
      })),
    };
  }

  private gridLabel(id: string, task: AlexTask | null): string {
    if (id === 'set') return task?.set === 'connect' ? 'Connect set' : this.zh ? '句子拼搭' : 'Sentence set';
    if (id === 'task') return this.zh ? '本题词块' : 'This task';
    const tab = this.config.grids?.tabs[id];
    if (!tab) return id;
    return this.zh ? tab.zh || tab.label || id : tab.label || id;
  }

  private gridWords(id: string, task: AlexTask | null, level: string): string[] {
    if (id === 'task') return (task?.cells ?? []).map((cell) => this.cellText(cell));
    if (id === 'set') return this.setCards(task);
    return this.engine.cellsFor(this.config, id, level).map((cell) => cell.t);
  }

  private setCards(task: AlexTask | null): string[] {
    const cells = (task?.cells ?? []).map((cell) => this.cellText(cell));
    return seededShuffle(cells.concat(task?.distractors ?? []), task?.id ?? 'set');
  }

  private cellText(cell: GridCell): string {
    return typeof cell === 'string' ? cell : cell.t;
  }

  private benchFrom(tokens: string[]): string {
    let value = '';
    for (const token of tokens) {
      const kind = /^[.,!?]$/.test(token) ? 'mark' : 'phrase';
      value = this.engine.smartInsert(value, value.length, value.length, token, kind).value;
    }
    return value;
  }

  private composedFrame(task: AlexTask, taskState: TaskProgress): string {
    const frame = task.frameFill?.frame ?? '';
    const parts = frame.split('___');
    return parts
      .map((part, index) => part + (index < parts.length - 1 ? taskState.blanks?.[index]?.trim() || '___' : ''))
      .join('');
  }

  private gridKey(screen: AlexScreen): string {
    if (screen.task) return `${screen.page}:${screen.task}`;
    return screen.page;
  }

  private notePractice(id: string, lesson: boolean): void {
    const key = lesson ? `lesson:${id}` : `item:${id}`;
    if (this.receipt.practice[key]) return;
    this.receipt.practice[key] = true;
    this.writeReceipt();
    this.practiceBurst = { id, lesson };
  }

  private maybeLessonCelebration(): void {
    const lessonIndex = this.screens[this.state.screen]?.li ?? 0;
    const check = this.screens.find((ref) => ref.li === lessonIndex && ref.screen.kind === 'check');
    if (!check) return;
    const record = this.state.checks[check.screen.page];
    if (record?.passed) this.notePractice(check.screen.page, true);
  }

  private lessonEndActivity(): ActivityModel {
    const index = this.state.screen;
    const lessonIndex = this.screens[index]?.li ?? 0;
    const indexes = this.liveIdx(lessonIndex);
    const doneCount = indexes.filter((item) => this.screenDone(item)).length;
    const unit = this.playUnit();
    const current = unit.lessons[lessonIndex];
    const next = unit.lessons[lessonIndex + 1];
    const check = this.screens.find((ref) => ref.li === lessonIndex && ref.screen.kind === 'check');
    const record = check ? this.state.checks[check.screen.page] : undefined;
    const last = record?.history?.[record.history.length - 1];
    const mastery = !record?.history?.length
      ? ''
      : record.passed
        ? this.zh
          ? `你通过了这次检查。${last ? `${last.score} / ${last.total}。` : ''}`
          : `You passed this check. ${last ? `${last.score} of ${last.total}.` : ''}`
        : this.zh
          ? `还没有。${last ? `${last.score} / ${last.total}。` : ''}`
          : `Not yet. ${last ? `${last.score} of ${last.total}.` : ''}`;
    return {
      supported: true,
      template: 'S1',
      kind: 'lesson_end',
      title: this.zh ? '今天的课就到这里。' : 'That’s today’s lesson.',
      ask: '',
      skip: null,
      hints: [],
      hintAction: null,
      coach: [],
      coachMore: false,
      feedback: this.feedback,
      feedbackTone: this.feedback ? this.feedbackTone : 'wrong',
      learn: {
        heading: `${this.lessonWord(current?.n ?? lessonIndex + 1)} · ${this.text(current?.title)}`,
        teach: [
          this.zh
            ? `你完成了 ${doneCount} / ${indexes.length} 页。`
            : `You finished ${doneCount} of ${indexes.length} pages.`,
          mastery,
        ]
          .filter(Boolean)
          .join(' '),
        nextUp: next
          ? this.zh
            ? `下次：${this.lessonWord(next.n)} ${this.text(next.title)} · ${next.min ?? 0} 分钟`
            : `Next time: ${this.lessonWord(next.n)}: ${this.text(next.title)} · ${next.min ?? 0} min`
          : '',
        weakLabel: '',
        strongLabel: '',
      },
    };
  }

  private next(): void {
    const index = this.state.screen;
    if (!this.canNext(index)) return;
    const screen = this.screens[index].screen;
    if (SEEN_KINDS.includes(screen.kind) && !this.state.seen[screen.id]) {
      this.state.seen[screen.id] = true;
      this.log('screen_done');
    }
    if (index === this.screens.length - 1) {
      this.save();
      this.emit();
      return;
    }
    if (this.isLessonEnd(index)) {
      this.view = 'lessonEnd';
      this.log('lesson_end');
      this.save();
      this.maybeLessonCelebration();
      this.emit();
      return;
    }
    this.go(this.nextTarget(index));
  }

  private go(index: number, back = false): boolean {
    if (index < 0 || index >= this.screens.length) return false;
    if (!back && !this.canOpen(index)) {
      this.say(this.lockedMsg(this.firstOpen()));
      this.emit();
      return false;
    }
    this.state.screen = index;
    this.state.page = this.pageIndex(this.screens[index].screen.page);
    this.view = 'lesson';
    this.say('');
    this.log('screen');
    this.save();
    this.emit();
    return true;
  }

  private pickCheck(task: AlexTask, key: string): void {
    const taskState = this.taskState(key);
    const picked = (taskState.picked ?? []).slice();
    if (!picked.length) {
      this.say(
        task.multi
          ? this.zh
            ? '先选出答案，我再和你一起检查。'
            : 'Choose your answers first. Then I’ll check them with you.'
          : this.zh
            ? '先选一个答案，我再和你一起检查。'
            : 'Choose an answer first. Then I’ll check it with you.',
      );
      this.log('next_blocked');
      this.emit();
      return;
    }
    const grade = this.engine.choiceGrade(task, picked);
    taskState.tries += 1;
    if (grade.correct) {
      this.finish(task, key, 'done');
      return;
    }
    if (taskState.tries >= 2) {
      taskState.wrong = picked.filter((index) => !(task.answers ?? []).includes(index));
      this.finish(task, key, 'shown');
      return;
    }
    const badPick = picked.find((index) => !(task.answers ?? []).includes(index));
    const option = badPick != null ? task.coach?.options?.[badPick] : undefined;
    let message: string;
    if (task.multi) {
      taskState.wrong = picked.filter((item) => !(task.answers ?? []).includes(item));
      message =
        badPick != null
          ? option
            ? this.zh
              ? `你选了 ${this.engine.choiceLetter(badPick)}。${option.zh ?? option.en ?? ''} 再看一次其他选项。`
              : `You chose ${this.engine.choiceLetter(badPick)}. ${option.en ?? ''} Look at the others again.`
            : this.zh
              ? '有一项不属于这里。再把每一项读一遍。'
              : 'One of these doesn’t belong. Read each one again.'
          : this.zh
            ? `你找到了 ${grade.right} / ${grade.need}。再看看。`
            : `You found ${grade.right} of ${grade.need}. Look again.`;
    } else {
      const letters = picked.map((index) => this.engine.choiceLetter(index)).join(' and ');
      const reason = option
        ? this.text(option)
        : this.zh
          ? '这个不是最好的答案。慢慢再读一遍。'
          : 'That one isn’t the best answer. Read them again, slowly.';
      message = this.zh
        ? `你选了 ${letters}。${reason} 再试一次。`
        : `You chose ${letters}. ${reason} Try again.`;
      taskState.wrong = picked.slice();
      taskState.picked = [];
    }
    this.say(message);
    this.log('task_try');
    this.save();
    this.emit();
  }

  private wordCheck(task: AlexTask, key: string): void {
    const taskState = this.taskState(key);
    if (taskState.sel == null) {
      this.say(this.zh ? '先点句子里的一个词，我再检查。' : 'Tap a word in the sentence first. Then I’ll check it.');
      this.log('next_blocked');
      this.emit();
      return;
    }
    const targets = (task.targets ?? []).map((target) => this.engine.locate(task.text ?? '', target));
    taskState.tries += 1;
    if (targets.includes(taskState.sel)) {
      this.finish(task, key, 'done');
      return;
    }
    if (taskState.tries >= 2) {
      taskState.bad = taskState.sel;
      this.finish(task, key, 'shown');
      return;
    }
    const word = this.engine.tokens(task.text ?? '')[taskState.sel]?.w ?? '';
    const note = task.coach?.words?.[word.toLowerCase().replace(/[^a-z']/g, '')];
    taskState.bad = taskState.sel;
    taskState.sel = null;
    this.say(
      note
        ? this.zh
          ? `${note.zh ?? note.en ?? ''} 再试一次。`
          : `${note.en ?? ''} Which word tells what someone thinks? Try again.`
        : this.zh
          ? '你点的不是那个词。哪个词说明作者的想法？再试一次。'
          : 'The word you tapped isn’t the one. Which word tells what someone thinks? Try again.',
    );
    this.save();
    this.emit();
  }

  private finish(task: AlexTask, key: string, status: 'done' | 'shown'): void {
    const taskState = this.taskState(key);
    taskState.status = status;
    const graded = this.gradedText(task, taskState, status === 'done');
    const tone = status === 'done' ? 'correct' : 'wrong';
    this.say(
      task.type === 'pick' || (task.type === 'tapword' && status === 'shown' && (task.targets ?? []).length === 1)
        ? graded
        : status === 'done'
          ? this.affirm(this.text(task.ok) || this.text(task.why))
          : this.zh
            ? `答案在这里。${this.text(task.why)}`
            : `Here is the answer. ${this.text(task.why)}`,
      tone,
    );
    if (task.type === 'build' && status === 'shown' && task.answer_text) {
      this.say(this.zh ? `答案在这里：${task.answer_text}` : `Here it is: ${task.answer_text}`);
    }
    this.markPageIfTasksDone(task);
    this.log('task_done');
    this.save();
    if (status === 'done') this.notePractice(task.id, false);
    this.emit();
  }

  private gradedText(task: AlexTask, taskState: TaskProgress, correct: boolean): string {
    if (task.type !== 'pick') {
      return correct
        ? this.affirm(this.text(task.ok) || this.text(task.why))
        : this.zh
          ? `还不对。${this.text(task.why)}`
          : `Not yet. ${this.text(task.why)}`;
    }
    const letter = (index: number) => this.engine.choiceLetter(index);
    const picked = (taskState.picked ?? []).slice().sort((a, b) => a - b);
    const answers = (task.answers ?? []).slice().sort((a, b) => a - b);
    const you = picked.map(letter).join(' and ');
    const answerText = answers.map(letter).join(' and ');
    const rightNotes = answers
      .map((index) => task.coach?.options?.[index])
      .filter((item): item is Bilingual => !!item)
      .map((item) => this.text(item))
      .join(' ');
    const why = rightNotes || this.text(task.why);
    if (correct) return (this.zh ? `对。你选了 ${you}。${why}` : `Right. You chose ${you}. ${why}`).trim();
    const bad = picked.find((index) => !(task.answers ?? []).includes(index));
    const badNote = bad != null ? this.text(task.coach?.options?.[bad]) : '';
    if (!picked.length) {
      return this.zh
        ? `你没有选答案。正确答案是 ${answerText}。${why}`
        : `You didn’t choose an answer. The right answer is ${answerText}. ${why}`;
    }
    return this.zh
      ? `你选了 ${you}。${badNote || '这个不是最好的答案。'}正确答案是 ${answerText}。${why}`
      : `You chose ${you}. ${badNote || 'That one isn’t the best answer.'} The right answer is ${answerText}. ${why}`;
  }

  private markPageIfTasksDone(task: AlexTask): void {
    const page = this.config.pages[this.state.page];
    if (!page || (page.kind !== 'skill' && page.kind !== 'model') || !page.tasks) return;
    const finished = page.tasks.every((id) => {
      const taskState = this.state.tasks[`${page.id}:${id}`];
      return !!taskState && taskState.status !== 'open';
    });
    if (finished) this.state.done[page.id] = true;
    void task;
  }

  private say(text: string, tone: 'correct' | 'wrong' = 'wrong'): void {
    this.feedback = text;
    this.feedbackTone = tone;
    const id = this.screens[this.state.screen]?.screen.id;
    if (text && id) {
      this.state.feedbackByScreen ??= {};
      this.state.feedbackByScreen[id] = { text, tone, locale: this.locale };
      this.save();
    }
  }

  private affirm(text: string): string {
    if (/^(yes|right|that's it|that’s it|fixed|good|correct|对)/i.test(text)) return text;
    const prefix = this.zh ? '对。' : YES[this.yesCount % YES.length];
    this.yesCount += 1;
    return `${prefix} ${text}`.trim();
  }

  private coachLines(screen: AlexScreen): string[] {
    const coach = screen.coach;
    if (!coach?.arrive) return [];
    const all = [coach.arrive, ...(coach.beats ?? [])];
    const beat = Math.min(this.coachBeat[screen.id] ?? 0, all.length - 1);
    return all.slice(0, beat + 1).map((line) => this.text(line));
  }

  private coachHasMore(screen: AlexScreen): boolean {
    const coach = screen.coach;
    if (!coach?.arrive) return false;
    const total = 1 + (coach.beats?.length ?? 0);
    return (this.coachBeat[screen.id] ?? 0) < total - 1;
  }

  private hintAction(task: AlexTask, taskState: TaskProgress): ActivityModel['hintAction'] {
    const hints = task.coach?.hints ?? [];
    if (!hints.length || taskState.status !== 'open') return null;
    const level = taskState.hintLv ?? 0;
    if (level === 0) return 'hint';
    if (level < hints.length) return 'another';
    return null;
  }

  private skipOffer(step: StepTag, screen: AlexScreen): SkipOffer | null {
    if (screen.template !== 'P2' || screen.params?.body !== 'rule_pair' || !screen.params.skip_offer) return null;
    const state = this.skipState(step);
    if (state === 'offer') {
      return {
        stepId: step.id,
        mode: 'offer',
        text: this.zh
          ? '这个技能你练过了。可以跳到下一步，也可以先复习。'
          : 'You’ve practiced this. Skip to what comes next, or review first?',
      };
    }
    if (state === 'skipped' || state === 'mastered_skipped') {
      return {
        stepId: step.id,
        mode: 'note',
        text:
          state === 'skipped'
            ? this.zh
              ? '你跳过了这个技能，随时可以回来复习。'
              : 'You skipped this skill. Review it anytime.'
            : this.zh
              ? '这个技能你已经会了，随时可以复习。'
              : 'You already know this skill. Review it anytime.',
      };
    }
    return null;
  }

  private skipState(step: StepTag): 'none' | 'mastered_skipped' | 'offer' | 'skipped' | 'review' {
    if (!step?.skill) return 'none';
    const mode = this.engine.skipMode(this.skillStatus(step.skill), this.state.allowSkip !== false);
    const choice = this.state.skipChoice?.[step.id];
    if (mode === 'auto') return 'mastered_skipped';
    if (mode === 'offer') return choice === 'skip' ? 'skipped' : choice === 'review' ? 'review' : 'offer';
    return 'none';
  }

  private stepSkipped(step: StepTag): boolean {
    const state = this.skipState(step);
    return state === 'mastered_skipped' || state === 'skipped';
  }

  private skillStatus(skill: string): string {
    return this.state.skills?.[skill] || 'learning';
  }

  private nextTarget(index: number): number {
    let cursor = index + 1;
    while (cursor < this.screens.length - 1 && this.stepSkipped(this.screens[cursor].step)) cursor += 1;
    return Math.min(cursor, this.screens.length - 1);
  }

  private isLessonEnd(index: number): boolean {
    const map = this.engine.lessonMap(this.config, this.engine.effectiveLessons(this.config, this.skippedSteps()));
    return index < this.screens.length - 1 && map[this.nextTarget(index)] !== map[index];
  }

  private skippedSteps(): Record<string, boolean> {
    const skipped: Record<string, boolean> = {};
    for (const step of this.engine.stepTags(this.config)) {
      if (this.stepSkipped(step)) skipped[step.id] = true;
    }
    return skipped;
  }

  private planFields(fields: string[] | undefined): boolean {
    if (!fields?.length) return false;
    return fields.every((field) => this.engine.stripPictures(regionText(this.state.regions[`plan.${field}`])).trim());
  }

  private blockedLabel(index: number): string {
    const kind = this.screens[index].screen.kind;
    if (kind === 'task' || kind === 'model_task') return this.zh ? '检查' : 'Check';
    if (kind === 'check') return this.zh ? '交卷' : 'Hand in';
    return this.zh ? '下一页' : 'Next';
  }

  private nextLabel(index: number): string {
    const last = index === this.screens.length - 1;
    const screen = this.screens[index].screen;
    if (last) return this.state.seen[screen.id] ? (this.zh ? '已完成' : 'Finished') : this.zh ? '我做完了' : 'I’m done';
    if (this.isLessonEnd(index)) return this.zh ? '本课结束' : 'End of lesson';
    const next = this.screens[this.nextTarget(index)];
    if (next && next.si !== this.screens[index].si) {
      return this.zh ? `下一节：${this.text(next.step.label)}` : `Next: ${this.text(next.step.label)}`;
    }
    return this.zh ? '下一页' : 'Next';
  }

  private lockedMsg(index: number): string {
    const kind = this.screens[index]?.screen.kind;
    const messages: Record<string, [string, string]> = {
      task: ['Answer this one first. Then Next opens.', '先完成这一题，下一页才会打开。'],
      model_task: ['Answer this one first. Then Next opens.', '先完成这一题，下一页才会打开。'],
      apply: ['Check your writing first.', '先检查你的写作。'],
      check: ['Hand in your check first.', '先交上这次检查。'],
      plan_layer: ['Write a few words in each part first.', '每个部分先写几个词。'],
      plan_check: ['Check your plan first.', '先检查你的计划。'],
      draft_write: ['Hand in your paragraph first.', '先交上你的段落。'],
      rev_cups: ['Hand it in again first.', '先再交一次。'],
      rev_final: ['Tap “Finish my paragraph” first.', '先点“完成我的段落”。'],
    };
    const pair = (kind && messages[kind]) || ['Finish this page first.', '先完成这一页。'];
    return this.zh ? pair[1] : pair[0];
  }

  private hasResumableWork(lessonIndex: number): boolean {
    const indexes = this.liveIdx(lessonIndex);
    if (!indexes.length) return false;
    if (indexes.some((index) => this.state.seen[this.screens[index].screen.id])) return true;
    if (indexes.some((index) => this.state.done[this.screens[index].screen.page])) return true;
    if (
      indexes.some((index) => {
        const screen = this.screens[index].screen;
        if (!screen.task) return false;
        const taskState = this.state.tasks[`${screen.page}:${screen.task}`];
        if (!taskState) return false;
        return taskState.status !== 'open' || taskState.tries > 0 || (taskState.picked?.length ?? 0) > 0 || taskState.sel != null;
      })
    ) {
      return true;
    }
    return this.curLesson() === lessonIndex && this.state.screen > indexes[0];
  }

  private lessonDetail(
    level: PathLevel,
    unit: PathUnit,
    lessonIndex: number,
    courseState: LessonCourseState,
  ): string {
    const lesson = unit.lessons[lessonIndex];
    if (courseState === 'done') {
      return this.zh ? `完成 · ${lesson.pages ?? ''} 页` : `Done · ${lesson.pages ?? ''} pages`;
    }
    if (courseState === 'skipped') return this.zh ? '已掌握 · 跳过' : 'Mastered · skipped';
    if (!level.current) return this.zh ? '之后打开' : 'Opens later';
    if (courseState === 'current') return this.zh ? '你在这里' : 'You are here';
    if (courseState === 'available') return this.zh ? '可以开始' : 'Ready to start';
    if (courseState === 'view') return this.zh ? '之后打开' : 'Opens later';
    const states = this.lessonStates(unit);
    let previousNumber: number | null = null;
    for (let index = lessonIndex - 1; index >= 0; index -= 1) {
      if (states[index] !== 'done' && states[index] !== 'skipped') previousNumber = unit.lessons[index].n;
    }
    if (previousNumber) {
      return this.zh ? `学完第 ${previousNumber} 课后打开` : `After Lesson ${previousNumber}`;
    }
    return this.zh ? '前面的单元学完后打开' : 'After the unit before';
  }

  private lockWhy(unit: PathUnit, lessonNumber: number): string {
    const lessonIndex = lessonNumber - 1;
    const states = this.lessonStates(unit);
    for (let index = lessonIndex - 1; index >= 0; index -= 1) {
      if (states[index] !== 'done' && states[index] !== 'skipped') {
        const previous = unit.lessons[index];
        return this.zh
          ? `这一步要先走完${this.lessonWord(previous.n)}「${this.text(previous.title)}」。一步一步来。`
          : `First finish ${this.lessonWord(previous.n)}, “${this.text(previous.title)}”. Then this step opens.`;
      }
    }
    return this.zh ? '先完成前一课。' : 'Finish the lesson before this one first.';
  }

  private localToGlobal(localIndex: number): number {
    const lessonIndex = this.screens[this.state.screen]?.li ?? 0;
    return this.liveIdx(lessonIndex)[localIndex] ?? -1;
  }

  private taskKey(screen: AlexScreen): string {
    return `${screen.page}:${screen.task}`;
  }

  private taskState(key: string): TaskProgress {
    return this.state.tasks[key] ?? (this.state.tasks[key] = { tries: 0, status: 'open' });
  }

  private pageIndex(pageId: string): number {
    return this.config.pages.findIndex((page) => page.id === pageId);
  }

  private unitIn(id: string, levelId: string): boolean {
    const level = this.levelPath.levels.find((item) => item.id === levelId);
    if (!level) return false;
    return level.units.some((unit) => unit.id === id) || (level.embedded_skill_units ?? []).includes(id);
  }

  private unitTypeLabel(unit: PathUnit): string {
    const labels = this.zh
      ? { skill: '技能', genre: '写作单元', process: '修改小课' }
      : { skill: 'Skill', genre: 'Writing unit', process: 'Revising mini-lesson' };
    return labels[unit.type as keyof typeof labels] ?? unit.type;
  }

  private shortTitle(value: Bilingual | string): string {
    return this.text(value).replace(/[（(].*$/, '').trim();
  }

  private lessonWord(number: number): string {
    return this.zh ? `第 ${number} 课` : `Lesson ${number}`;
  }

  private introText(level: PathLevel): string {
    if (level.id === 'L2') {
      return this.zh
        ? '在第 2 级，你会学写一个好段落：说出你的想法，用例子说明理由，再好好结尾。你还会学写“怎么做”的说明，和讲一个小故事。'
        : 'In Level 2 you learn to write one good paragraph: say what you think, give reasons with examples, and finish well. You will also explain how to do something and tell a short story.';
    }
    if (!level.current && !this.showsPreviewSeed(level.id)) {
      return this.zh
        ? `这是 ${level.id} 的路径，可以先看看。这些课之后才打开，你现在在 ${this.levelPath.current_level}。`
        : `This is the path for ${level.id}. You can look around; these lessons open later. You are in ${this.levelPath.current_level} now.`;
    }
    return this.zh
      ? `第 ${level.id.slice(1)} 级：${this.text(level.name)}。一步一步往上走。`
      : `${this.text(level.name)}. One step at a time, up to the top.`;
  }

  private remember(unitId: string, number: number): void {
    this.returnTo = { unitId, number };
  }

  private applySkillQuery(search: string): void {
    const params = new URLSearchParams(search);
    const skills = params.get('skills');
    const allow = params.get('allowskip');
    if (skills != null) {
      this.state.skills = {};
      for (const pair of skills.split(',').filter(Boolean)) {
        const [id, status] = pair.split(':');
        if (id && status) this.state.skills[id] = status;
      }
    }
    if (allow != null) this.state.allowSkip = allow !== '0';
  }

  private applyEntryQuery(search: string): void {
    const params = new URLSearchParams(search);
    if (params.has('screen')) {
      /* A raw screen index is not an entry. `Pages.canOpen` stays in charge. */
    }
    const lesson = params.get('lesson');
    if (lesson) {
      const unitId = params.get('unit') || this.levelPath.current_unit;
      this.openLesson(unitId, Number(lesson));
      return;
    }
    if (params.get('start') === 'lesson') {
      const unit = this.playUnit();
      this.openLesson(unit.id, this.curLesson() + 1);
    }
  }

  private readState(): { state: AlexState; fromStorage: boolean } {
    try {
      const raw = this.storage.getItem(ALEX_STATE_KEY);
      if (!raw) return { state: freshState(), fromStorage: false };
      const parsed = JSON.parse(raw) as Partial<AlexState>;
      if (!parsed || parsed.v !== 4) return { state: freshState(), fromStorage: false };
      return { state: { ...freshState(), ...parsed, tasks: parsed.tasks ?? {}, seen: parsed.seen ?? {}, done: parsed.done ?? {} }, fromStorage: true };
    } catch {
      return { state: freshState(), fromStorage: false };
    }
  }

  private readReceipt(): CelebrationReceipt {
    try {
      const raw = this.storage.getItem(CELEBRATION_KEY);
      if (!raw) return freshReceipt();
      const parsed = JSON.parse(raw) as Partial<CelebrationReceipt>;
      return {
        initialized: !!parsed.initialized,
        seenDone: parsed.seenDone ?? {},
        celebrated: parsed.celebrated ?? {},
        practice: parsed.practice ?? {},
      };
    } catch {
      return freshReceipt();
    }
  }

  private writeReceipt(): void {
    this.storage.setItem(CELEBRATION_KEY, JSON.stringify(this.receipt));
  }

  flush(): void { this.save(); }

  private save(debounce = false): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = undefined;
    if (debounce) { this.saveTimer = setTimeout(() => this.save(), 250); return; }
    const stored = { ...this.state, unlockAll: false };
    this.storage.setItem(ALEX_STATE_KEY, JSON.stringify(stored));
  }

  private log(type: string, extra?: Record<string, unknown>): void {
    this.state.events.push({
      t: Date.now(),
      type,
      page: this.config.pages[this.state.page]?.id,
      screen: this.state.screen,
      data: extra,
    });
    if (this.state.events.length > 2000) this.state.events.splice(0, this.state.events.length - 2000);
  }

  private emit(): void {
    this.revision += 1;
    for (const listener of this.listeners) listener();
  }
}

export function createMemoryStorage(initial?: Record<string, string>): Storage {
  const data = { ...(initial ?? {}) };
  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      for (const key of Object.keys(data)) delete data[key];
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    key(index: number) {
      return Object.keys(data)[index] ?? null;
    },
    removeItem(key: string) {
      delete data[key];
    },
    setItem(key: string, value: string) {
      data[key] = String(value);
    },
  };
}
