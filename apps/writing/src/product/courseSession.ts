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
  type ApplyCheckResult,
  type Bilingual,
  type EngineApi,
  type LevelPath,
  type PathLevel,
  type PathUnit,
  type ScreenRef,
  type StepTag,
} from './loadAlexSource';

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
  built?: string[];
  miss?: number;
}

export interface ApplyRecord {
  tries: number;
  passed: boolean;
  movedOn?: boolean;
  result?: ApplyCheckResult | null;
}

export interface CheckQuestionResult {
  id: string;
  correct: boolean;
  writing: boolean;
  explanation?: string;
  zh?: string;
}

export interface CheckRecord {
  attempt: number;
  finished: boolean;
  passed: boolean;
  q: number;
  blankAsk?: boolean;
  view: number | null;
  history: {
    attempt: number;
    results: CheckQuestionResult[];
    score: number;
    total: number;
    passed: boolean;
  }[];
}

export interface AlexState {
  v: 4;
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
}

interface CelebrationReceipt {
  initialized: boolean;
  seenDone: Record<string, boolean>;
  celebrated: Record<string, boolean>;
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
    closed: boolean;
    options: {
      index: number;
      letter: string;
      text: string;
      selected: boolean;
      wrong: boolean;
      mark: 'idle' | 'selected' | 'correct' | 'wrong' | 'revealed' | 'dim';
      stateLabel: string;
    }[];
    hint: string;
  };
  tapword?: {
    words: {
      index: number;
      text: string;
      selected: boolean;
      wrong: boolean;
      mark: 'idle' | 'selected' | 'correct' | 'wrong' | 'revealed';
      stateLabel: string;
    }[];
  };
  build?: {
    line: string;
    closed: boolean;
    revealed?: string;
    cards: { text: string; used: boolean; pulse: boolean; shake: boolean }[];
  };
  frame?: {
    value: string;
    frame: string;
    closed: boolean;
    revealed?: string;
  };
  writing?: {
    value: string;
    closed: boolean;
    prompt: string;
  };
  apply?: {
    value: string;
    tip: string;
    tries: number;
    passed: boolean;
    movedOn: boolean;
    canMoveOn: boolean;
    feedback: string;
    also?: string;
    glow?: string;
    checks: { label: string; met: boolean }[];
  };
  check?: {
    stage: 'answering' | 'results' | 'graded';
    questionIndex: number;
    questionCount: number;
    note: string;
    dots: { index: number; answered: boolean; current: boolean }[];
    blankWarning?: string;
    canRetry: boolean;
    scoreLine?: string;
    passed?: boolean;
    rows?: { index: number; ask: string; correct: boolean; why: string }[];
  };
  lessonOutcome?: 'passed' | 'not-mastered' | null;
  englishLine?: string;
  chineseLine?: string;
  unsupportedReason?: string;
  skip: SkipOffer | null;
  hints: string[];
  hintAction: 'hint' | 'another' | 'reveal' | null;
  coach: string[];
  coachMore: boolean;
  feedback: string;
}

export interface FooterModel {
  backLabel: string;
  primaryLabel: string;
  primaryTestId: string;
}

export interface TopBarModel {
  lessonNumber: string;
  lessonTitle: string;
  tags: string[];
  tasks: { id: string; label: string; status: TaskChipStatus; number: number; revealed?: boolean }[];
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
  return { initialized: false, seenDone: {}, celebrated: {} };
}

function regionText(segs: { t: string; s?: string }[] | undefined): string {
  const parts = segs ?? [];
  if (!parts.some((segment) => segment.s === 'set')) return parts.map((segment) => segment.t).join('');
  return parts.reduce((line, segment) => {
    if (!line) return segment.t;
    return /^[.,!?]/.test(segment.t) ? `${line}${segment.t}` : `${line} ${segment.t}`;
  }, '');
}

function writingGuard(text: string): 'short' | 'cjk' | null {
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  if (cjk / Math.max(1, cjk + latin) > 0.3) return 'cjk';
  const words = text.match(/[A-Za-z0-9]+(?:['’][A-Za-z]+)?/g) || [];
  if (words.length < 3) return 'short';
  return null;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const copy = items.slice();
  let state = 0;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) >>> 0;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (state * 1103515245 + 12345) >>> 0;
    const swap = state % (index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
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
  private readonly listeners = new Set<() => void>();
  private revision = 0;
  private yesCount = 0;
  private coachBeat: Record<string, number> = {};
  private buildShake = '';
  private receipt: CelebrationReceipt;

  state: AlexState;
  view: CourseView = 'path';
  levelId: string;
  message = '';
  feedback = '';
  celebration: CelebrationEvent | null = null;
  openNotice = '';
  returnFocus: { unitId: string; number: number } | null = null;
  /** UI receipt only. Not part of Alex course state. */
  private returnTo: { unitId: string; number: number } | null = null;

  constructor(options: CourseSessionOptions) {
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
    level.units.forEach((unit, unitIndex) => {
      const states = live ? this.lessonStates(unit) : unit.lessons.map(() => 'view' as const);
      const doneCount = states.filter((state) => state === 'done' || state === 'skipped').length;
      nodes.push({
        kind: 'unit',
        id: unit.id,
        unit: {
          id: unit.id,
          index: unitIndex + 1,
          typeLabel: this.unitTypeLabel(unit),
          title: this.shortTitle(unit.title),
          meta: live
            ? this.zh
              ? `${doneCount} / ${unit.lessons.length} 课 · 约 ${unit.min ?? ''} 分钟`
              : `${doneCount} of ${unit.lessons.length} lessons · about ${unit.min ?? ''} min`
            : this.zh
              ? `${unit.lessons.length} 课 · 约 ${unit.min ?? ''} 分钟`
              : `${unit.lessons.length} lessons · about ${unit.min ?? ''} min`,
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
          completed: this.unitMilestoneDone(unit, live),
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
      if (courseState === 'locked') {
        this.message = this.lockWhy(unit, lessonNumber);
        this.returnFocus = { unitId, number: lessonNumber };
        this.view = 'path';
        this.emit();
        return false;
      }
      const unfinished = indexes.find(
        (index) => !this.screenDone(index) && !this.stepSkipped(this.screens[index].step),
      );
      let target =
        courseState === 'done' || courseState === 'skipped'
          ? indexes[0]
          : lessonIndex === this.curLesson() && this.canOpen(this.state.screen)
            ? this.state.screen
            : (unfinished ?? indexes[0]);
      if (!this.canOpen(target)) target = indexes[0];
      this.remember(unitId, lessonNumber);
      if (this.state.stoppedAt) {
        this.state.stoppedAt = null;
        this.openNotice = this.zh ? '欢迎回来。上次的进度还在这台设备上。' : 'Welcome back. Your work is still saved on this device.';
      }
      this.view = 'lesson';
      this.feedback = '';
      this.message = '';
      this.go(target);
      return true;
    }
    const courseState = this.lessonStates(unit)[lessonNumber - 1];
    if (courseState === 'locked' || courseState === 'view') {
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
    this.feedback = '';
    this.message = '';
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
    if (!unit || !level.current || !this.unitMilestoneDone(unit, true)) return;
    this.celebration = { unitId, title: this.shortTitle(unit.title), replay: true };
    this.emit();
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
        const taskState = ref.screen.task ? this.state.tasks[`${ref.screen.page}:${ref.screen.task}`] : undefined;
        return {
          id: ref.screen.id,
          label: this.text(ref.screen.title) || ref.screen.id,
          status,
          number: localIndex + 1,
          revealed: taskState?.status === 'shown',
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
      this.feedback = this.lockedMsg(this.firstOpen());
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
      feedback: this.feedback,
      ...this.localeLines(screen.title),
    };

    if (screen.kind === 'learn' && screen.template === 'P2') {
      const skill = page?.skill ? this.engine.skillById(this.config, page.skill) : null;
      const practiceCount = page?.tasks?.length ?? 0;
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
          nextUp: this.zh
            ? `接下来：${practiceCount} 个短练习，然后自己写，再做检查。`
            : `Next: ${practiceCount} short practices, then you try it in your own writing, then a check.`,
        },
      };
    }

    if ((screen.kind === 'task' || screen.kind === 'model_task') && screen.task) {
      const task = this.task(screen.task);
      const key = this.taskKey(screen);
      const taskState = this.taskState(key);
      const hints = (task.coach?.hints ?? []).slice(0, taskState.hintLv ?? 0).map((hint) => this.text(hint));
      const hintAction = this.hintAction(task, taskState);
      if (task.type === 'pick' && task.lines && task.answers) {
        return { ...base, supported: true, ask: this.text(task.ask), ...this.localeLines(task.ask), hints, hintAction, pick: this.pickModel(task, taskState) };
      }
      if (task.type === 'tapword' && task.text && task.need !== 'all') {
        return { ...base, supported: true, ask: this.text(task.ask), ...this.localeLines(task.ask), hints, hintAction, tapword: this.tapModel(task, taskState) };
      }
      if (task.type === 'build' && task.target?.length) {
        return { ...base, supported: true, ask: this.text(task.ask), ...this.localeLines(task.ask), hints, hintAction, build: this.buildModel(task, taskState) };
      }
      if (task.frameFill || (task.type === 'write' && task.start && !task.apply)) {
        const value = this.engine.stripPictures(regionText(this.state.regions[key]));
        return {
          ...base,
          supported: true,
          ask: this.text(task.ask),
          ...this.localeLines(task.ask),
          hints,
          hintAction,
          frame: {
            value: value || task.start || task.frameFill?.frame || '',
            frame: task.frameFill?.frame || task.start || '',
            closed: taskState.status !== 'open',
            revealed: taskState.status === 'shown' ? this.text(task.why) : undefined,
          },
        };
      }
    }

    if (screen.kind === 'apply') {
      const page = this.pageOf(screen.page);
      const task = page?.task ? this.task(page.task) : null;
      const skill = page?.skill ?? '';
      const record = this.applyRecord(skill);
      const value = this.engine.stripPictures(regionText(this.state.regions[screen.page]));
      const result = record.result;
      const missed = result?.checks?.filter((item) => !item.met) ?? [];
      return {
        ...base,
        supported: true,
        ask: this.text(task?.ask ?? screen.title),
        ...this.localeLines(task?.ask ?? screen.title),
        hints: (task?.coach?.hints ?? []).slice(0, this.taskState(`${screen.page}:hint`).hintLv ?? 0).map((hint) => this.text(hint)),
        hintAction: task ? this.hintAction(task, { ...this.taskState(`${screen.page}:hint`), status: this.state.done[screen.page] ? 'done' : 'open' }) : null,
        apply: {
          value,
          tip: this.text(task?.tip),
          tries: record.tries,
          passed: !!record.passed,
          movedOn: !!record.movedOn,
          canMoveOn: !record.passed && !this.state.done[screen.page] && record.tries >= (task?.continue_after ?? 2),
          feedback: result?.safety_flag
            ? this.zh
              ? '请把这段给老师看。'
              : 'Please show your teacher.'
            : result
              ? this.zh
                ? result.zh || result.feedback
                : result.feedback
              : '',
          also: !result?.passed && missed[1] ? (this.zh ? missed[1].zh || missed[1].tip || missed[1].label : `Also: ${missed[1].tip || missed[1].label}`) : undefined,
          glow: result?.glow || undefined,
          checks: (result?.checks ?? []).map((item) => ({ label: item.label, met: item.met })),
        },
      };
    }

    if (screen.kind === 'check') {
      const page = this.pageOf(screen.page);
      if (page?.pool && page.writing) return { ...base, ...this.checkModel(page), supported: true };
    }

    return {
      ...base,
      supported: false,
      ask: screen.task ? this.text(this.task(screen.task).ask) : this.text(screen.title),
      unsupportedReason: this.zh
        ? `这一屏是 ${screen.template} / ${screen.kind}。垂直切片还没有接上这个模板，所以这里不能把它标成完成。`
        : `This screen is ${screen.template} / ${screen.kind}. The vertical slice does not run this template yet, so it cannot be marked done here.`,
    };
  }

  footer(): FooterModel {
    if (this.view === 'lessonEnd') {
      return {
        backLabel: this.zh ? '返回' : 'Back',
        primaryLabel: this.zh ? '继续学' : 'Keep going',
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
    const screen = this.screens[index].screen;
    const backLabel =
      index === 0 ? (this.zh ? '我的路径' : 'My path') : this.zh ? '上一页' : 'Back';
    if (screen.kind === 'check') {
      const page = this.pageOf(screen.page);
      if (page) return this.checkFooter(page, backLabel);
    }
    if (!this.canNext(index)) {
      return {
        backLabel,
        primaryLabel: this.blockedLabel(index),
        primaryTestId: screen.kind === 'apply' ? 'check-writing' : 'check',
      };
    }
    return {
      backLabel,
      primaryLabel: this.nextLabel(index),
      primaryTestId: 'next',
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
      const page = this.pageOf(screen.page);
      const record = page ? this.checkState(page.id) : null;
      if (record?.finished && record.view != null) {
        record.view = null;
        this.save();
        this.emit();
        return;
      }
      if (record && !record.finished && record.q > 0) {
        record.q -= 1;
        record.blankAsk = false;
        this.save();
        this.emit();
        return;
      }
    }
    if (this.state.screen === 0) {
      this.backToPath();
      return;
    }
    this.go(this.state.screen - 1, true);
  }

  pressPrimary(): void {
    if (this.view === 'preview') {
      this.backToPath();
      return;
    }
    if (this.view === 'lessonEnd') {
      this.go(this.nextTarget(this.state.screen));
      return;
    }
    const index = this.state.screen;
    const screen = this.screens[index].screen;
    if (screen.kind === 'check') {
      const page = this.pageOf(screen.page);
      if (page) {
        this.pressCheckPrimary(page);
        return;
      }
    }
    if (!this.canNext(index)) {
      if (screen.kind === 'apply') {
        this.applyCheck();
        return;
      }
      if (screen.kind === 'task' || screen.kind === 'model_task') {
        const task = screen.task ? this.task(screen.task) : null;
        if (task?.type === 'pick') this.pickCheck(task, this.taskKey(screen));
        else if (task?.type === 'tapword' && task.need !== 'all') this.wordCheck(task, this.taskKey(screen));
        else if (task?.frameFill || task?.type === 'write') this.frameCheck(task, this.taskKey(screen));
        else if (task?.type === 'build') {
          this.feedback = this.zh ? '用词卡把句子拼完整。点错的卡片不会算一次检查。' : 'Build the whole sentence with the cards. A wrong card is not a check.';
          this.emit();
        } else {
          this.feedback = `${this.lockedMsg(index)} ${this.activity()?.unsupportedReason ?? ''}`.trim();
          this.emit();
        }
        return;
      }
      this.feedback = this.lockedMsg(index);
      this.emit();
      return;
    }
    this.next();
  }

  pick(index: number): void {
    const active = this.activeItem();
    if (!active || active.task.type !== 'pick') return;
    const task = active.task;
    const taskState = this.taskState(active.key);
    if (!active.inCheck && taskState.status !== 'open') return;
    if (active.inCheck && this.checkLocked()) return;
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
    this.save();
    this.emit();
  }

  tapWord(index: number): void {
    const active = this.activeItem();
    if (!active || active.task.type !== 'tapword' || active.task.need === 'all') return;
    const taskState = this.taskState(active.key);
    if (!active.inCheck && taskState.status !== 'open') return;
    if (active.inCheck && this.checkLocked()) return;
    taskState.sel = taskState.sel === index ? null : index;
    taskState.bad = null;
    this.save();
    this.emit();
  }

  openHint(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return;
    if (screen.kind === 'apply') {
      const page = this.pageOf(screen.page);
      const task = page?.task ? this.task(page.task) : null;
      if (!task || this.state.done[screen.page]) return;
      const taskState = this.taskState(`${screen.page}:hint`);
      const hints = task.coach?.hints ?? [];
      const level = taskState.hintLv ?? 0;
      if (level < hints.length) {
        taskState.hintLv = level + 1;
        this.log('hint_open', { task: task.id });
        this.save();
        this.emit();
      }
      return;
    }
    if (!screen.task || screen.kind === 'check') return;
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
    this.finish(task, this.taskKey(screen), 'shown');
  }

  placeCard(text: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.task) return;
    const task = this.task(screen.task);
    if (task.type !== 'build' || !task.target) return;
    const taskState = this.taskState(this.taskKey(screen));
    if (taskState.status !== 'open') return;
    taskState.built = taskState.built ?? [];
    if (task.in_order !== false) {
      const want = task.target[taskState.built.length];
      if (text !== want) {
        taskState.miss = (taskState.miss ?? 0) + 1;
        this.buildShake = text;
        this.log('set_miss', { task: task.id });
        if (taskState.miss >= 3) this.feedback = this.text(task.why);
        this.save();
        this.emit();
        return;
      }
    }
    taskState.built.push(text);
    taskState.miss = 0;
    this.buildShake = '';
    this.feedback = '';
    const line = this.buildLine(taskState.built);
    this.state.regions[this.taskKey(screen)] = taskState.built.map((word) => ({ t: word, s: 'set' }));
    if (taskState.built.length === task.target.length) {
      const ok = this.engine.sameText(line, task.answer_text ?? '') || JSON.stringify(taskState.built) === JSON.stringify(task.target);
      taskState.tries += 1;
      if (ok) {
        this.finish(task, this.taskKey(screen), 'done');
        return;
      }
      if (taskState.tries >= 2) {
        this.finish(task, this.taskKey(screen), 'shown');
        return;
      }
      this.feedback = this.text(task.why) || (this.zh ? '还不太对。读出声来，通顺吗？' : 'Not quite. Read it out loud. Does it make sense?');
      this.save();
      this.emit();
      window.setTimeout(() => {
        if (taskState.status !== 'open') return;
        taskState.built = [];
        this.state.regions[this.taskKey(screen)] = [];
        this.save();
        this.emit();
      }, 1200);
      return;
    }
    this.save();
    this.emit();
  }

  resetBuild(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.task) return;
    const taskState = this.taskState(this.taskKey(screen));
    if (taskState.status !== 'open') return;
    taskState.built = [];
    taskState.miss = 0;
    this.buildShake = '';
    this.state.regions[this.taskKey(screen)] = [];
    this.save();
    this.emit();
  }

  setDraft(value: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return;
    if (screen.kind === 'apply') {
      if (this.state.done[screen.page]) return;
      this.state.regions[screen.page] = [{ t: value, s: 'typed' }];
      this.save();
      this.emit();
      return;
    }
    if (screen.kind === 'check') {
      const active = this.activeItem();
      if (!active || this.checkLocked()) return;
      this.state.regions[active.key] = [{ t: value, s: 'typed' }];
      this.save();
      this.emit();
      return;
    }
    if (!screen.task) return;
    const taskState = this.taskState(this.taskKey(screen));
    if (taskState.status !== 'open') return;
    this.state.regions[this.taskKey(screen)] = [{ t: value, s: 'typed' }];
    this.save();
    this.emit();
  }

  moveOnApply(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (screen?.kind !== 'apply') return;
    const page = this.pageOf(screen.page);
    const task = page?.task ? this.task(page.task) : null;
    const record = this.applyRecord(page?.skill ?? '');
    if (record.passed || this.state.done[screen.page]) return;
    if (record.tries < (task?.continue_after ?? 2)) return;
    record.movedOn = true;
    this.state.done[screen.page] = true;
    this.feedback = this.zh ? '先继续。这次写作还没有通过。' : 'Moving on for now. This writing did not pass.';
    this.log('apply_move_on');
    this.save();
    this.emit();
  }

  gotoQuestion(index: number): void {
    const page = this.currentCheckPage();
    if (!page) return;
    const record = this.checkState(page.id);
    if (record.finished) return;
    const count = this.engine.masteryItems(page, record.attempt).length;
    if (index < 0 || index >= count) return;
    record.q = index;
    this.save();
    this.emit();
  }

  openResult(index: number): void {
    const page = this.currentCheckPage();
    if (!page) return;
    const record = this.checkState(page.id);
    if (!record.finished || !record.history.length) return;
    record.view = index;
    this.save();
    this.emit();
  }

  closeResults(): void {
    const page = this.currentCheckPage();
    if (!page) return;
    const record = this.checkState(page.id);
    record.view = null;
    this.save();
    this.emit();
  }

  retryCheck(): void {
    const page = this.currentCheckPage();
    if (!page) return;
    const record = this.checkState(page.id);
    if (!record.finished || record.passed) return;
    record.attempt += 1;
    record.finished = false;
    record.q = 0;
    record.view = null;
    record.blankAsk = false;
    this.log('check_retry');
    this.save();
    this.emit();
  }

  backToPathFromBreak(): void {
    if (this.view !== 'lessonEnd') return;
    this.state.screen = this.nextTarget(this.state.screen);
    this.state.page = this.pageIndex(this.screens[this.state.screen]?.screen.page ?? '');
    this.view = 'path';
    this.log('back_to_path');
    this.save();
    this.emit();
  }

  stopForToday(): void {
    if (this.view !== 'lessonEnd') return;
    this.state.screen = this.nextTarget(this.state.screen);
    this.state.page = this.pageIndex(this.screens[this.state.screen]?.screen.page ?? '');
    this.state.stoppedAt = Date.now();
    this.view = 'path';
    this.openNotice = this.zh ? '今天的进度已保存在这台设备上。' : 'Today’s work is saved on this device.';
    this.log('stop_for_today');
    this.save();
    this.emit();
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

  private localeLines(value?: Bilingual | string | null): { englishLine?: string; chineseLine?: string } {
    if (!value || typeof value === 'string' || !this.zh || !value.en || !value.zh) return {};
    return { englishLine: value.en, chineseLine: value.zh };
  }

  private activeItem(): { task: AlexTask; key: string; inCheck: boolean } | null {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return null;
    if (screen.kind === 'check') {
      const page = this.pageOf(screen.page);
      if (!page?.pool || !page.writing) return null;
      const record = this.checkState(page.id);
      const last = record.history[record.history.length - 1];
      if (record.finished && (record.view == null || !last)) return null;
      const attempt = record.finished && last ? last.attempt : record.attempt;
      const ids = this.engine.masteryItems(page, attempt);
      const index = record.finished && record.view != null ? record.view : Math.min(record.q, ids.length - 1);
      const id = record.finished && last ? last.results[index]?.id : ids[index];
      if (!id) return null;
      return { task: this.task(id), key: `${page.id}:a${attempt}:${id}`, inCheck: true };
    }
    if (!screen.task) return null;
    return { task: this.task(screen.task), key: this.taskKey(screen), inCheck: false };
  }

  private checkLocked(): boolean {
    const page = this.currentCheckPage();
    return !!page && this.checkState(page.id).finished;
  }

  private currentCheckPage(): AlexPage | null {
    const screen = this.screens[this.state.screen]?.screen;
    if (screen?.kind !== 'check') return null;
    return this.pageOf(screen.page);
  }

  private checkState(pageId: string): CheckRecord {
    const existing = this.state.checks[pageId];
    if (!existing || typeof existing.attempt !== 'number' || !Array.isArray(existing.history)) {
      const next: CheckRecord = {
        attempt: existing?.attempt ?? 0,
        finished: !!existing?.finished,
        passed: !!existing?.passed,
        q: existing?.q ?? 0,
        blankAsk: !!existing?.blankAsk,
        view: existing?.view ?? null,
        history: existing?.history ?? [],
      };
      this.state.checks[pageId] = next;
      return next;
    }
    return existing;
  }

  private applyRecord(skill: string): ApplyRecord {
    return this.state.applies[skill] ?? (this.state.applies[skill] = { tries: 0, passed: false, result: null });
  }

  private pickModel(task: AlexTask, taskState: TaskProgress, mode: 'practice' | 'answering' | 'graded' = 'practice') {
    const picked = taskState.picked ?? [];
    const answers = task.answers ?? [];
    const closed = mode === 'graded' || (mode === 'practice' && taskState.status !== 'open');
    const shown = mode === 'practice' && taskState.status === 'shown';
    return {
      multi: !!task.multi,
      closed,
      hint: task.multi
        ? this.zh
          ? `选择 ${answers.length} 项 · 已选 ${picked.length}`
          : `Choose ${answers.length} · ${picked.length} chosen`
        : '',
      options: (task.lines ?? []).map((line, index) => {
        const selected = picked.includes(index);
        const right = answers.includes(index);
        let mark: 'idle' | 'selected' | 'correct' | 'wrong' | 'revealed' | 'dim' = selected ? 'selected' : 'idle';
        let stateLabel = '';
        if (closed) {
          if (shown || mode === 'graded') {
            if (right) {
              mark = 'revealed';
              stateLabel = this.zh ? '正确答案' : 'Right answer';
            } else if (selected || (taskState.wrong ?? []).includes(index)) {
              mark = 'wrong';
              stateLabel = this.zh ? '不对' : 'Not this one';
            } else {
              mark = 'dim';
              stateLabel = '';
            }
          } else if (selected && right) {
            mark = 'correct';
            stateLabel = this.zh ? '你的答案 · 正确' : 'Your answer · right';
          } else if (!selected) {
            mark = 'dim';
          }
        } else if ((taskState.wrong ?? []).includes(index)) {
          mark = 'wrong';
          stateLabel = this.zh ? '再看这一项' : 'Look again';
        }
        return {
          index,
          letter: this.engine.choiceLetter(index),
          text: line,
          selected,
          wrong: mark === 'wrong',
          mark,
          stateLabel,
        };
      }),
    };
  }

  private tapModel(task: AlexTask, taskState: TaskProgress, mode: 'practice' | 'answering' | 'graded' = 'practice') {
    const targets = new Set((task.targets ?? []).map((target) => this.engine.locate(task.text ?? '', target)));
    const closed = mode === 'graded' || (mode === 'practice' && taskState.status !== 'open');
    const shown = mode === 'practice' && taskState.status === 'shown';
    return {
      words: this.engine.tokens(task.text ?? '').map((token, index) => {
        const right = targets.has(index);
        let mark: 'idle' | 'selected' | 'correct' | 'wrong' | 'revealed' = 'idle';
        let stateLabel = '';
        if (!closed && taskState.sel === index) mark = 'selected';
        if (!closed && taskState.bad === index) {
          mark = 'wrong';
          stateLabel = this.zh ? '再试一次' : 'Try again';
        }
        if (closed && (shown || mode === 'graded') && right) {
          mark = 'revealed';
          stateLabel = this.zh ? '正确答案' : 'Right answer';
        } else if (closed && mode === 'practice' && taskState.status === 'done' && taskState.sel === index && right) {
          mark = 'correct';
          stateLabel = this.zh ? '你的答案 · 正确' : 'Your answer · right';
        } else if (closed && taskState.bad === index && !right) {
          mark = 'wrong';
          stateLabel = this.zh ? '不对' : 'Not this one';
        }
        return { index, text: token.w, selected: mark === 'selected', wrong: mark === 'wrong', mark, stateLabel };
      }),
    };
  }

  private buildModel(task: AlexTask, taskState: TaskProgress) {
    const built = taskState.built ?? [];
    const pool = seededShuffle([...(task.cells ?? []), ...(task.distractors ?? [])], task.id);
    const used = built.slice();
    const next = task.target?.[built.length];
    return {
      line: this.buildLine(built),
      closed: taskState.status !== 'open',
      revealed: taskState.status === 'shown' ? task.answer_text : undefined,
      cards: pool.map((text) => {
        const at = used.indexOf(text);
        const consumed = at >= 0;
        if (consumed) used.splice(at, 1);
        return {
          text,
          used: consumed,
          pulse: !consumed && (taskState.miss ?? 0) >= 3 && text === next,
          shake: text === this.buildShake,
        };
      }),
    };
  }

  private buildLine(words: string[]): string {
    return words.reduce((line, word) => {
      if (!line) return word;
      return /^[.,!?]/.test(word) ? `${line}${word}` : `${line} ${word}`;
    }, '');
  }

  private checkModel(page: AlexPage): Partial<ActivityModel> {
    const record = this.checkState(page.id);
    const ids = this.engine.masteryItems(page, record.attempt);
    const last = record.history[record.history.length - 1];
    const dots = ids.map((id, index) => ({
      index,
      answered: this.questionAnswered(this.task(id), `${page.id}:a${record.attempt}:${id}`),
      current: index === Math.min(record.q, ids.length - 1),
    }));
    if (!record.finished) {
      const index = Math.min(record.q, ids.length - 1);
      const task = this.task(ids[index]);
      const key = `${page.id}:a${record.attempt}:${ids[index]}`;
      const taskState = this.taskState(key);
      const blank = record.blankAsk ? this.blankWarning(page, record) : undefined;
      return {
        ask: this.text(task.ask),
        ...this.localeLines(task.ask),
        pick: task.type === 'pick' ? this.pickModel(task, taskState, 'answering') : undefined,
        tapword: task.type === 'tapword' ? this.tapModel(task, taskState, 'answering') : undefined,
        writing: task.type === 'write' || task.rules ? { value: regionText(this.state.regions[key]), closed: false, prompt: this.text(task.ask) } : undefined,
        check: {
          stage: 'answering',
          questionIndex: index,
          questionCount: ids.length,
          note: this.zh ? '这次没有词格，也没有提示。' : 'No grid and no help this time.',
          dots,
          blankWarning: blank,
          canRetry: false,
        },
      };
    }
    if (record.view != null && last) {
      const row = last.results[record.view];
      const task = this.task(row.id);
      const key = `${page.id}:a${last.attempt}:${row.id}`;
      const taskState = this.taskState(key);
      return {
        ask: this.text(task.ask),
        ...this.localeLines(task.ask),
        feedback: this.zh ? (row.zh || row.explanation || '') : (row.explanation || ''),
        pick: task.type === 'pick' ? this.pickModel(task, taskState, 'graded') : undefined,
        tapword: task.type === 'tapword' ? this.tapModel(task, taskState, 'graded') : undefined,
        writing: task.type === 'write' || task.rules ? { value: regionText(this.state.regions[key]), closed: true, prompt: this.text(task.ask) } : undefined,
        check: {
          stage: 'graded',
          questionIndex: record.view,
          questionCount: last.results.length,
          note: row.correct ? (this.zh ? '这题做对了。' : 'You got this one.') : this.zh ? '再看一遍。' : 'Look again.',
          dots: [],
          canRetry: false,
          passed: row.correct,
        },
      };
    }
    return {
      title: record.passed ? (this.zh ? '你通过了这次检查。' : 'You passed this check.') : this.zh ? '还没有掌握。' : 'Not yet.',
      check: {
        stage: 'results',
        questionIndex: 0,
        questionCount: last?.results.length ?? ids.length,
        note: last ? `${last.score} of ${last.total}.` : '',
        dots: [],
        canRetry: !record.passed,
        passed: record.passed,
        scoreLine: last ? (this.zh ? `${last.score} / ${last.total}` : `${last.score} of ${last.total}.`) : '',
        rows: (last?.results ?? []).map((row, index) => ({
          index,
          ask: this.text(this.task(row.id).ask),
          correct: row.correct,
          why: this.zh ? row.zh || row.explanation || '' : row.explanation || '',
        })),
      },
    };
  }

  private questionAnswered(task: AlexTask, key: string): boolean {
    const taskState = this.state.tasks[key];
    if (task.type === 'pick') return !!(taskState?.picked && taskState.picked.length);
    if (task.type === 'tapword') return taskState?.sel != null;
    const text = this.engine.stripPictures(regionText(this.state.regions[key])).trim();
    const printed = (task.text || task.start || task.given || '').trim();
    return !!text && text !== printed;
  }

  private blankWarning(page: AlexPage, record: CheckRecord): string {
    const ids = this.engine.masteryItems(page, record.attempt);
    const blank = ids
      .map((id, index) => (this.questionAnswered(this.task(id), `${page.id}:a${record.attempt}:${id}`) ? -1 : index + 1))
      .filter((index) => index > 0);
    if (!blank.length) return '';
    return this.zh
      ? `还有题没做：${blank.join('、')}。可以回去试一试，也可以直接交。`
      : blank.length === 1
        ? `Question ${blank[0]} is still blank. You can go back and try, or hand it in as it is.`
        : `Questions ${blank.slice(0, -1).join(', ')} and ${blank[blank.length - 1]} are still blank. You can go back and try, or hand it in as it is.`;
  }

  private checkFooter(page: AlexPage, backLabel: string): FooterModel {
    const record = this.checkState(page.id);
    const count = this.engine.masteryItems(page, record.attempt).length;
    if (!record.finished) {
      const index = Math.min(record.q, count - 1);
      if (index < count - 1) {
        return { backLabel: this.zh ? '返回' : 'Back', primaryLabel: this.zh ? '下一题' : 'Next question', primaryTestId: 'next-question' };
      }
      return {
        backLabel: this.zh ? '返回' : 'Back',
        primaryLabel: record.blankAsk ? (this.zh ? '仍然交卷' : 'Hand in anyway') : this.zh ? '交上我的检查' : 'Hand in my check',
        primaryTestId: 'hand-in-check',
      };
    }
    if (record.view != null) {
      return { backLabel: this.zh ? '返回' : 'Back', primaryLabel: this.zh ? '全部结果' : 'All results', primaryTestId: 'all-results' };
    }
    if (!this.state.done[page.id]) {
      return { backLabel, primaryLabel: this.zh ? '再做一套' : 'Try a new set', primaryTestId: 'retry-check' };
    }
    return { backLabel, primaryLabel: this.nextLabel(this.state.screen), primaryTestId: 'next' };
  }

  private pressCheckPrimary(page: AlexPage): void {
    const record = this.checkState(page.id);
    if (!record.finished) {
      const count = this.engine.masteryItems(page, record.attempt).length;
      if (record.q < count - 1) {
        record.q += 1;
        this.save();
        this.emit();
        return;
      }
      this.tryHandIn(page);
      return;
    }
    if (record.view != null) {
      record.view = null;
      this.save();
      this.emit();
      return;
    }
    if (!this.state.done[page.id]) {
      this.retryCheck();
      return;
    }
    this.next();
  }

  private tryHandIn(page: AlexPage): void {
    const record = this.checkState(page.id);
    const ids = this.engine.masteryItems(page, record.attempt);
    const blank = ids.some((id) => !this.questionAnswered(this.task(id), `${page.id}:a${record.attempt}:${id}`));
    if (blank && !record.blankAsk) {
      record.blankAsk = true;
      this.feedback = this.blankWarning(page, record);
      this.log('check_blank_warn');
      this.save();
      this.emit();
      return;
    }
    record.blankAsk = false;
    this.handIn(page);
  }

  private handIn(page: AlexPage): void {
    const record = this.checkState(page.id);
    const ids = this.engine.masteryItems(page, record.attempt);
    const results = ids.map((id) => {
      const task = this.task(id);
      const key = `${page.id}:a${record.attempt}:${id}`;
      const grade = this.gradeQuestion(task, key);
      return { id, correct: !!grade.correct, writing: id === page.writing, explanation: grade.correct ? '' : grade.explanation, zh: grade.zh };
    });
    const mastery = this.engine.masteryPass(results);
    record.finished = true;
    record.passed = record.passed || mastery.passed;
    record.view = null;
    record.history.push({ attempt: record.attempt, results, score: mastery.score, total: mastery.total, passed: mastery.passed });
    if (mastery.passed || record.attempt >= 1) this.state.done[page.id] = true;
    if (!mastery.passed && page.skill) this.checkFailed(page.skill);
    this.feedback = mastery.passed
      ? this.zh
        ? `你通过了这次检查。${mastery.score} / ${mastery.total}`
        : `You passed this check. ${mastery.score} of ${mastery.total}.`
      : this.zh
        ? `还没有。${mastery.score} / ${mastery.total}`
        : `Not yet. ${mastery.score} of ${mastery.total}.`;
    this.log('check_done', { passed: mastery.passed, score: mastery.score });
    this.save();
    this.emit();
  }

  private gradeQuestion(task: AlexTask, key: string): { correct: boolean; explanation?: string; zh?: string } {
    const taskState = this.taskState(key);
    if (task.type === 'pick') return { correct: this.engine.choiceGrade(task, taskState.picked ?? []).correct };
    if (task.type === 'tapword') {
      const targets = (task.targets ?? []).map((target) => this.engine.locate(task.text ?? '', target));
      return { correct: taskState.sel != null && targets.includes(taskState.sel) };
    }
    const text = this.engine.stripPictures(regionText(this.state.regions[key])).trim();
    if (!text || text === (task.start || task.text || '').trim() || text.includes('___')) {
      return { correct: false, explanation: 'Fill in your answer first.', zh: '先写下答案。' };
    }
    if (task.accept?.some((accept) => this.engine.sameText(accept, text))) {
      return { correct: true, explanation: this.text(task.ok), zh: task.ok?.zh };
    }
    if (task.frameFill) return this.engine.frameFill(text, task.frameFill, task.ok);
    if (task.rules) {
      return this.analyzer.checkProduction({ check: task.rules, success: task.ok?.en, successZh: task.ok?.zh }, text);
    }
    return { correct: false, explanation: this.text(task.why), zh: task.why?.zh };
  }

  private frameCheck(task: AlexTask, key: string): void {
    const taskState = this.taskState(key);
    if (taskState.status !== 'open') return;
    const text = this.engine.stripPictures(regionText(this.state.regions[key])).trim();
    let grade: { correct: boolean; explanation?: string; zh?: string };
    if (!text || text.includes('___')) {
      grade = { correct: false, explanation: 'Fill each ___ first.', zh: '先把每个 ___ 填上。' };
    } else if (task.frameFill) grade = this.engine.frameFill(text, task.frameFill, task.ok);
    else if (task.rules) grade = this.analyzer.checkProduction({ check: task.rules, success: task.ok?.en, successZh: task.ok?.zh }, text);
    else if (task.accept?.some((accept) => this.engine.sameText(accept, text))) grade = { correct: true, explanation: this.text(task.ok), zh: task.ok?.zh };
    else grade = { correct: false, explanation: 'Not quite yet. Read it again slowly. What is missing?', zh: '还不太对。慢慢再读一遍，少了什么？' };
    taskState.tries += 1;
    if (grade.correct) {
      this.finish(task, key, 'done');
      return;
    }
    if (taskState.tries >= 2) {
      this.finish(task, key, 'shown');
      return;
    }
    this.feedback = this.zh ? grade.zh || grade.explanation || '再试一次。' : `${grade.explanation || 'Not yet.'} Try again.`;
    this.log('task_try');
    this.save();
    this.emit();
  }

  private applyCheck(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (screen?.kind !== 'apply' || this.state.done[screen.page]) return;
    const page = this.pageOf(screen.page);
    const skill = page?.skill ?? '';
    const text = this.engine.stripPictures(regionText(this.state.regions[screen.page])).trim();
    const guard = writingGuard(text);
    if (guard) {
      this.feedback = guard === 'cjk'
        ? this.zh ? '先用英文写句子，再检查。' : 'Write your sentences in English first, then check again.'
        : this.zh ? '先写一点，我再来读。' : 'Write a little first. Then I’ll read it.';
      this.log('apply_short');
      this.emit();
      return;
    }
    const result = this.analyzer.checkApply(skill, text);
    const record = this.applyRecord(skill);
    record.tries += 1;
    record.result = result;
    record.passed = !!result.passed && !result.safety_flag;
    if (result.safety_flag) {
      this.feedback = this.zh ? '请把这段给老师看。' : 'Please show your teacher.';
    } else if (record.passed) {
      this.state.done[screen.page] = true;
      this.feedback = this.zh ? result.zh || '对。你在自己的写作里用上了。' : result.feedback;
    } else {
      this.feedback = this.zh ? result.zh || result.feedback : result.feedback;
    }
    this.log('apply_check', { passed: record.passed });
    this.save();
    this.emit();
  }

  private lessonOutcome(): 'passed' | 'not-mastered' | null {
    const lessonIndex = this.screens[this.state.screen]?.li ?? 0;
    const check = this.liveIdx(lessonIndex)
      .map((index) => this.screens[index])
      .find((ref) => ref.screen.kind === 'check');
    if (!check) return null;
    const record = this.state.checks[check.screen.page];
    if (record?.passed) return 'passed';
    if (this.state.done[check.screen.page]) return 'not-mastered';
    return null;
  }

  private lessonEndActivity(): ActivityModel {
    const index = this.state.screen;
    const lessonIndex = this.screens[index]?.li ?? 0;
    const indexes = this.liveIdx(lessonIndex);
    const doneCount = indexes.filter((item) => this.screenDone(item)).length;
    const unit = this.playUnit();
    const current = unit.lessons[lessonIndex];
    const next = unit.lessons[lessonIndex + 1];
    const outcome = this.lessonOutcome();
    const passed = outcome === 'passed';
    return {
      supported: true,
      template: 'S1',
      kind: 'lesson_end',
      lessonOutcome: outcome,
      title: passed
        ? this.zh ? '你通过了这次检查。' : 'You passed this check.'
        : outcome === 'not-mastered'
          ? this.zh ? '这课做完了，但这次检查还没有掌握。' : 'You finished this lesson. This check is not mastered yet.'
          : this.zh ? '今天的课就到这里。' : 'That’s today’s lesson.',
      ask: '',
      skip: null,
      hints: [],
      hintAction: null,
      coach: [],
      coachMore: false,
      feedback: this.feedback,
      learn: {
        heading: `${this.lessonWord(current?.n ?? lessonIndex + 1)} · ${this.text(current?.title)}`,
        teach: this.zh
          ? `你完成了 ${doneCount} / ${indexes.length} 页。`
          : `You finished ${doneCount} of ${indexes.length} pages.`,
        nextUp: next
          ? this.zh
            ? `下次：${this.lessonWord(next.n)} ${this.text(next.title)}`
            : `Next time: ${this.lessonWord(next.n)}: ${this.text(next.title)}`
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
      this.emit();
      return;
    }
    this.go(this.nextTarget(index));
  }

  private go(index: number, back = false): boolean {
    if (index < 0 || index >= this.screens.length) return false;
    if (!back && !this.canOpen(index)) {
      this.feedback = this.lockedMsg(this.firstOpen());
      this.emit();
      return false;
    }
    this.state.screen = index;
    this.state.page = this.pageIndex(this.screens[index].screen.page);
    this.view = 'lesson';
    this.feedback = '';
    this.log('screen');
    this.save();
    this.emit();
    return true;
  }

  private pickCheck(task: AlexTask, key: string): void {
    const taskState = this.taskState(key);
    const picked = (taskState.picked ?? []).slice();
    if (!picked.length) {
      this.feedback = task.multi
        ? this.zh
          ? '先选出答案，我再和你一起检查。'
          : 'Choose your answers first. Then I’ll check them with you.'
        : this.zh
          ? '先选一个答案，我再和你一起检查。'
          : 'Choose an answer first. Then I’ll check it with you.';
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
    this.feedback = message;
    this.log('task_try');
    this.save();
    this.emit();
  }

  private wordCheck(task: AlexTask, key: string): void {
    const taskState = this.taskState(key);
    if (taskState.sel == null) {
      this.feedback = this.zh ? '先点句子里的一个词，我再检查。' : 'Tap a word in the sentence first. Then I’ll check it.';
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
    this.feedback = note
      ? this.zh
        ? `${note.zh ?? note.en ?? ''} 再试一次。`
        : `${note.en ?? ''} Which word tells what someone thinks? Try again.`
      : this.zh
        ? '你点的不是那个词。哪个词说明作者的想法？再试一次。'
        : 'The word you tapped isn’t the one. Which word tells what someone thinks? Try again.';
    this.save();
    this.emit();
  }

  private finish(task: AlexTask, key: string, status: 'done' | 'shown'): void {
    const taskState = this.taskState(key);
    taskState.status = status;
    const graded = this.gradedText(task, taskState, status === 'done');
    this.feedback =
      task.type === 'build' && status === 'shown'
        ? this.zh ? `答案在这里：${task.answer_text ?? ''}` : `Here it is: ${task.answer_text ?? ''}`
        : task.type === 'pick' || task.type === 'tapword'
          ? status === 'done' || status === 'shown'
            ? graded
            : graded
        : status === 'done'
          ? this.affirm(this.text(task.ok) || this.text(task.why))
          : task.accept?.[0]
            ? this.zh ? `一种写法：${task.accept[0]}` : `One way: ${task.accept[0]}`
            : this.zh
              ? `答案在这里。${this.text(task.why)}`
              : `Here is the answer. ${this.text(task.why)}`;
    this.markPageIfTasksDone(task);
    this.log('task_done');
    this.save();
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
    if (task.apply) return null;
    return 'reveal';
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
    const screen = this.screens[index].screen;
    if (screen.kind === 'apply') {
      const skill = this.pageOf(screen.page)?.skill ?? '';
      return this.applyRecord(skill).tries ? (this.zh ? '再检查一次' : 'Check again') : this.zh ? '检查我的写作' : 'Check my writing';
    }
    if (screen.task) {
      const task = this.task(screen.task);
      if (task.type === 'build') return this.zh ? '拼这个句子' : 'Build the sentence';
    }
    if (screen.kind === 'task' || screen.kind === 'model_task') return this.zh ? '检查' : 'Check';
    if (screen.kind === 'check') return this.zh ? '交卷' : 'Hand in';
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
    if (!level.current) return this.zh ? '之后打开' : 'Opens later';
    if (courseState === 'done') {
      return this.zh ? `完成 · ${lesson.pages ?? ''} 页` : `Done · ${lesson.pages ?? ''} pages`;
    }
    if (courseState === 'current') return this.zh ? '你在这里' : 'You are here';
    if (courseState === 'available') return this.zh ? '可以开始' : 'Ready to start';
    if (courseState === 'skipped') return this.zh ? '已掌握 · 跳过' : 'Mastered · skipped';
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
    if (!level.current) {
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
      };
    } catch {
      return freshReceipt();
    }
  }

  private writeReceipt(): void {
    this.storage.setItem(CELEBRATION_KEY, JSON.stringify(this.receipt));
  }

  private save(): void {
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
