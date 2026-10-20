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
  how?: string;
  credit?: number;
}

export type ChoiceVisual = 'default' | 'selected' | 'correct' | 'incorrect' | 'shown' | 'dim';

export interface ChoiceOptionModel {
  index: number;
  letter: string;
  text: string;
  selected: boolean;
  wrong: boolean;
  visual: ChoiceVisual;
  mark?: string;
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
  lessons?: Record<string, boolean>;
}

export interface CheckResultRow {
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
  history: {
    at: number;
    attempt: number;
    results: CheckResultRow[];
    score: number;
    total: number;
    passed: boolean;
  }[];
  q: number;
  view: number | null;
  blankAsk?: boolean;
}

export interface ApplyRecord {
  tries: number;
  passed: boolean;
  movedOn?: boolean;
  dirty?: boolean;
  result?: ApplyCheck;
  history?: { at: number; passed: boolean; source?: string }[];
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
  screenId: string;
  pick?: {
    multi: boolean;
    options: ChoiceOptionModel[];
    hint: string;
    closed: boolean;
  };
  tapword?: {
    words: { index: number; text: string; selected: boolean; wrong: boolean; correct: boolean }[];
    closed: boolean;
  };
  build?: {
    sentence: string;
    cells: { text: string; used: boolean; hint: boolean }[];
    status: 'open' | 'done' | 'shown';
    answer?: string;
  };
  write?: {
    value: string;
    label: string;
    status: 'open' | 'done' | 'shown';
    answer?: string;
    chunks: string[];
  };
  apply?: {
    value: string;
    tip: string;
    tries: number;
    passed: boolean;
    canMoveOn: boolean;
    checks: { label: string; met: boolean }[];
    glow: string;
    result: string;
  };
  assessment?: AssessmentModel;
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
  backTestId: string;
  primaryLabel: string;
  primaryTestId: string;
}

export interface AssessmentModel {
  stage: 'answering' | 'results' | 'review';
  index: number;
  total: number;
  note: string;
  dots: { index: number; answered: boolean; current: boolean }[];
  blankWarning?: string;
  pick?: ActivityModel['pick'];
  tapword?: ActivityModel['tapword'];
  write?: ActivityModel['write'];
  ask?: string;
  resultLine?: string;
  passed?: boolean;
  canRetry: boolean;
  rows?: { index: number; ask: string; why: string; correct: boolean }[];
  reviewStatus?: string;
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
  return { initialized: false, seenDone: {}, celebrated: {} };
}

function regionText(segs: { t: string }[] | undefined): string {
  return (segs ?? []).map((segment) => segment.t).join('');
}

function cellLabel(cell: string | { t: string }): string {
  return typeof cell === 'string' ? cell : cell.t;
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
  private receipt: CelebrationReceipt;

  state: AlexState;
  view: CourseView = 'path';
  levelId: string;
  message = '';
  feedback = '';
  celebration: CelebrationEvent | null = null;
  /** Presentation-only lesson complete burst. Not course progress. */
  lessonBurst = false;
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

  dismissLessonBurst(): void {
    const id = this.lessonReceiptId();
    this.receipt.lessons = { ...(this.receipt.lessons ?? {}), [id]: true };
    this.lessonBurst = false;
    this.writeReceipt();
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
      let target =
        lessonIndex === this.curLesson()
          ? this.state.screen
          : (indexes.find((index) => !this.screenDone(index) && !this.stepSkipped(this.screens[index].step)) ??
            indexes[0]);
      if (!this.canOpen(target)) target = indexes[0];
      this.remember(unitId, lessonNumber);
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
      screenId: screen.id,
      title: this.text(screen.title),
      ask: '',
      skip,
      hints: [] as string[],
      hintAction: null as ActivityModel['hintAction'],
      coach,
      coachMore: this.coachHasMore(screen),
      feedback: this.feedback,
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
        return {
          ...base,
          supported: true,
          ask: this.text(task.ask),
          hints,
          hintAction,
          pick: this.pickModel(task, taskState, false),
        };
      }
      if (task.type === 'tapword' && task.text && task.need !== 'all') {
        return {
          ...base,
          supported: true,
          ask: this.text(task.ask),
          hints,
          hintAction,
          tapword: this.tapModel(task, taskState, false),
        };
      }
      if (task.type === 'build' && task.target && task.cells) {
        const built = taskState.built ?? [];
        const sentence = regionText(this.state.regions[key]);
        const nextCell = (taskState.miss ?? 0) >= 3 ? task.target[built.length] : undefined;
        return {
          ...base,
          supported: true,
          ask: this.text(task.ask),
          hints,
          hintAction,
          build: {
            sentence,
            status: taskState.status,
            answer: taskState.status === 'shown' ? task.answer_text : undefined,
            cells: task.cells.map((cell) => {
              const text = cellLabel(cell);
              const used = built.filter((item) => item === text).length;
              const available = task.cells!.filter((item) => cellLabel(item) === text).length;
              return { text, used: used >= available, hint: text === nextCell && taskState.status === 'open' };
            }),
          },
        };
      }
      if (task.type === 'write' || task.type === 'edit') {
        return {
          ...base,
          supported: true,
          ask: this.text(task.ask),
          hints,
          hintAction,
          write: this.writeModel(task, key, taskState, false),
        };
      }
    }

    if (screen.kind === 'apply' && page?.task) {
      const task = this.task(page.task);
      const record = this.applyRecord(page.skill ?? '');
      const value = regionText(this.state.regions[page.id]);
      return {
        ...base,
        supported: true,
        ask: this.text(task.ask),
        hints: [],
        apply: {
          value,
          tip: this.text(task.tip),
          tries: record.tries,
          passed: record.passed,
          canMoveOn: !this.state.done[page.id] && !record.passed && record.tries >= (task.continue_after ?? 2),
          checks: (record.result?.checks ?? []).map((item) => ({ label: item.label, met: item.met })),
          glow: record.result?.safety_flag ? '' : record.result?.glow ?? '',
          result: this.applyFeedback(record),
        },
      };
    }

    if (screen.kind === 'check' && page) {
      return { ...base, supported: true, assessment: this.assessmentModel(page) };
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
        backTestId: 'back',
        primaryLabel: this.zh ? '继续' : 'Keep going',
        primaryTestId: 'keep-going',
      };
    }
    if (this.view === 'preview') {
      return {
        backLabel: this.zh ? '我的路径' : 'My path',
        backTestId: 'back',
        primaryLabel: this.zh ? '我的路径' : 'My path',
        primaryTestId: 'back-to-path',
      };
    }
    const index = this.state.screen;
    const screen = this.screens[index]?.screen;
    const backLabel = index === 0 ? (this.zh ? '我的路径' : 'My path') : this.zh ? '上一页' : 'Back';
    if (screen?.kind === 'check') {
      const page = this.pageOf(screen.page);
      if (page) return this.assessmentFooter(page, backLabel);
    }
    if (screen?.kind === 'apply' && !this.canNext(index)) {
      const page = this.pageOf(screen.page);
      const tries = page?.skill ? this.applyRecord(page.skill).tries : 0;
      return {
        backLabel,
        backTestId: 'back',
        primaryLabel: tries ? (this.zh ? '再检查一次' : 'Check again') : this.zh ? '检查我的写作' : 'Check my writing',
        primaryTestId: 'check-writing',
      };
    }
    if (!this.canNext(index)) {
      return {
        backLabel,
        backTestId: 'back',
        primaryLabel: this.blockedLabel(index),
        primaryTestId: 'check',
      };
    }
    return {
      backLabel,
      backTestId: 'back',
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
      this.lessonBurst = false;
      this.emit();
      return;
    }
    if (this.assessmentBack()) return;
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
    if (this.assessmentPrimary()) return;
    const index = this.state.screen;
    const screen = this.screens[index].screen;
    if (!this.canNext(index)) {
      if (screen.kind === 'task' || screen.kind === 'model_task') {
        const task = screen.task ? this.task(screen.task) : null;
        const key = this.taskKey(screen);
        if (task?.type === 'pick') this.pickCheck(task, key);
        else if (task?.type === 'tapword' && task.need !== 'all') this.wordCheck(task, key);
        else if (task?.type === 'write' || task?.type === 'edit') this.editCheck(task, key);
        else if (task?.type === 'build') {
          this.feedback = this.zh ? '先用下面的词卡把它拼出来。' : 'Build it with the word cards below first.';
          this.log('next_blocked');
          this.emit();
        } else {
          this.feedback = `${this.lockedMsg(index)} ${this.activity()?.unsupportedReason ?? ''}`.trim();
          this.emit();
        }
        return;
      }
      if (screen.kind === 'apply') {
        this.applyCheck();
        return;
      }
      this.feedback = this.lockedMsg(index);
      this.emit();
      return;
    }
    this.next();
  }

  pick(index: number): void {
    const screen = this.screens[this.state.screen]?.screen;
    const task = this.activePickTask(screen);
    if (!task || task.type !== 'pick') return;
    const key = this.activeTaskKey(screen, task.id);
    const taskState = this.taskState(key);
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
    this.save();
    this.emit();
  }

  tapWord(index: number): void {
    const screen = this.screens[this.state.screen]?.screen;
    const task = this.activePickTask(screen);
    if (!task || task.type !== 'tapword' || task.need === 'all') return;
    const taskState = this.taskState(this.activeTaskKey(screen, task.id));
    if (taskState.status !== 'open') return;
    taskState.sel = taskState.sel === index ? null : index;
    taskState.bad = null;
    this.save();
    this.emit();
  }

  buildCell(cellText: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.task) return;
    const task = this.task(screen.task);
    if (task.type !== 'build' || !task.target) return;
    const key = this.taskKey(screen);
    const taskState = this.taskState(key);
    if (taskState.status !== 'open') return;
    taskState.built = taskState.built ?? [];
    if (task.in_order) {
      const want = task.target[taskState.built.length];
      if (cellText !== want) {
        taskState.miss = (taskState.miss ?? 0) + 1;
        this.log('set_miss', { task: task.id, cell: cellText });
        if (taskState.miss === 3) this.feedback = this.text(task.why);
        this.save();
        this.emit();
        return;
      }
    }
    taskState.built.push(cellText);
    const current = regionText(this.state.regions[key]);
    const kind = /^[.,!?]/.test(cellText) ? 'mark' : 'phrase';
    const inserted = this.engine.smartInsert(current, current.length, current.length, cellText, kind);
    this.state.regions[key] = [{ t: inserted.value, s: 'set' }];
    if (taskState.built.length === task.target.length) {
      const ok =
        this.engine.sameText(inserted.value, task.answer_text ?? '') ||
        JSON.stringify(taskState.built) === JSON.stringify(task.target);
      taskState.tries += 1;
      if (ok) {
        this.finish(task, key, 'done');
        return;
      }
      if (taskState.tries >= 2) {
        this.finish(task, key, 'shown');
        return;
      }
      const order = this.config.coach?.diagnostics?.order;
      this.feedback = `${order ? `${this.text(order)} ` : ''}${this.text(task.why) || 'Not quite. Read it out loud. Does it make sense?'}`;
      taskState.built = [];
      this.state.regions[key] = [];
      this.log('task_try');
      this.save();
      this.emit();
      return;
    }
    this.save();
    this.emit();
  }

  resetBuild(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.task) return;
    const task = this.task(screen.task);
    const key = screen.kind === 'check' ? '' : this.taskKey(screen);
    if (!key || (task.type !== 'build' && task.type !== 'write' && task.type !== 'edit')) return;
    const taskState = this.taskState(key);
    if (taskState.status !== 'open') return;
    taskState.built = [];
    taskState.miss = 0;
    this.state.regions[key] = [];
    this.feedback = '';
    this.save();
    this.emit();
  }

  setWriting(value: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return;
    if (screen.kind === 'apply') {
      const page = this.pageOf(screen.page);
      if (!page || this.state.done[page.id]) return;
      this.state.regions[page.id] = value ? [{ t: value, s: 'typed' }] : [];
      const record = page.skill ? this.applyRecord(page.skill) : null;
      if (record?.result) record.dirty = true;
      this.save();
      this.emit();
      return;
    }
    if (screen.kind === 'check') {
      const page = this.pageOf(screen.page);
      if (!page) return;
      const check = this.ensureCheck(page.id);
      if (check.finished) return;
      const ids = this.engine.masteryItems(page, check.attempt);
      const id = ids[Math.min(check.q, ids.length - 1)];
      const task = this.task(id);
      if (task.type !== 'write' && task.type !== 'edit') return;
      const key = this.attemptKey(page, id);
      this.state.regions[key] = value ? [{ t: value, s: 'typed' }] : [];
      this.save();
      this.emit();
      return;
    }
    if (!screen.task) return;
    const task = this.task(screen.task);
    if (task.type !== 'write' && task.type !== 'edit') return;
    const key = this.taskKey(screen);
    if (this.taskState(key).status !== 'open') return;
    this.state.regions[key] = value ? [{ t: value, s: 'typed' }] : [];
    this.save();
    this.emit();
  }

  insertChunk(chunk: string): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.task) return;
    const task = this.task(screen.task);
    if (task.type !== 'write' && task.type !== 'edit') return;
    const key = this.taskKey(screen);
    if (this.taskState(key).status !== 'open') return;
    const current = regionText(this.state.regions[key]) || task.start || '';
    const next = current.includes('___') ? current.replace('___', chunk) : `${current} ${chunk}`.trim();
    this.state.regions[key] = [{ t: next, s: 'chunk' }];
    this.save();
    this.emit();
  }

  moveOnApply(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (screen?.kind !== 'apply') return;
    const page = this.pageOf(screen.page);
    if (!page?.task || !page.skill || this.state.done[page.id]) return;
    const task = this.task(page.task);
    const record = this.applyRecord(page.skill);
    if (record.passed || record.tries < (task.continue_after ?? 2)) return;
    record.movedOn = true;
    this.state.done[page.id] = true;
    this.log('apply_move_on', { skill: page.skill });
    this.save();
    this.emit();
  }

  gotoQuestion(index: number): void {
    const page = this.currentCheckPage();
    if (!page) return;
    const check = this.ensureCheck(page.id);
    if (check.finished) return;
    const total = this.engine.masteryItems(page, check.attempt).length;
    check.q = Math.max(0, Math.min(index, total - 1));
    check.blankAsk = false;
    this.save();
    this.emit();
  }

  openResult(index: number | null): void {
    const page = this.currentCheckPage();
    if (!page) return;
    const check = this.ensureCheck(page.id);
    if (!check.finished) return;
    check.view = index;
    this.save();
    this.emit();
  }

  retryAssessment(): void {
    const page = this.currentCheckPage();
    if (!page) return;
    const check = this.ensureCheck(page.id);
    if (!check.finished || check.passed) return;
    check.attempt += 1;
    check.finished = false;
    check.q = 0;
    check.view = null;
    check.blankAsk = false;
    this.log('check_retry', { page: page.id, attempt: check.attempt });
    this.save();
    this.emit();
  }

  openHint(): void {
    const screen = this.screens[this.state.screen]?.screen;
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
    this.finish(task, this.taskKey(screen), 'shown');
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

  private pickModel(task: AlexTask, taskState: TaskProgress, graded: boolean): NonNullable<ActivityModel['pick']> {
    const picked = taskState.picked ?? [];
    const wrong = taskState.wrong ?? [];
    const closed = taskState.status !== 'open';
    const answers = task.answers ?? [];
    return {
      multi: !!task.multi,
      closed: closed || graded,
      hint:
        task.multi && !graded
          ? this.zh
            ? `选择 ${answers.length} 项 · 已选 ${picked.length}`
            : `Choose ${answers.length} · ${picked.length} chosen`
          : '',
      options: (task.lines ?? []).map((line, index) => {
        const selected = picked.includes(index);
        const isAnswer = answers.includes(index);
        let visual: ChoiceVisual = 'default';
        let mark: string | undefined;
        if (graded) {
          if (isAnswer) {
            visual = 'correct';
            mark = selected ? (this.zh ? '你的答案 · 对' : 'Your answer · right') : this.zh ? '正确答案' : 'Right answer';
          } else if (selected) {
            visual = 'incorrect';
            mark = this.zh ? '你的答案' : 'Your answer';
          } else visual = 'dim';
        } else if (closed) {
          if (isAnswer) {
            visual = taskState.status === 'shown' ? 'shown' : 'correct';
            mark =
              taskState.status === 'shown' || !selected
                ? this.zh
                  ? '正确答案'
                  : 'Right answer'
                : this.zh
                  ? '你的答案 · 对'
                  : 'Your answer · right';
          } else if (selected || wrong.includes(index)) {
            visual = 'incorrect';
            mark = this.zh ? '你的答案' : 'Your answer';
          } else visual = 'dim';
        } else if (selected) visual = 'selected';
        else if (wrong.includes(index) && !task.multi) {
          visual = 'incorrect';
          mark = this.zh ? '你的答案' : 'Your answer';
        }
        return {
          index,
          letter: this.engine.choiceLetter(index),
          text: line,
          selected,
          wrong: visual === 'incorrect',
          visual,
          mark,
        };
      }),
    };
  }

  private tapModel(task: AlexTask, taskState: TaskProgress, graded: boolean): NonNullable<ActivityModel['tapword']> {
    const tokens = this.engine.tokens(task.text ?? '');
    const targets = (task.targets ?? []).map((target) => this.engine.locate(task.text ?? '', target));
    const closed = taskState.status !== 'open';
    return {
      closed: closed || graded,
      words: tokens.map((token, index) => ({
        index,
        text: token.w,
        selected: taskState.sel === index && !closed && !graded,
        wrong: (taskState.bad === index && !graded) || (graded && taskState.sel === index && !targets.includes(index)),
        correct: (closed || graded) && targets.includes(index),
      })),
    };
  }

  private writeModel(task: AlexTask, key: string, taskState: TaskProgress, graded: boolean): NonNullable<ActivityModel['write']> {
    const stored = regionText(this.state.regions[key]);
    const value = stored || (!graded && taskState.status === 'open' ? task.start || '' : stored);
    const shown = taskState.status === 'shown';
    return {
      value,
      label: this.text(task.ask),
      status: graded ? (taskState.status === 'open' ? 'done' : taskState.status) : taskState.status,
      answer: shown ? task.answer_text || task.accept?.[0] || this.text(task.why) : undefined,
      chunks: graded || taskState.status !== 'open' ? [] : (task.cells ?? []).map(cellLabel),
    };
  }

  private assessmentModel(page: AlexPage): AssessmentModel {
    const check = this.ensureCheck(page.id);
    const ids = this.engine.masteryItems(page, check.attempt);
    const total = ids.length;
    const index = Math.min(check.q || 0, Math.max(0, total - 1));
    const dots = ids.map((id, dot) => ({
      index: dot,
      current: dot === index,
      answered: this.questionAnswered(this.task(id), this.attemptKey(page, id)),
    }));
    const note = this.zh ? '这次没有词格，也没有提示。' : 'No grid and no help this time.';
    if (!check.finished) {
      const id = ids[index];
      const task = id ? this.task(id) : null;
      const key = id ? this.attemptKey(page, id) : '';
      const taskState = key ? this.taskState(key) : { tries: 0, status: 'open' as const };
      const blank = check.blankAsk ? this.blankWarning(page, check) : '';
      return {
        stage: 'answering',
        index,
        total,
        note,
        dots,
        blankWarning: blank || undefined,
        ask: task ? this.text(task.ask) : '',
        pick: task?.type === 'pick' ? this.pickModel(task, taskState, false) : undefined,
        tapword: task?.type === 'tapword' ? this.tapModel(task, taskState, false) : undefined,
        write: task && (task.type === 'write' || task.type === 'edit') ? this.writeModel(task, key, taskState, false) : undefined,
        canRetry: false,
      };
    }
    const last = check.history[check.history.length - 1];
    const passed = !!check.passed;
    if (check.view != null && last) {
      const row = last.results[check.view];
      const task = row ? this.task(row.id) : null;
      const key = row ? this.attemptKey(page, row.id) : '';
      const taskState = key ? this.taskState(key) : { tries: 0, status: 'open' as const };
      return {
        stage: 'review',
        index: check.view,
        total: last.results.length,
        note,
        dots,
        ask: task ? this.text(task.ask) : '',
        reviewStatus: row?.correct ? (this.zh ? '这题你做对了。' : 'You got this one.') : this.zh ? '再看一看。' : 'Look again.',
        pick: task?.type === 'pick' ? this.pickModel(task, taskState, true) : undefined,
        tapword: task?.type === 'tapword' ? this.tapModel(task, taskState, true) : undefined,
        write: task && (task.type === 'write' || task.type === 'edit') ? this.writeModel(task, key, taskState, true) : undefined,
        canRetry: false,
        passed,
      };
    }
    const retry = !passed && check.attempt < 2;
    const again = !passed && check.attempt >= 1;
    return {
      stage: 'results',
      index: 0,
      total,
      note,
      dots,
      passed,
      canRetry: !passed,
      resultLine: passed
        ? this.zh
          ? `你通过了这次小测。${last?.score ?? 0} / ${last?.total ?? 0}。`
          : `You passed this check. ${last?.score ?? 0} of ${last?.total ?? 0}.`
        : this.zh
          ? `还没通过。${last?.score ?? 0} / ${last?.total ?? 0}。${retry ? '准备好了可以换一组。' : again ? '我们会再一起练习。' : ''}`
          : `Not yet. ${last?.score ?? 0} of ${last?.total ?? 0}. ${check.attempt < 2 ? 'Try a new set when you’re ready.' : 'We’ll practise this again together.'}`,
      rows: (last?.results ?? []).map((row, rowIndex) => ({
        index: rowIndex,
        ask: this.text(this.task(row.id).ask),
        why: this.gradedText(this.task(row.id), this.taskState(this.attemptKey(page, row.id)), row.correct),
        correct: row.correct,
      })),
    };
  }

  private assessmentFooter(page: AlexPage, lessonBack: string): FooterModel {
    const check = this.ensureCheck(page.id);
    const total = this.engine.masteryItems(page, check.attempt).length;
    const index = Math.min(check.q || 0, Math.max(0, total - 1));
    if (!check.finished) {
      return {
        backLabel: index > 0 ? (this.zh ? '上一题' : 'Back') : lessonBack,
        backTestId: index > 0 ? 'prev-question' : 'back',
        primaryLabel:
          index < total - 1
            ? this.zh
              ? '下一题'
              : 'Next question'
            : check.blankAsk
              ? this.zh
                ? '仍然交卷'
                : 'Hand in anyway'
              : this.zh
                ? '交上我的小测'
                : 'Hand in my check',
        primaryTestId: index < total - 1 ? 'next-question' : 'hand-in-check',
      };
    }
    if (check.view != null) {
      return {
        backLabel: this.zh ? '全部结果' : 'Back',
        backTestId: 'all-results',
        primaryLabel: this.screenDone(this.state.screen) ? this.nextLabel(this.state.screen) : this.zh ? '换一组' : 'Try a new set',
        primaryTestId: this.screenDone(this.state.screen) ? 'next' : 'retry-check-foot',
      };
    }
    if (!this.screenDone(this.state.screen)) {
      return {
        backLabel: lessonBack,
        backTestId: 'back',
        primaryLabel: this.zh ? '换一组' : 'Try a new set',
        primaryTestId: 'retry-check-foot',
      };
    }
    return {
      backLabel: lessonBack,
      backTestId: 'back',
      primaryLabel: this.nextLabel(this.state.screen),
      primaryTestId: 'next',
    };
  }

  private assessmentBack(): boolean {
    const page = this.currentCheckPage();
    if (!page || this.view !== 'lesson') return false;
    const check = this.ensureCheck(page.id);
    if (!check.finished && (check.q || 0) > 0) {
      check.q -= 1;
      check.blankAsk = false;
      this.save();
      this.emit();
      return true;
    }
    if (check.finished && check.view != null) {
      check.view = null;
      this.save();
      this.emit();
      return true;
    }
    return false;
  }

  private assessmentPrimary(): boolean {
    const page = this.currentCheckPage();
    if (!page || this.view !== 'lesson') return false;
    const check = this.ensureCheck(page.id);
    const total = this.engine.masteryItems(page, check.attempt).length;
    if (!check.finished) {
      const index = Math.min(check.q || 0, total - 1);
      if (index < total - 1) {
        check.q = index + 1;
        this.save();
        this.emit();
        return true;
      }
      this.tryHandIn(page);
      return true;
    }
    if (!this.screenDone(this.state.screen)) {
      this.retryAssessment();
      return true;
    }
    return false;
  }

  private tryHandIn(page: AlexPage): void {
    const check = this.ensureCheck(page.id);
    const ids = this.engine.masteryItems(page, check.attempt);
    const blank = ids
      .map((id, index) => (this.questionAnswered(this.task(id), this.attemptKey(page, id)) ? -1 : index + 1))
      .filter((index) => index > 0);
    if (blank.length && !check.blankAsk) {
      check.blankAsk = true;
      this.feedback = this.blankWarning(page, check);
      this.log('check_blank_warn', { page: page.id, blank });
      this.save();
      this.emit();
      return;
    }
    check.blankAsk = false;
    this.handInCheck(page);
  }

  private handInCheck(page: AlexPage): void {
    const check = this.ensureCheck(page.id);
    const ids = this.engine.masteryItems(page, check.attempt);
    const results = ids.map((id) => {
      const task = this.task(id);
      const grade = this.gradeTask(task, this.attemptKey(page, id));
      return {
        id,
        correct: !!grade.correct,
        writing: id === page.writing,
        explanation: grade.correct ? '' : grade.explanation,
        zh: grade.zh,
      };
    });
    const mastery = this.engine.masteryPass(results);
    check.finished = true;
    check.passed = check.passed || mastery.passed;
    check.view = null;
    check.history.push({
      at: Date.now(),
      attempt: check.attempt,
      results,
      score: mastery.score,
      total: mastery.total,
      passed: mastery.passed,
    });
    this.log('check_done', { page: page.id, score: mastery.score, passed: mastery.passed });
    if (mastery.passed || check.attempt >= 1) this.state.done[page.id] = true;
    this.feedback = '';
    this.save();
    if (!mastery.passed && page.skill) this.checkFailed(page.skill);
    this.emit();
  }

  private blankWarning(page: AlexPage, check: CheckRecord): string {
    const ids = this.engine.masteryItems(page, check.attempt);
    const blank = ids
      .map((id, index) => (this.questionAnswered(this.task(id), this.attemptKey(page, id)) ? -1 : index + 1))
      .filter((index) => index > 0);
    if (!blank.length) return '';
    if (this.zh) return `还有题没做：${blank.join('、')}。可以回去试一试，也可以直接交。`;
    const list =
      blank.length === 1
        ? `Question ${blank[0]} is`
        : `Questions ${blank.slice(0, -1).join(', ')} and ${blank[blank.length - 1]} are`;
    return `${list} still blank. You can go back and try, or hand it in as it is.`;
  }

  private questionAnswered(task: AlexTask, key: string): boolean {
    const taskState = this.state.tasks[key] ?? { tries: 0, status: 'open' as const };
    if (task.type === 'pick') return (taskState.picked?.length ?? 0) > 0;
    if (task.type === 'tapword') return taskState.sel != null;
    const text = regionText(this.state.regions[key]).trim();
    return !!text && text !== (task.text || task.start || '').trim();
  }

  private gradeTask(task: AlexTask, key: string): { correct: boolean; explanation?: string; zh?: string } {
    const taskState = this.taskState(key);
    if (task.type === 'pick') return { correct: this.engine.choiceGrade(task, taskState.picked ?? []).correct };
    if (task.type === 'tapword') {
      const targets = (task.targets ?? []).map((target) => this.engine.locate(task.text ?? '', target));
      return { correct: taskState.sel != null && targets.includes(taskState.sel) };
    }
    const text = this.engine.stripPictures(regionText(this.state.regions[key])).trim();
    if (task.frameFill) return this.engine.frameFill(text, task.frameFill, task.ok);
    if (task.rules) {
      if (text.includes('___')) return { correct: false, explanation: 'Fill each ___ first.', zh: '先把每个 ___ 填上。' };
      return this.analyzer.checkProduction(
        { check: task.rules, success: task.ok?.en, successZh: task.ok?.zh },
        text,
      );
    }
    if (task.accept?.some((answer) => this.engine.sameText(answer, text))) {
      return { correct: true, explanation: this.text(task.ok), zh: task.ok?.zh };
    }
    return { correct: false, explanation: 'Not quite yet. Read it again slowly. What is missing?', zh: '还不太对。慢慢再读一遍，少了什么？' };
  }

  private editCheck(task: AlexTask, key: string): void {
    const taskState = this.taskState(key);
    const stored = regionText(this.state.regions[key]).trim();
    const text = stored || (task.start || '').trim();
    if (!text) {
      this.feedback = this.zh ? '先写下你的答案，我再和你一起检查。' : 'Write your answer first. Then I’ll check it with you.';
      this.log('next_blocked');
      this.emit();
      return;
    }
    if (!stored) this.state.regions[key] = [{ t: text, s: task.start ? 'given' : 'typed' }];
    const grade = this.gradeTask(task, key);
    taskState.tries += 1;
    this.log('task_try', { task: task.id, ok: grade.correct });
    if (grade.correct) {
      this.finish(task, key, 'done', this.zh && grade.zh ? grade.zh : grade.explanation);
      return;
    }
    if (taskState.tries >= 2) {
      this.finish(task, key, 'shown');
      return;
    }
    const diagnosed = this.diagnose(task, text);
    const explanation = this.zh && grade.zh ? grade.zh : grade.explanation;
    this.feedback = [diagnosed, explanation].filter((item, index, all) => item && all.indexOf(item) === index).join(' ')
      || (this.zh ? '还不对。再看一看。' : 'Not yet. Have another look.');
    this.save();
    this.emit();
  }

  private diagnose(task: AlexTask, text: string): string {
    const ids = task.coach?.diagnose ?? [];
    if (!ids.length) return '';
    const id = this.analyzer.diagnose(text, ids, { original: task.text, answer: task.answer_text, prompt: this.text(task.ask) });
    const message = id ? this.config.coach?.diagnostics?.[id] : undefined;
    return message ? this.text(message) : '';
  }

  private applyCheck(): void {
    const screen = this.screens[this.state.screen]?.screen;
    const page = screen ? this.pageOf(screen.page) : null;
    if (!page?.skill || !page.task) return;
    const text = this.engine.stripPictures(regionText(this.state.regions[page.id])).trim();
    if (this.analyzer.wordCount(text) < 3) {
      this.feedback = this.zh ? '先写一点，我再来读。' : 'Write a little first. Then I’ll read it.';
      this.log('next_blocked');
      this.emit();
      return;
    }
    const record = this.applyRecord(page.skill);
    const result = this.analyzer.checkApply(page.skill, text);
    record.tries += 1;
    record.result = result;
    record.passed = !!result.passed;
    record.dirty = false;
    record.history = [...(record.history ?? []), { at: Date.now(), passed: !!result.passed, source: result.source }];
    this.log('apply_check', { skill: page.skill, passed: result.passed, source: result.source });
    if (result.passed) this.state.done[page.id] = true;
    this.feedback = this.applyFeedback(record);
    this.save();
    this.emit();
  }

  private applyFeedback(record: ApplyRecord): string {
    const result = record.result;
    if (!result) return '';
    if (result.safety_flag) {
      return this.zh ? '我想和你谈谈这篇。请给老师看。' : 'I’d like to talk with you about this. Please show your teacher.';
    }
    if (result.passed) {
      return this.zh ? '对。你在自己的写作里用上了。' : 'Yes. You used it in your own writing.';
    }
    return this.zh && result.zh ? result.zh : result.feedback || 'Nearly there. Read it again and try one more change.';
  }

  private applyRecord(skill: string): ApplyRecord {
    return this.state.applies[skill] ?? (this.state.applies[skill] = { tries: 0, passed: false });
  }

  private ensureCheck(pageId: string): CheckRecord {
    const current = this.state.checks[pageId];
    if (!current || current.attempt == null || !current.history) {
      this.state.checks[pageId] = {
        attempt: current?.attempt ?? 0,
        finished: current?.finished ?? false,
        passed: current?.passed ?? false,
        history: current?.history ?? [],
        q: current?.q ?? 0,
        view: current?.view ?? null,
        blankAsk: current?.blankAsk ?? false,
      };
    }
    return this.state.checks[pageId];
  }

  private currentCheckPage(): AlexPage | null {
    const screen = this.screens[this.state.screen]?.screen;
    if (screen?.kind !== 'check') return null;
    return this.pageOf(screen.page);
  }

  private attemptKey(page: AlexPage, taskId: string): string {
    const check = this.ensureCheck(page.id);
    return `${page.id}:a${check.attempt}:${taskId}`;
  }

  private activePickTask(screen: AlexScreen | undefined): AlexTask | null {
    if (!screen) return null;
    if (screen.kind === 'check') {
      const page = this.pageOf(screen.page);
      if (!page) return null;
      const check = this.ensureCheck(page.id);
      if (check.finished) return null;
      const ids = this.engine.masteryItems(page, check.attempt);
      const id = ids[Math.min(check.q || 0, ids.length - 1)];
      return id ? this.task(id) : null;
    }
    if (!screen.task) return null;
    return this.task(screen.task);
  }

  private activeTaskKey(screen: AlexScreen | undefined, taskId: string): string {
    if (screen?.kind === 'check') {
      const page = this.pageOf(screen.page);
      if (page) return this.attemptKey(page, taskId);
    }
    return `${screen?.page}:${taskId}`;
  }

  private lessonReceiptId(): string {
    const ref = this.screens[this.state.screen];
    return `${this.playUnit().id}:${(ref?.lesson.n ?? (ref?.li ?? 0) + 1)}`;
  }

  private lessonEndActivity(): ActivityModel {
    const index = this.state.screen;
    const lessonIndex = this.screens[index]?.li ?? 0;
    const indexes = this.liveIdx(lessonIndex);
    const doneCount = indexes.filter((item) => this.screenDone(item)).length;
    const unit = this.playUnit();
    const current = unit.lessons[lessonIndex];
    const next = unit.lessons[lessonIndex + 1];
    return {
      supported: true,
      template: 'S1',
      kind: 'lesson_end',
      screenId: 'lesson-end',
      title: this.zh ? '今天的课就到这里。' : 'That’s today’s lesson.',
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
      const lessonId = this.lessonReceiptId();
      if (!this.receipt.lessons?.[lessonId]) {
        this.lessonBurst = true;
        this.receipt.lessons = { ...(this.receipt.lessons ?? {}), [lessonId]: true };
        this.writeReceipt();
      }
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
    if (this.screens[index].screen.kind === 'check') {
      const checkPage = this.pageOf(this.screens[index].screen.page);
      if (checkPage) this.ensureCheck(checkPage.id);
    }
    this.view = 'lesson';
    this.lessonBurst = false;
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

  private finish(task: AlexTask, key: string, status: 'done' | 'shown', okText?: string): void {
    const taskState = this.taskState(key);
    taskState.status = status;
    if (!key.includes(':a') && !key.startsWith('demo.')) {
      taskState.how = this.engine.practiceHow(task, status, this.state.regions[key]);
      taskState.credit = this.engine.practiceCredit(this.config, taskState.how);
    }
    const graded = this.gradedText(task, taskState, status === 'done');
    const doneText = okText || this.text(task.ok) || this.text(task.why);
    this.feedback =
      task.type === 'pick' || (task.type === 'tapword' && status === 'shown' && (task.targets ?? []).length === 1)
        ? graded
        : status === 'done'
          ? this.affirm(doneText)
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
        lessons: parsed.lessons ?? {},
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
