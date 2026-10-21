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
  type AlexScreen,
  type AlexTask,
  type Bilingual,
  type AnalyzerApi,
  type EngineApi,
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
  /** Ordered-build tokens. Cumulative `miss` is not a consecutive streak. */
  built?: string[];
  miss?: number;
}

export interface ApplyResult {
  passed: boolean;
  feedback: string;
  zh?: string;
  glow?: string;
  safety_flag?: boolean;
  checks?: { label: string; met: boolean; tip?: string; zh?: string }[];
}

export interface ApplyRecord {
  tries: number;
  passed: boolean;
  movedOn?: boolean;
  result: ApplyResult | null;
  history: { passed: boolean; safety?: boolean }[];
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
  q: number;
  blankAsk: boolean;
  view: number | null;
  history: {
    attempt: number;
    results: CheckResultRow[];
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
  checks: Record<string, CheckRecord | { passed?: boolean; finished?: boolean }>;
  plan: { topic: string; checks: number; result: unknown };
  applies: Record<string, ApplyRecord | unknown>;
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

export interface WordGroupModel {
  id: string;
  label: string;
  tone: string;
  words: { id: string; text: string; state?: 'available' | 'used' | 'focused' }[];
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
      state: ChoiceVisualState;
    }[];
    hint: string;
  };
  apply?: {
    ask: string;
    tip: string;
    draft: string;
    tries: number;
    passed: boolean;
    moveOn: boolean;
    /** Safety-flagged drafts do not offer Move on until Product Owner decides (§19). */
    safetyHeld: boolean;
    activeGroup: string;
    groups: WordGroupModel[];
    nudge: string;
    praise: string;
    checks: { label: string; met: boolean }[];
    /** Layout review while the real screen is still locked. Does not grant canOpen. */
    lockedPreview: boolean;
  };
  build?: {
    bench: string;
    closed: boolean;
    revealed: string;
    miss: number;
    activeGroup: string;
    groups: WordGroupModel[];
  };
  write?: {
    draft: string;
    closed: boolean;
    revealed: string;
    activeGroup: string;
    groups: WordGroupModel[];
  };
  check?: {
    stage: 'answering' | 'results' | 'graded';
    /** One prominent numeral. Not a TopBar step and not “Question n of 4”. */
    numeral: number;
    index: number;
    count: number;
    dots: { index: number; answered: boolean }[];
    passed: boolean;
    mastered: boolean;
    screenComplete: boolean;
    /** In-page retry after a failed set. The footer stays End of lesson once the screen is complete. */
    retry: boolean;
    summary: string;
    note: string;
    rows: { index: number; ask: string; correct: boolean; detail: string }[];
    prompt: string;
    pick?: ActivityModel['pick'];
    tapword?: ActivityModel['tapword'];
    draft?: string;
    draftClosed?: boolean;
  };
  feedbackTone: 'neutral' | 'hint' | 'correct' | 'incorrect' | 'revealed';
  tapword?: {
    words: { index: number; text: string; selected: boolean; wrong: boolean }[];
  };
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
  previousDisabled: boolean;
  primaryLabel: string;
  primaryTestId: string;
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

function cellText(cell: string | { t: string }): string {
  return typeof cell === 'string' ? cell : cell.t;
}

/** Same shuffle as Alex `seededShuffle` so a sentence set stays stable for a task id. */
function seededShuffle(items: string[], seed: string): string[] {
  const copy = items.slice();
  let value = 0;
  for (const char of seed) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    value = (value * 1103515245 + 12345) >>> 0;
    const swap = value % (index + 1);
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
  private readonly listeners = new Set<() => void>();
  private revision = 0;
  private yesCount = 0;
  private coachBeat: Record<string, number> = {};
  private receipt: CelebrationReceipt;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  /** In-memory only. A wrong full build line clears after 1.2s. Not the saved record. */
  private buildClearTimer: ReturnType<typeof setTimeout> | null = null;

  state: AlexState;
  view: CourseView = 'path';
  levelId: string;
  message = '';
  feedback = '';
  feedbackTone: ActivityModel['feedbackTone'] = 'neutral';
  /**
   * In-memory Apply layout review. Not stored in Alex state and not an unlock.
   * Screen 7 stays locked until earlier screens are actually finished.
   */
  layoutReviewId: string | null = null;
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
    this.save(true);
    this.applyEntryQuery(options.search ?? '');
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', this.flushOnLeave);
      window.addEventListener('beforeunload', this.flushOnLeave);
    }
  }

  /** Writes the debounced record immediately. Navigation, Check, Hand in, and exit call this. */
  flush(): void {
    this.save(true);
  }

  private flushOnLeave = (): void => {
    this.save(true);
  };

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
    this.save(true);
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
    this.save(true);
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
    this.layoutReviewId = null;
    this.view = 'path';
    this.feedback = '';
    this.feedbackTone = 'neutral';
    this.message = '';
    this.save(true);
    this.emit();
  }

  /**
   * Opens the Apply writing surface for layout review.
   * Does not mark earlier screens done and does not change the saved screen index.
   */
  openLayoutReview(screenId = 'L2-04.apply'): boolean {
    const ref = this.screens.find((item) => item.screen.id === screenId);
    if (!ref || ref.screen.kind !== 'apply') return false;
    this.layoutReviewId = screenId;
    this.view = 'lesson';
    this.feedback = '';
    this.feedbackTone = 'neutral';
    this.message = '';
    this.emit();
    return true;
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
      const lead = this.zh ? '那一页还没打开。' : 'That page opens later. ';
      this.feedbackTone = 'hint';
      this.feedback = `${lead}${this.lockedMsg(this.firstOpen())}`.trim();
      this.emit();
      return;
    }
    this.view = 'lesson';
    this.go(globalIndex, backward);
  }

  activity(): ActivityModel | null {
    if (this.view === 'lesson' && this.layoutReviewId) {
      const reviewed = this.screens.find((item) => item.screen.id === this.layoutReviewId);
      if (reviewed?.screen.kind === 'apply') return this.applyModel(reviewed, true);
    }
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
      feedbackTone: this.feedbackTone,
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
      };
    }

    if (screen.kind === 'apply') return this.applyModel(ref, false);
    if (screen.kind === 'check') return this.checkModel(ref);

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
            closed,
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
              state: this.choiceVisual(index, task, taskState),
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
            words: tokens.map((token, index) => ({
              index,
              text: token.w,
              selected: taskState.sel === index && taskState.status === 'open',
              wrong: taskState.bad === index,
            })),
          },
        };
      }
      if (task.type === 'build') return this.buildModel(ref, task, taskState, base, hints, hintAction);
      if (task.type === 'write' || task.type === 'edit') return this.writeModel(ref, task, taskState, base, hints, hintAction);
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
    if (this.view === 'lesson' && this.layoutReviewId) {
      return {
        backLabel: this.zh ? '上一屏' : 'Previous',
        previousDisabled: true,
        primaryLabel: this.zh ? '检查我的写作' : 'Check my writing',
        primaryTestId: 'check',
      };
    }
    if (this.view === 'lessonEnd') {
      return {
        backLabel: this.zh ? '返回' : 'Back',
        previousDisabled: false,
        primaryLabel: this.zh ? '继续' : 'Keep going',
        primaryTestId: 'keep-going',
      };
    }
    if (this.view === 'preview') {
      return {
        backLabel: this.zh ? '我的路径' : 'My path',
        previousDisabled: false,
        primaryLabel: this.zh ? '我的路径' : 'My path',
        primaryTestId: 'back-to-path',
      };
    }
    const index = this.state.screen;
    const screen = this.screens[index]?.screen;
    if (screen?.kind === 'check') return this.checkFooter(index);
    const backLabel = this.zh ? '上一屏' : 'Previous';
    const previousDisabled = this.isFirstActivity();
    if (screen?.kind === 'apply') {
      const page = this.pageOf(screen.page);
      const record = page?.skill ? this.readApply(page.skill) : null;
      const tries = record?.tries ?? 0;
      if (!this.canNext(index)) {
        return {
          backLabel,
          previousDisabled,
          primaryLabel: tries > 0 ? (this.zh ? '再检查一次' : 'Check again') : this.zh ? '检查我的写作' : 'Check my writing',
          primaryTestId: 'check-writing',
        };
      }
    }
    if (!this.canNext(index)) {
      return {
        backLabel,
        previousDisabled,
        primaryLabel: this.blockedLabel(index),
        primaryTestId: 'check',
      };
    }
    return {
      backLabel,
      previousDisabled,
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
    const checkScreen = this.screens[this.state.screen]?.screen;
    if (checkScreen?.kind === 'check' && !this.layoutReviewId) {
      const record = this.readCheck(checkScreen.page);
      if (record.view != null) {
        record.view = null;
        this.writeCheck(checkScreen.page, record);
        this.save(true);
        this.emit();
        return;
      }
      if (!record.finished && record.q > 0) {
        record.q -= 1;
        record.blankAsk = false;
        this.writeCheck(checkScreen.page, record);
        this.feedback = '';
        this.save(true);
        this.emit();
        return;
      }
    }
    if (this.layoutReviewId || this.isFirstActivity()) return;
    const previous = this.state.screen - 1;
    if (previous < 0 || this.screens[previous]?.li !== this.screens[this.state.screen]?.li) return;
    this.go(previous, true);
  }

  pressPrimary(): void {
    if (this.layoutReviewId && this.view === 'lesson') {
      const reviewed = this.screens.find((item) => item.screen.id === this.layoutReviewId);
      if (reviewed?.screen.kind === 'apply') this.applyStub(reviewed.screen.page);
      return;
    }
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
      const record = this.readCheck(screen.page);
      const advances = record.finished && record.view == null && this.canNext(index);
      if (!advances) {
        this.pressCheckPrimary(screen.page);
        return;
      }
    }
    if (!this.canNext(index)) {
      if (screen.kind === 'apply') {
        this.applyCheck(screen.page);
        return;
      }
      if (screen.kind === 'task' || screen.kind === 'model_task') {
        const task = screen.task ? this.task(screen.task) : null;
        if (task?.type === 'pick') this.pickCheck(task, this.taskKey(screen));
        else if (task?.type === 'tapword' && task.need !== 'all') this.wordCheck(task, this.taskKey(screen));
        else if (task?.type === 'build') this.buildBlocked(task);
        else if (task?.type === 'write' || task?.type === 'edit') this.editCheck(task, this.taskKey(screen));
        else {
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
    const active = this.activePractice();
    if (!active || active.task.type !== 'pick') return;
    const task = active.task;
    const key = active.key;
    const taskState = this.taskState(key);
    if (!active.inCheck && taskState.status !== 'open') return;
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
    const active = this.activePractice();
    if (!active || active.task.type !== 'tapword' || active.task.need === 'all') return;
    const taskState = this.taskState(active.key);
    if (!active.inCheck && taskState.status !== 'open') return;
    taskState.sel = taskState.sel === index ? null : index;
    taskState.bad = null;
    this.save();
    this.emit();
  }

  openHint(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (screen?.kind === 'check') return;
    if (screen?.kind === 'apply') {
      this.applyHint(screen.page);
      return;
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
    this.save(true);
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
    this.save(true);
    this.emit();
  }

  consumeReturnFocus(): { unitId: string; number: number } | null {
    const focus = this.returnFocus;
    this.returnFocus = null;
    return focus;
  }

  /** Switches a vocabulary group. Does not grade, count a try, or change the draft. */
  setWordGroup(groupId: string): void {
    const pageId = this.gridTabId();
    if (!pageId) return;
    this.state.grid.tab[pageId] = groupId;
    this.save();
    this.emit();
  }

  /** Replaces the writing draft from the textarea. Phase 1 stores one typed span. */
  setWritingText(value: string): void {
    const regionId = this.editableRegionId();
    if (!regionId) return;
    if (regionText(this.state.regions[regionId]) === value) return;
    this.state.regions[regionId] = value ? [{ t: value, s: 'typed' }] : [];
    this.save();
    this.emit();
  }

  /**
   * Inserts a word-grid card at the caret using Alex smartInsert.
   * Appending at the end keeps a grid span. A mid-text insert is stored as typed.
   * Neither path grades.
   */
  insertWord(text: string, start: number, end: number): number {
    const pageId = this.editableRegionId();
    if (!pageId) return start;
    const before = regionText(this.state.regions[pageId]);
    const kind = /^[.,!?;:]/.test(text) ? 'mark' : 'word';
    const result = this.engine.smartInsert(before, start, end, text, kind);
    const atEnd = start === before.length && end === before.length;
    if (atEnd) {
      const segments = [...(this.state.regions[pageId] ?? [])];
      segments.push({ t: result.inserted, s: 'grid' });
      this.state.regions[pageId] = segments;
    } else {
      this.state.regions[pageId] = [{ t: result.value, s: 'typed' }];
    }
    this.save();
    this.emit();
    return result.caret;
  }

  /** Ordered-build card tap. A wrong card does not insert and does not grade the line. */
  buildTap(cellText: string): void {
    const active = this.activePractice();
    if (!active || active.inCheck || active.task.type !== 'build') return;
    const task = active.task;
    const taskState = this.taskState(active.key);
    if (taskState.status !== 'open') return;
    taskState.built = taskState.built ?? [];
    const target = task.target ?? [];
    if (task.in_order) {
      const want = target[taskState.built.length];
      if (cellText !== want) {
        taskState.miss = (taskState.miss ?? 0) + 1;
        this.log('set_miss', { task: task.id, cell: cellText });
        this.feedbackTone = 'incorrect';
        this.feedback = this.text(task.why);
        this.save();
        this.emit();
        return;
      }
    }
    taskState.built.push(cellText);
    this.appendBuildToken(active.key, cellText);
    if (taskState.built.length === target.length && target.length > 0) {
      const bench = regionText(this.state.regions[active.key]);
      const ok =
        this.engine.sameText(bench, task.answer_text ?? '') ||
        JSON.stringify(taskState.built) === JSON.stringify(target);
      taskState.tries += 1;
      this.log('task_try', { task: task.id, ok });
      if (ok) {
        this.finish(task, active.key, 'done');
        return;
      }
      if (taskState.tries >= 2) {
        this.finish(task, active.key, 'shown');
        return;
      }
      const order =
        (task.coach?.diagnose ?? []).includes('order') && this.config.coach?.diagnostics?.order
          ? this.text(this.config.coach.diagnostics.order)
          : '';
      const why = this.text(task.why) || 'Not quite. Read it out loud. Does it make sense?';
      this.feedbackTone = 'incorrect';
      this.feedback = [order, why].filter(Boolean).join(' ');
      taskState.built = [];
      this.save(true);
      this.emit();
      const key = active.key;
      if (this.buildClearTimer) clearTimeout(this.buildClearTimer);
      this.buildClearTimer = setTimeout(() => {
        this.buildClearTimer = null;
        const current = this.state.tasks[key];
        if (!current || current.status !== 'open') return;
        current.built = [];
        this.state.regions[key] = [];
        this.save();
        this.emit();
      }, 1200);
      return;
    }
    this.save();
    this.emit();
  }

  /** Clears the built line or frame draft. Does not reset cumulative miss or tries. */
  restartBuild(): void {
    const active = this.activePractice();
    if (!active || active.inCheck) return;
    if (active.task.type !== 'build' && active.task.type !== 'write' && active.task.type !== 'edit') return;
    const taskState = this.taskState(active.key);
    if (taskState.status !== 'open') return;
    if (this.buildClearTimer) {
      clearTimeout(this.buildClearTimer);
      this.buildClearTimer = null;
    }
    taskState.built = [];
    this.state.regions[active.key] = active.task.start ? [{ t: active.task.start, s: 'given' }] : [];
    this.save();
    this.emit();
  }

  /**
   * Completes Apply without a pass after enough ordinary failed checks.
   * A safety-flagged history does not offer this. Product §19 has not approved Move on after safety.
   */
  moveOn(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen || screen.kind !== 'apply' || this.layoutReviewId) return;
    const page = this.pageOf(screen.page);
    if (!page?.skill || !page.task) return;
    const task = this.task(page.task);
    const record = this.readApply(page.skill);
    const needed = task.continue_after ?? 2;
    if (record.passed || this.state.done[page.id] || record.tries < needed) return;
    if (record.history.some((item) => item.safety)) return;
    record.movedOn = true;
    this.state.done[page.id] = true;
    this.log('apply_move_on', { skill: page.skill });
    this.save(true);
    this.emit();
  }

  selectCheckQuestion(index: number): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen || screen.kind !== 'check') return;
    const page = this.pageOf(screen.page);
    if (!page) return;
    const record = this.readCheck(screen.page);
    if (record.finished) return;
    const count = this.engine.masteryItems(page, record.attempt).length;
    if (index < 0 || index >= count || index === record.q) return;
    record.q = index;
    record.blankAsk = false;
    this.save();
    this.emit();
  }

  openCheckResult(index: number): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen || screen.kind !== 'check') return;
    const record = this.readCheck(screen.page);
    const last = record.history[record.history.length - 1];
    if (!record.finished || !last || index < 0 || index >= last.results.length) return;
    record.view = index;
    this.save();
    this.emit();
  }

  /** Next mastery set. Keeps earlier attempt answers. Does not clear a completed screen. */
  retryCheck(): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen || screen.kind !== 'check') return;
    const record = this.readCheck(screen.page);
    if (!record.finished || record.passed) return;
    record.attempt += 1;
    record.finished = false;
    record.q = 0;
    record.view = null;
    record.blankAsk = false;
    this.feedback = '';
    this.save(true);
    this.emit();
  }

  private isFirstActivity(): boolean {
    const current = this.screens[this.state.screen];
    if (!current) return true;
    return this.liveIdx(current.li)[0] === this.state.screen;
  }

  private gridTabId(): string | null {
    if (this.layoutReviewId) return this.writingPageId();
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return null;
    if (screen.kind === 'apply') return screen.page;
    if ((screen.kind === 'task' || screen.kind === 'model_task') && screen.task) {
      const task = this.task(screen.task);
      if (task.type === 'build' || task.type === 'write' || task.type === 'edit') return this.taskKey(screen);
    }
    return null;
  }

  private editableRegionId(): string | null {
    if (this.layoutReviewId) return this.writingPageId();
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return null;
    if (screen.kind === 'apply') return screen.page;
    if ((screen.kind === 'task' || screen.kind === 'model_task') && screen.task) {
      const task = this.task(screen.task);
      if (task.type === 'write' || task.type === 'edit') return this.taskKey(screen);
    }
    if (screen.kind === 'check') {
      const active = this.activePractice();
      if (active && (active.task.type === 'write' || active.task.type === 'edit')) return active.key;
    }
    return null;
  }

  private writingPageId(): string | null {
    if (this.layoutReviewId) {
      return this.screens.find((item) => item.screen.id === this.layoutReviewId)?.screen.page ?? null;
    }
    const screen = this.screens[this.state.screen]?.screen;
    return screen?.kind === 'apply' ? screen.page : null;
  }

  private choiceVisual(
    index: number,
    task: AlexTask,
    taskState: TaskProgress,
    graded?: { graded: boolean; correct: boolean },
  ): ChoiceVisualState {
    const answers = task.answers ?? [];
    const picked = taskState.picked ?? [];
    const wrong = taskState.wrong ?? [];
    const isAnswer = answers.includes(index);
    const isPicked = picked.includes(index);
    if (graded?.graded) {
      if (graded.correct) return isPicked && isAnswer ? 'correct' : isAnswer ? 'shown' : 'dim';
      if (isAnswer) return 'shown';
      if (isPicked) return 'wrong';
      return 'dim';
    }
    if (taskState.status === 'done') return isPicked && isAnswer ? 'correct' : 'dim';
    if (taskState.status === 'shown') {
      if (isAnswer) return 'shown';
      if (wrong.includes(index) || isPicked) return 'wrong';
      return 'dim';
    }
    if (wrong.includes(index)) return 'wrong';
    if (isPicked) return 'selected';
    return 'idle';
  }

  private applyModel(ref: ScreenRef, review: boolean): ActivityModel {
    const page = this.pageOf(ref.screen.page);
    const task = page?.task ? this.task(page.task) : null;
    const grid = this.wordGroups(page, task, ref.screen.page, []);
    const index = this.screens.findIndex((item) => item.screen.id === ref.screen.id);
    const record = page?.skill ? this.peekApply(page.skill) : null;
    const hintKey = page?.task ? `${page.id}:${page.task}` : '';
    const hintState = hintKey ? this.state.tasks[hintKey] : undefined;
    const hints = (task?.coach?.hints ?? []).slice(0, hintState?.hintLv ?? 0).map((hint) => this.text(hint));
    const hintAction = task && (hintState?.status ?? 'open') === 'open' ? this.hintAction(task, hintState ?? { tries: 0, status: 'open' }) : null;
    const draft = regionText(this.state.regions[ref.screen.page]);
    const live = this.liveCoach(draft, this.text(task?.ask));
    const needed = task?.continue_after ?? 2;
    const safetyHeld = !!record?.history.some((item) => item.safety);
    const moveOn =
      !review &&
      !!record &&
      !record.passed &&
      !this.state.done[ref.screen.page] &&
      record.tries >= needed &&
      !safetyHeld;
    return {
      supported: true,
      template: ref.screen.template,
      kind: ref.screen.kind,
      title: this.text(ref.screen.title),
      ask: this.text(task?.ask),
      skip: null,
      hints,
      hintAction: hintAction === 'reveal' ? null : hintAction,
      coach: this.coachLines(ref.screen),
      coachMore: this.coachHasMore(ref.screen),
      feedback: this.feedback,
      feedbackTone: this.feedbackTone,
      apply: {
        ask: this.text(task?.ask),
        tip: this.text(task?.tip),
        draft,
        tries: record?.tries ?? 0,
        passed: !!record?.passed,
        moveOn,
        safetyHeld: safetyHeld && !record?.passed && !this.state.done[ref.screen.page],
        activeGroup: grid.activeGroup,
        groups: grid.groups,
        nudge: live.nudge,
        praise: live.praise || record?.result?.glow || '',
        checks: (record?.result?.checks ?? []).map((item) => ({
          label: this.zh && item.zh ? item.zh : item.label,
          met: item.met,
        })),
        lockedPreview: review && !this.canOpen(index),
      },
    };
  }

  /**
   * Phase 1 Apply check.
   * Fewer than 3 words names the gap and does not count a try (settled product rule).
   * A longer draft is saved only. The offline/AI grader, CJK-ratio counting, safety
   * branch, and Move on for now stay unwired on purpose.
   */
  private applyStub(pageId: string): void {
    const words = (regionText(this.state.regions[pageId]).match(/[A-Za-z0-9']+/g) ?? []).length;
    if (words < 3) {
      this.feedbackTone = 'hint';
      this.feedback = this.zh
        ? '先再写几个词。这次不算尝试。'
        : 'Write a little first. This does not count as an attempt.';
      this.log('next_blocked', { reason: 'apply_short' });
      this.emit();
      return;
    }
    this.feedbackTone = 'neutral';
    this.feedback = this.zh
      ? '草稿已留下。第一阶段还没有接入写作评分，所以这次不记尝试，也不会打开下一屏。'
      : 'Your draft is saved. Phase 1 does not grade this writing yet, so this press does not count an attempt or open the next screen.';
    this.log('next_blocked', { reason: 'apply_grader_pending' });
    this.emit();
  }

  private applyCheck(pageId: string): void {
    const page = this.pageOf(pageId);
    if (!page?.skill || !page.task) return;
    const record = this.readApply(page.skill);
    const text = this.engine.stripPictures(regionText(this.state.regions[pageId])).trim();
    if (this.analyzer.wordCount(text) < 3) {
      this.feedbackTone = 'hint';
      this.feedback = this.zh ? '先写一点，我再来读。' : 'Write a little first. Then I’ll read it.';
      this.log('next_blocked', { reason: 'apply_short' });
      this.emit();
      return;
    }
    if (this.analyzer.safetyScreen(text)) {
      record.tries += 1;
      record.passed = false;
      record.result = {
        passed: false,
        feedback: 'I’d like to talk with you about this. Please show your teacher.',
        safety_flag: true,
        checks: [],
      };
      record.history.push({ passed: false, safety: true });
      this.feedbackTone = 'incorrect';
      this.feedback = record.result.feedback;
      this.log('apply_check', { skill: page.skill, passed: false, safety: true });
      this.save(true);
      this.emit();
      return;
    }
    const graded = this.analyzer.checkApply(page.skill, text);
    record.tries += 1;
    record.passed = !!graded.passed;
    record.result = {
      passed: !!graded.passed,
      feedback: graded.feedback,
      zh: graded.zh,
      glow: graded.glow,
      checks: graded.checks,
    };
    record.history.push({ passed: !!graded.passed, safety: false });
    if (graded.passed) this.state.done[pageId] = true;
    const passText = 'Yes. You used it in your own writing.';
    this.feedbackTone = graded.passed ? 'correct' : 'incorrect';
    this.feedback = graded.passed
      ? this.zh && graded.zh
        ? graded.zh
        : passText
      : this.zh && graded.zh
        ? graded.zh
        : graded.feedback || 'Nearly there. Read it again and try one more change.';
    this.log('apply_check', { skill: page.skill, passed: graded.passed, source: graded.source });
    this.save(true);
    this.emit();
  }

  private applyHint(pageId: string): void {
    const page = this.pageOf(pageId);
    if (!page?.task) return;
    const task = this.task(page.task);
    const key = `${page.id}:${task.id}`;
    const taskState = this.taskState(key);
    if (taskState.status !== 'open') return;
    const hints = task.coach?.hints ?? [];
    const level = taskState.hintLv ?? 0;
    if (level >= hints.length) return;
    taskState.hintLv = level + 1;
    this.log('hint_open', { task: task.id });
    this.save();
    this.emit();
  }

  private buildModel(
    ref: ScreenRef,
    task: AlexTask,
    taskState: TaskProgress,
    base: Pick<ActivityModel, 'template' | 'kind' | 'title' | 'skip' | 'coach' | 'coachMore' | 'feedback' | 'feedbackTone'>,
    hints: string[],
    hintAction: ActivityModel['hintAction'],
  ): ActivityModel {
    const page = this.pageOf(ref.screen.page);
    const built = taskState.built ?? [];
    const grid = this.wordGroups(page, task, this.taskKey(ref.screen), built, taskState.miss ?? 0);
    return {
      ...base,
      supported: true,
      ask: this.text(task.ask),
      hints,
      hintAction,
      build: {
        bench: regionText(this.state.regions[this.taskKey(ref.screen)]),
        closed: taskState.status !== 'open',
        revealed: taskState.status === 'shown' ? task.answer_text ?? '' : '',
        miss: taskState.miss ?? 0,
        activeGroup: grid.activeGroup,
        groups: grid.groups,
      },
    };
  }

  private writeModel(
    ref: ScreenRef,
    task: AlexTask,
    taskState: TaskProgress,
    base: Pick<ActivityModel, 'template' | 'kind' | 'title' | 'skip' | 'coach' | 'coachMore' | 'feedback' | 'feedbackTone'>,
    hints: string[],
    hintAction: ActivityModel['hintAction'],
  ): ActivityModel {
    const key = this.taskKey(ref.screen);
    this.ensureGiven(key, task);
    const page = this.pageOf(ref.screen.page);
    const grid = this.wordGroups(page, task, key, []);
    return {
      ...base,
      supported: true,
      ask: this.text(task.ask),
      hints,
      hintAction,
      write: {
        draft: regionText(this.state.regions[key]),
        closed: taskState.status !== 'open',
        revealed: taskState.status === 'shown' ? this.text(task.why) : '',
        activeGroup: grid.activeGroup,
        groups: grid.groups,
      },
    };
  }

  private checkModel(ref: ScreenRef): ActivityModel {
    const page = this.pageOf(ref.screen.page);
    const base = {
      supported: true,
      template: ref.screen.template,
      kind: ref.screen.kind,
      title: this.text(ref.screen.title),
      ask: '',
      skip: null,
      hints: [] as string[],
      hintAction: null,
      coach: this.coachLines(ref.screen),
      coachMore: this.coachHasMore(ref.screen),
      feedback: this.feedback,
      feedbackTone: this.feedbackTone,
    };
    if (!page) return { ...base, supported: false };
    const record = this.readCheck(page.id);
    const ids = this.engine.masteryItems(page, record.attempt);
    const last = record.history[record.history.length - 1];
    const note = this.text(this.config.coach?.check_note);
    if (!record.finished) {
      const index = Math.min(record.q || 0, Math.max(0, ids.length - 1));
      const id = ids[index];
      const task = id ? this.task(id) : null;
      const key = id ? `${page.id}:a${record.attempt}:${id}` : '';
      const taskState = key ? this.taskState(key) : { tries: 0, status: 'open' as const };
      if (task?.start) this.ensureGiven(key, task);
      return {
        ...base,
        ask: task ? this.text(task.ask) : '',
        check: {
          stage: 'answering',
          numeral: index + 1,
          index,
          count: ids.length,
          dots: ids.map((itemId, dot) => ({
            index: dot,
            answered: this.checkAnswered(this.task(itemId), `${page.id}:a${record.attempt}:${itemId}`),
          })),
          passed: record.passed,
          mastered: record.passed,
          screenComplete: !!this.state.done[page.id],
          retry: false,
          summary: '',
          note,
          rows: [],
          prompt: task ? this.text(task.ask) : '',
          pick: task?.type === 'pick' ? this.pickBlock(task, taskState, false) : undefined,
          tapword: task?.type === 'tapword' ? this.tapBlock(task, taskState, false) : undefined,
          draft:
            task && (task.type === 'write' || task.type === 'edit') ? regionText(this.state.regions[key]) : undefined,
          draftClosed: false,
        },
      };
    }
    if (record.view != null && last) {
      const row = last.results[record.view];
      const task = row ? this.task(row.id) : null;
      const key = row ? `${page.id}:a${record.attempt}:${row.id}` : '';
      const taskState = key ? this.taskState(key) : { tries: 0, status: 'open' as const };
      const detail = task && row ? this.checkSentence(task, key, row) : '';
      return {
        ...base,
        ask: task ? this.text(task.ask) : '',
        feedback: this.feedback || detail,
        feedbackTone: this.feedback ? this.feedbackTone : row?.correct ? 'correct' : 'revealed',
        check: {
          stage: 'graded',
          numeral: record.view + 1,
          index: record.view,
          count: last.results.length,
          dots: [],
          passed: record.passed,
          mastered: record.passed,
          screenComplete: !!this.state.done[page.id],
          retry: false,
          summary: row?.correct ? (this.zh ? '这题对了。' : 'You got this one.') : this.zh ? '再看一看。' : 'Look again.',
          note,
          rows: [],
          prompt: task ? this.text(task.ask) : '',
          pick: task?.type === 'pick' ? this.pickBlock(task, taskState, true, !!row?.correct) : undefined,
          tapword: task?.type === 'tapword' ? this.tapBlock(task, taskState, true, task) : undefined,
          draft:
            task && (task.type === 'write' || task.type === 'edit') ? regionText(this.state.regions[key]) : undefined,
          draftClosed: true,
        },
      };
    }
    const score = last ? (this.zh ? `${last.score} / ${last.total}。` : `${last.score} of ${last.total}.`) : '';
    const head = record.passed
      ? this.zh
        ? '你通过了这次检查。'
        : 'You passed this check.'
      : this.zh
        ? '还没通过。'
        : 'Not yet.';
    const tail = record.passed
      ? ''
      : record.attempt < 2
        ? this.zh
          ? '准备好了可以再做一组。'
          : 'Try a new set when you’re ready.'
        : this.zh
          ? '我们会再一起练习。'
          : 'We’ll practise this again together.';
    return {
      ...base,
      check: {
        stage: 'results',
        numeral: 0,
        index: 0,
        count: last?.results.length ?? ids.length,
        dots: [],
        passed: record.passed,
        mastered: record.passed,
        screenComplete: !!this.state.done[page.id],
        retry: !record.passed,
        summary: [head, score, tail].filter(Boolean).join(' '),
        note,
        rows: (last?.results ?? []).map((row, index) => ({
          index,
          ask: this.text(this.task(row.id).ask),
          correct: row.correct,
          detail: this.checkSentence(this.task(row.id), `${page.id}:a${record.attempt}:${row.id}`, row),
        })),
        prompt: '',
      },
    };
  }

  private checkFooter(index: number): FooterModel {
    const screen = this.screens[index].screen;
    const page = this.pageOf(screen.page);
    const record = this.readCheck(screen.page);
    const count = page ? this.engine.masteryItems(page, record.attempt).length : 0;
    const question = Math.min(record.q || 0, Math.max(0, count - 1));
    if (!record.finished) {
      const last = question >= count - 1;
      return {
        backLabel: this.zh ? '返回' : 'Back',
        previousDisabled: question === 0 && this.isFirstActivity(),
        primaryLabel: last
          ? record.blankAsk
            ? this.zh
              ? '仍然交卷'
              : 'Hand in anyway'
            : this.zh
              ? '交卷'
              : 'Hand in my check'
          : this.zh
            ? '下一题'
            : 'Next question',
        primaryTestId: last ? 'hand-in-check' : 'next-question',
      };
    }
    if (record.view != null) {
      return {
        backLabel: this.zh ? '返回' : 'Back',
        previousDisabled: false,
        primaryLabel: this.zh ? '全部结果' : 'All results',
        primaryTestId: 'all-results',
      };
    }
    if (!this.screenDone(index)) {
      return {
        backLabel: this.zh ? '上一屏' : 'Previous',
        previousDisabled: this.isFirstActivity(),
        primaryLabel: this.zh ? '再做一组' : 'Try a new set',
        primaryTestId: 'retry-check',
      };
    }
    return {
      backLabel: this.zh ? '上一屏' : 'Previous',
      previousDisabled: this.isFirstActivity(),
      primaryLabel: this.nextLabel(index),
      primaryTestId: 'next',
    };
  }

  private pressCheckPrimary(pageId: string): void {
    const page = this.pageOf(pageId);
    if (!page) return;
    const record = this.readCheck(pageId);
    const ids = this.engine.masteryItems(page, record.attempt);
    if (!record.finished) {
      const question = Math.min(record.q || 0, Math.max(0, ids.length - 1));
      if (question < ids.length - 1) {
        record.q = question + 1;
        this.save();
        this.emit();
        return;
      }
      this.tryHandIn(page);
      return;
    }
    if (record.view != null) {
      record.view = null;
      this.feedback = '';
      this.save();
      this.emit();
      return;
    }
    if (!record.passed && !this.state.done[pageId]) this.retryCheck();
  }

  private tryHandIn(page: NonNullable<ReturnType<CourseSession['pageOf']>>): void {
    const record = this.readCheck(page.id);
    const ids = this.engine.masteryItems(page, record.attempt);
    const blank = ids
      .map((id, index) => (this.checkAnswered(this.task(id), `${page.id}:a${record.attempt}:${id}`) ? -1 : index + 1))
      .filter((index) => index > 0);
    if (blank.length && !record.blankAsk) {
      record.blankAsk = true;
      const list =
        blank.length === 1
          ? `Question ${blank[0]} is`
          : `Questions ${blank.slice(0, -1).join(', ')} and ${blank[blank.length - 1]} are`;
      this.feedbackTone = 'hint';
      this.feedback = this.zh
        ? `还有题没做：${blank.join('、')}。可以回去试一试，也可以直接交。`
        : `${list} still blank. You can go back and try, or hand it in as it is.`;
      this.log('check_blank_warn', { page: page.id, blank });
      this.save(true);
      this.emit();
      return;
    }
    record.blankAsk = false;
    this.handIn(page);
  }

  private handIn(page: NonNullable<ReturnType<CourseSession['pageOf']>>): void {
    const record = this.readCheck(page.id);
    const ids = this.engine.masteryItems(page, record.attempt);
    const results = ids.map((id) => {
      const task = this.task(id);
      const key = `${page.id}:a${record.attempt}:${id}`;
      const graded = this.gradeItem(task, key);
      return {
        id,
        correct: !!graded.correct,
        writing: id === page.writing,
        explanation: graded.correct ? '' : graded.explanation,
        zh: graded.zh,
      };
    });
    const mastery = this.engine.masteryPass(results);
    record.finished = true;
    record.passed = record.passed || mastery.passed;
    record.view = null;
    record.history.push({
      attempt: record.attempt,
      results,
      score: mastery.score,
      total: mastery.total,
      passed: mastery.passed,
    });
    this.log('check_done', { page: page.id, score: mastery.score, passed: mastery.passed });
    if (mastery.passed || record.attempt >= 1) this.state.done[page.id] = true;
    if (!mastery.passed && page.skill) this.checkFailed(page.skill);
    this.feedback = '';
    this.feedbackTone = 'neutral';
    this.save(true);
    this.emit();
  }

  private buildBlocked(task: AlexTask): void {
    this.feedbackTone = 'hint';
    this.feedback = 'Build it with the word cards below first.';
    this.log('next_blocked', { task: task.id });
    this.emit();
  }

  private editCheck(task: AlexTask, key: string): void {
    const taskState = this.taskState(key);
    const graded = this.gradeItem(task, key);
    taskState.tries += 1;
    this.log('task_try', { task: task.id, ok: graded.correct });
    if (graded.correct) {
      this.finish(task, key, 'done');
      return;
    }
    if (taskState.tries >= 2) {
      this.finish(task, key, 'shown');
      return;
    }
    const text = this.engine.stripPictures(regionText(this.state.regions[key])).trim();
    const diagnosisId = this.analyzer.diagnose(text, task.coach?.diagnose ?? [], {
      answer: task.answer_text,
      original: task.start || task.text,
    });
    const diagnosis = diagnosisId ? this.config.coach?.diagnostics?.[diagnosisId] : undefined;
    const diagnosisText = diagnosis ? this.text(diagnosis) : '';
    const explanation =
      graded.explanation && graded.explanation !== diagnosis?.en
        ? this.zh && graded.zh
          ? graded.zh
          : graded.explanation
        : '';
    this.feedbackTone = 'incorrect';
    this.feedback = [diagnosisText, explanation].filter(Boolean).join(' ') || 'Not yet. Have another look.';
    this.save(true);
    this.emit();
  }

  private gradeItem(task: AlexTask, key: string): { correct: boolean; explanation?: string; zh?: string } {
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
    return { correct: false, explanation: 'Not quite yet. Read it again slowly. What is missing?' };
  }

  private activePractice(): { task: AlexTask; key: string; inCheck: boolean } | null {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen) return null;
    if ((screen.kind === 'task' || screen.kind === 'model_task') && screen.task) {
      return { task: this.task(screen.task), key: this.taskKey(screen), inCheck: false };
    }
    if (screen.kind === 'check') {
      const page = this.pageOf(screen.page);
      if (!page) return null;
      const record = this.readCheck(screen.page);
      if (record.finished) return null;
      const ids = this.engine.masteryItems(page, record.attempt);
      const index = Math.min(record.q || 0, Math.max(0, ids.length - 1));
      const id = ids[index];
      if (!id) return null;
      return { task: this.task(id), key: `${page.id}:a${record.attempt}:${id}`, inCheck: true };
    }
    return null;
  }

  private readCheck(pageId: string): CheckRecord {
    const raw = this.state.checks[pageId];
    if (raw && 'history' in raw && Array.isArray(raw.history) && typeof raw.attempt === 'number') {
      raw.q = raw.q ?? 0;
      raw.blankAsk = !!raw.blankAsk;
      raw.view = raw.view ?? null;
      raw.finished = !!raw.finished;
      raw.passed = !!raw.passed;
      return raw;
    }
    const record: CheckRecord = {
      attempt: 0,
      finished: false,
      passed: false,
      q: 0,
      blankAsk: false,
      view: null,
      history: [],
    };
    this.state.checks[pageId] = record;
    return record;
  }

  private writeCheck(pageId: string, record: CheckRecord): void {
    this.state.checks[pageId] = record;
  }

  private peekApply(skill: string): ApplyRecord | null {
    const raw = this.state.applies[skill];
    if (!raw || typeof raw !== 'object' || !('tries' in raw)) return null;
    const record = raw as ApplyRecord;
    record.history = record.history ?? [];
    record.tries = record.tries ?? 0;
    record.passed = !!record.passed;
    return record;
  }

  private readApply(skill: string): ApplyRecord {
    return (
      this.peekApply(skill) ??
      (this.state.applies[skill] = { tries: 0, passed: false, result: null, history: [] })
    );
  }

  private checkAnswered(task: AlexTask, key: string): boolean {
    const taskState = this.state.tasks[key] ?? { tries: 0, status: 'open' as const };
    if (task.type === 'pick') return (taskState.picked?.length ?? 0) > 0;
    if (task.type === 'tapword') return taskState.sel != null;
    const text = regionText(this.state.regions[key]).trim();
    return !!text && text !== (task.text || task.start || '').trim();
  }

  private checkSentence(task: AlexTask, key: string, row: CheckResultRow): string {
    const taskState = this.state.tasks[key] ?? { tries: 0, status: 'open' as const };
    if (task.type === 'pick') return this.gradedText(task, taskState, row.correct);
    if (row.correct) return this.zh && task.ok?.zh ? `对。${task.ok.zh}` : `Right. ${task.ok?.en ?? ''}`.trim();
    const why = this.text(task.why);
    const explanation = this.zh && row.zh ? row.zh : row.explanation;
    return this.zh ? `还不对。${explanation || why}` : `Not yet. ${explanation || why}`.trim();
  }

  private pickBlock(task: AlexTask, taskState: TaskProgress, graded: boolean, correct = false): ActivityModel['pick'] {
    const picked = taskState.picked ?? [];
    return {
      multi: !!task.multi,
      closed: graded || taskState.status !== 'open',
      hint: '',
      options: (task.lines ?? []).map((line, index) => ({
        index,
        letter: this.engine.choiceLetter(index),
        text: line,
        selected: picked.includes(index),
        wrong: (taskState.wrong ?? []).includes(index) && !graded,
        state: this.choiceVisual(index, task, taskState, graded ? { graded: true, correct } : undefined),
      })),
    };
  }

  private tapBlock(
    task: AlexTask,
    taskState: TaskProgress,
    graded: boolean,
    gradedTask?: AlexTask,
  ): ActivityModel['tapword'] {
    const tokens = this.engine.tokens(task.text ?? '');
    const targets = gradedTask
      ? (gradedTask.targets ?? []).map((target) => this.engine.locate(gradedTask.text ?? '', target))
      : [];
    return {
      words: tokens.map((token, index) => ({
        index,
        text: token.w,
        selected: graded ? targets.includes(index) : taskState.sel === index,
        wrong: graded ? taskState.sel === index && !targets.includes(index) : taskState.bad === index,
      })),
    };
  }

  private wordGroups(
    page: ReturnType<CourseSession['pageOf']>,
    task: AlexTask | null,
    storageKey: string,
    built: string[],
    miss = 0,
  ): { activeGroup: string; groups: WordGroupModel[] } {
    const spec = this.engine.gridFor(this.config, page, task);
    const tabs = spec.tabs.length ? spec.tabs : [];
    const saved = this.state.grid.tab[storageKey];
    const activeGroup = saved && tabs.includes(saved) ? saved : tabs[0] ?? '';
    const next = task?.in_order ? task.target?.[built.length] : undefined;
    const groups = tabs.map((id) => ({
      id,
      tone: id,
      label: this.tabLabel(id, task),
      words: this.tabWords(id, task, spec.level, built, miss >= 3 ? next : undefined),
    }));
    return { activeGroup, groups };
  }

  private tabLabel(id: string, task: AlexTask | null): string {
    if (id === 'task') return this.zh ? '本题词块' : 'This task';
    if (id === 'set') {
      if (this.zh) return '句子拼搭';
      return task?.set === 'connect' ? 'Connect set' : 'Sentence set';
    }
    if (id === 'myplan') return this.zh ? '我的计划' : 'My plan';
    const meta = this.config.grids?.tabs[id];
    return this.zh ? meta?.zh || meta?.label || id : meta?.label || id;
  }

  private tabWords(
    id: string,
    task: AlexTask | null,
    level: string,
    built: string[],
    focus: string | undefined,
  ): WordGroupModel['words'] {
    let texts: string[] = [];
    if (id === 'task') texts = (task?.cells ?? []).map(cellText);
    else if (id === 'set') {
      const bank = (task?.cells ?? []).map(cellText).concat(task?.distractors ?? []);
      texts = seededShuffle(bank, task?.id ?? id);
    } else {
      texts = this.engine.cellsFor(this.config, id, level === 'chunks' ? 'chunks' : 'words').map((cell) => cell.t);
    }
    const used = built.slice();
    return texts.map((text, index) => {
      const found = used.indexOf(text);
      if (found >= 0) {
        used.splice(found, 1);
        return { id: `${id}:${index}:${text}`, text, state: 'used' as const };
      }
      if (focus && text === focus) return { id: `${id}:${index}:${text}`, text, state: 'focused' as const };
      return { id: `${id}:${index}:${text}`, text };
    });
  }

  private liveCoach(draft: string, prompt: string): { nudge: string; praise: string } {
    const text = this.engine.stripPictures(draft);
    const live = this.analyzer.liveNudges(text, { mode: 'apply', prompt });
    const fill = (bucket: 'nudges' | 'praise', hit: { id: string; q?: string } | null) => {
      if (!hit) return '';
      const line = this.config.coach?.[bucket]?.[hit.id];
      if (!line) return '';
      return this.text(line).split('{q}').join(hit.q ?? '');
    };
    return { nudge: fill('nudges', live.nudge), praise: fill('praise', live.praise) };
  }

  private ensureGiven(key: string, task: AlexTask): void {
    if (!task.start || this.state.regions[key]) return;
    this.state.regions[key] = [{ t: task.start, s: 'given' }];
  }

  private appendBuildToken(key: string, cellText: string): void {
    const before = regionText(this.state.regions[key]);
    const kind = /^[.,!?]$/.test(cellText) || /^,/.test(cellText) ? 'mark' : 'phrase';
    const result = this.engine.smartInsert(before, before.length, before.length, cellText, kind);
    const segments = [...(this.state.regions[key] ?? [])];
    segments.push({ t: result.inserted, s: 'set' });
    this.state.regions[key] = segments;
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
      title: this.zh ? '今天的课就到这里。' : 'That’s today’s lesson.',
      ask: '',
      skip: null,
      hints: [],
      hintAction: null,
      coach: [],
      coachMore: false,
      feedback: this.feedback,
      feedbackTone: this.feedbackTone,
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
      this.save(true);
      this.emit();
      return;
    }
    if (this.isLessonEnd(index)) {
      this.view = 'lessonEnd';
      this.log('lesson_end');
      this.save(true);
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
    this.layoutReviewId = null;
    this.feedback = '';
    this.feedbackTone = 'neutral';
    this.log('screen');
    this.save(true);
    this.emit();
    return true;
  }

  private pickCheck(task: AlexTask, key: string): void {
    const taskState = this.taskState(key);
    const picked = (taskState.picked ?? []).slice();
    if (!picked.length) {
      this.feedbackTone = 'hint';
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
    this.feedbackTone = 'incorrect';
    this.feedback = message;
    this.log('task_try');
    this.save(true);
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
    this.save(true);
    this.emit();
  }

  private finish(task: AlexTask, key: string, status: 'done' | 'shown'): void {
    const taskState = this.taskState(key);
    taskState.status = status;
    const graded = this.gradedText(task, taskState, status === 'done');
    this.feedbackTone = status === 'done' ? 'correct' : 'revealed';
    this.feedback =
      task.type === 'pick' || (task.type === 'tapword' && status === 'shown' && (task.targets ?? []).length === 1)
        ? graded
        : status === 'done'
          ? this.affirm(this.text(task.ok) || this.text(task.why))
          : this.zh
            ? `答案在这里。${this.text(task.why)}`
            : `Here is the answer. ${this.text(task.why)}`;
    this.markPageIfTasksDone(task);
    this.log('task_done');
    this.save(true);
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
    if (kind === 'apply') return this.zh ? '检查我的写作' : 'Check my writing';
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
    if (params.get('phase1') === 'apply') this.openLayoutReview('L2-04.apply');
    if (params.get('phase2') === 'blocked') {
      this.openLesson(this.playUnit().id, 1);
      this.navigateLocal(3);
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

  private save(immediate = false): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (!immediate) {
      this.saveTimer = setTimeout(() => {
        this.saveTimer = null;
        this.writeState();
      }, 250);
      return;
    }
    this.writeState();
  }

  private writeState(): void {
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
