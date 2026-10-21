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
  type EngineApi,
  type LevelPath,
  type PathLevel,
  type PathUnit,
  type ScreenRef,
  type StepTag,
} from './loadAlexSource';
import { gradeApply, gradeProduction, type ApplyResult } from './lessonOneGrading';

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
  built?: string[];
  misses?: number;
  text?: string;
  sel?: number | null;
  bad?: number | null;
}

export interface AssessmentAnswer { picked?: number[]; sel?: number | null; text?: string; }
export interface AssessmentState {
  passed?: boolean;
  finished?: boolean;
  attempt?: number;
  question?: number;
  blankConfirmed?: boolean;
  responses?: Record<string, Record<string, AssessmentAnswer>>;
  result?: { score:number;total:number;passed:boolean;answers:{id:string;correct:boolean;writing:boolean}[] };
}
export interface ApplyState { text:string;checks:number;passed:boolean;moveOn?:boolean;result?:ApplyResult; }
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
  checks: Record<string, AssessmentState>;
  plan: { topic: string; checks: number; result: unknown };
  applies: Record<string, ApplyState>;
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
    options: { index: number; letter: string; text: string; selected: boolean; wrong: boolean; state: 'idle'|'selected'|'correct'|'incorrect'|'revealed'|'dimmed' }[];
    hint: string;
  };
  tapword?: {
    words: { index: number; text: string; selected: boolean; wrong: boolean; state:'idle'|'selected'|'correct'|'incorrect'|'revealed'|'dimmed'; locked:boolean }[];
  };
  build?: { cells:string[]; built:string[]; expected:string; locked:boolean };
  writing?: { value:string; label:string; tip:string; type:'practice'|'apply'; locked:boolean; result?:ApplyResult };
  assessment?: { index:number; count:number; attempt:number; id:string; ask:string; kind:string; options?:{index:number;text:string;letter:string;selected:boolean}[]; words?:{index:number;text:string;selected:boolean}[]; text:string; done:boolean[]; result?:{score:number;total:number;passed:boolean;answers:{id:string;correct:boolean;writing:boolean}[]} };
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
  tasks: { id: string; label: string; status: TaskChipStatus; number: number; shown?: boolean }[];
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

export interface CourseSessionOptions {
  html: string;
  storage?: Storage;
  search?: string;
}

export class CourseSession {
  readonly config: AlexConfig;
  readonly levelPath: LevelPath;
  readonly engine: EngineApi;
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
  openNotice = '';
  returnFocus: { unitId: string; number: number } | null = null;
  /** UI receipt only. Not part of Alex course state. */
  private returnTo: { unitId: string; number: number } | null = null;

  constructor(options: CourseSessionOptions) {
    const source = loadAlexSource(options.html);
    this.config = source.config;
    this.levelPath = source.levelPath;
    this.engine = source.engine;
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
          shown: (ref.screen.kind === 'task' || ref.screen.kind === 'model_task') && !!ref.screen.task && this.state.tasks[this.taskKey(ref.screen)]?.status === 'shown',
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
          nextUp: '', // R1 removes redundant upcoming count from visible P2
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
              state: closed
                ? (task.answers?.includes(index)
                    ? (taskState.status === 'done' && picked.includes(index) ? 'correct' : 'revealed')
                    : (picked.includes(index) && taskState.status === 'shown' ? 'incorrect' : 'dimmed'))
                : wrong.includes(index) ? 'incorrect' : picked.includes(index) ? 'selected' : 'idle',
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
              selected: taskState.sel === index,
              wrong: taskState.bad === index,
              state: taskState.status === 'done'
                ? (taskState.sel === index ? 'correct' : 'dimmed')
                : taskState.status === 'shown'
                  ? ((task.targets ?? []).some(target => this.engine.locate(task.text ?? '', target) === index) ? 'revealed' : taskState.bad === index ? 'incorrect' : 'dimmed')
                  : taskState.bad === index ? 'incorrect' : taskState.sel === index ? 'selected' : 'idle',
              locked: taskState.status !== 'open',
            })),
          },
        };
      }
    }


    if (screen.kind === 'task' && screen.task) {
      const task = this.task(screen.task);
      const progress = this.taskState(this.taskKey(screen));
      if (task.type === 'build') return {
        ...base, supported:true, ask:this.text(task.ask),
        hints:(task.coach?.hints ?? []).slice(0,progress.hintLv??0).map(h=>this.text(h)),
        hintAction:this.hintAction(task,progress),
        build: {cells:(task.cells??[]).map(c=>typeof c==='string'?c:c.t),built:progress.built??[],expected:task.answer_text??'',locked:progress.status!=='open'},
      };
      if (task.frameFill || task.rules) return {
        ...base,supported:true,ask:this.text(task.ask),
        hints:(task.coach?.hints??[]).slice(0,progress.hintLv??0).map(h=>this.text(h)),
        hintAction:this.hintAction(task,progress),
        writing:{value:progress.text ?? task.start ?? task.frameFill?.frame ?? '',label:this.zh?'你的句子':'Your sentence',tip:this.text(task.why),type:'practice',locked:progress.status!=='open'}
      };
    }
    if (screen.kind === 'apply') {
      const task = this.task(page?.task ?? screen.page);
      const apply = this.applyState(screen.page);
      return {...base,supported:true,ask:this.text(task.ask),hintAction:apply.passed?null:'hint',
        writing:{value:apply.text,label:this.zh?'你的主题句':'Your topic sentences',tip:this.text(task.tip),type:'apply',locked:apply.passed||!!apply.moveOn,result:apply.result}};
    }
    if (screen.kind === 'check') {
      const state = this.assessmentState(screen.page);
      const ids=this.assessmentIds();
      const ix=Math.min(state.question??0,ids.length-1);
      const task=this.task(ids[ix]);
      const ans=this.assessmentResponse(ids[ix]);
      return {...base,supported:true,ask:this.text(task.ask),hints:[],hintAction:null,coachMore:false,
        assessment:{index:ix,count:ids.length,attempt:state.attempt??0,id:task.id,ask:this.text(task.ask),kind:task.type,
          options:task.lines?.map((line,index)=>({index,text:line,letter:this.engine.choiceLetter(index),selected:(ans.picked??[]).includes(index)})),
          words:task.type==='tapword'&&task.text?this.engine.tokens(task.text).map((w,index)=>({index,text:w.w,selected:ans.sel===index})):undefined,
          text:ans.text??task.start??task.text??'',
          done:ids.map(id=>this.assessmentAnswered(this.task(id),this.assessmentResponse(id))),
          result:state.result}
      };
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
    const page=this.screens[this.state.screen]?.screen;
    if(page?.kind==='check' && !this.canNext(this.state.screen)){
      const status=this.assessmentState(page.page);
      if(status.result&&!status.result.passed)return {backLabel:this.zh?'上一题':'Back',primaryLabel:this.zh?'再做一组':'Try a new set',primaryTestId:'assessment-retry'};
      const index=status.question??0;
      return {backLabel:this.zh?'上一题':'Back',primaryLabel:index<3?(this.zh?'下一题':'Next question'):(status.blankConfirmed?(this.zh?'继续交卷':'Hand in anyway'):(this.zh?'交卷':'Hand in my check')),primaryTestId:'assessment-action'};
    }
    if(page?.kind==='apply' && !this.canNext(this.state.screen)){
      const a=this.applyState(page.page);
      const task=this.task(this.pageOf(page.page)?.task??page.page);
      return {backLabel:this.zh?'上一页':'Previous',primaryLabel:a.checks>=(task.continue_after??2)?(this.zh?'先继续':'Move on for now'):(a.checks>0?(this.zh?'再检查':'Check again'):(this.zh?'检查写作':'Check my writing')),primaryTestId:'apply-action'};
    }
    const index = this.state.screen;
    const backLabel =
      this.zh ? '上一页' : 'Previous';
    if (!this.canNext(index)) {
      return {
        backLabel,
        primaryLabel: this.blockedLabel(index),
        primaryTestId: 'check',
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
    const screen=this.screens[this.state.screen]?.screen;
    if(screen?.kind==='check' && !this.canNext(this.state.screen)){
      const a=this.assessmentState(screen.page);
      if((a.question??0)>0){a.question=(a.question??0)-1;this.save();this.emit();return;}
    }
    if (this.state.screen === 0) return;
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
    if(screen.kind==='check'&&!this.canNext(index)){
      const state=this.assessmentState(screen.page);
      if(state.result&&!state.result.passed)this.assessmentNewSet();
      else this.assessmentPrimary();
      return;
    }
    if(screen.kind==='apply'&&!this.canNext(index)){this.applyPrimary();return;}
    if (!this.canNext(index)) {
      if (screen.kind === 'task' || screen.kind === 'model_task') {
        const task = screen.task ? this.task(screen.task) : null;
        if (task?.type === 'pick') this.pickCheck(task, this.taskKey(screen));
        else if (task?.type === 'tapword' && task.need !== 'all') this.wordCheck(task, this.taskKey(screen));
        else if (task?.frameFill || task?.rules) this.checkPracticeWriting(task, this.taskKey(screen));
        else if (task?.type === 'build') {this.feedback=this.zh?'请先拼好句子。':'Finish building your sentence first.';this.emit();}
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


  /** P4 ordered word cards; wrong taps do not use a grading attempt. */
  chooseBuild(cellIndex:number):void {
    const screen=this.screens[this.state.screen]?.screen;
    if(screen?.kind!=='task'||!screen.task)return;
    const task=this.task(screen.task);
    if(task.type!=='build')return;
    const progress=this.taskState(this.taskKey(screen));
    if(progress.status!=='open')return;
    const cell=task.cells?.[cellIndex];
    const chosen=typeof cell==='string'?cell:cell?.t;
    if(!chosen)return;
    progress.built=progress.built??[];
    const target=task.target??[];
    if(task.in_order && chosen!==target[progress.built.length]){
      progress.misses=(progress.misses??0)+1;
      if(progress.misses%3===0)this.feedback=this.text(task.why)||'Look at the next word.';
      this.save();this.emit();return;
    }
    progress.misses=0;
    progress.built.push(chosen);
    if(progress.built.length>=target.length) {
      const composed=progress.built.reduce((text,value)=>this.engine.smartInsert(text,text.length,text.length,value,/^[.!?]/.test(value)?'mark':'phrase').value,'');
      progress.tries++;
      if(this.engine.norm(composed).toLowerCase()===this.engine.norm(task.answer_text??'').toLowerCase() || JSON.stringify(progress.built)===JSON.stringify(target)){
        this.finish(task,this.taskKey(screen),'done');return;
      }
      if(progress.tries>=2){this.finish(task,this.taskKey(screen),'shown');return;}
      progress.built=[];
      this.feedback=this.text(task.why);
    }
    this.save();this.emit();
  }
  resetBuild():void {
    const screen=this.screens[this.state.screen]?.screen;
    if(!screen?.task)return;
    const item=this.taskState(this.taskKey(screen));
    if(item.status==='open'){item.built=[];this.save();this.emit();}
  }
  setWriting(value:string):void {
    const screen=this.screens[this.state.screen]?.screen;
    if(!screen)return;
    if(screen.kind==='apply'){
      const a=this.applyState(screen.page);if(a.passed||a.moveOn)return;
      a.text=value;
    }else if(screen.task){
      const p=this.taskState(this.taskKey(screen));if(p.status!=='open')return;p.text=value;
    }
    this.save();this.emit();
  }
  private checkPracticeWriting(task:AlexTask,key:string):void {
    const progress=this.taskState(key);
    if(progress.status!=='open')return;
    const result=gradeProduction(task,progress.text??task.start??'',this.engine);
    progress.tries++;
    if(result.correct){this.finish(task,key,'done');return;}
    if(progress.tries>=2){this.finish(task,key,'shown');return;}
    this.feedback=this.zh?(result.zh??result.explanation):result.explanation;
    this.save();this.emit();
  }
  private applyState(id:string):ApplyState {
    return this.state.applies[id]??(this.state.applies[id]={text:'',checks:0,passed:false});
  }
  private applyPrimary():void {
    const screen=this.screens[this.state.screen].screen;
    const a=this.applyState(screen.page);
    const task=this.task(this.pageOf(screen.page)?.task??screen.page);
    if(a.checks>=(task.continue_after??2)){
      a.moveOn=true;this.state.done[screen.page]=true;
      this.feedback=this.zh?'你可以先继续，之后回来修改。':'You can move on for now and return later.';
      this.save();this.emit();return;
    }
    const words=a.text.match(/[A-Za-z0-9']+/g)??[];
    const cjk=(a.text.match(/[\u3400-\u9fff]/g)??[]).length;
    if(words.length<3||cjk/Math.max(1,a.text.length)>.3){
      this.feedback=this.zh?'先多写一些英文句子。':'Write a little first, in English.';
      this.emit();return;
    }
    a.checks++;
    a.result=gradeApply(a.text);
    if(a.result.correct){a.passed=true;this.state.done[screen.page]=true;this.feedback=this.zh?'很好，三个主题句都满足要求。':'Your three topic sentences meet the criteria.';}
    else this.feedback=a.result.checks.find(x=>!x.passed)?.tip??'Check your sentences.';
    this.log('apply_checked',{passed:a.passed,checks:a.checks});
    this.save();this.emit();
  }

  private assessmentState(id:string):AssessmentState {
    return this.state.checks[id]??(this.state.checks[id]={attempt:0,question:0,responses:{}});
  }
  private assessmentIds():string[] {
    const page=this.pageOf(this.screens[this.state.screen].screen.page);
    return page?this.engine.masteryItems(page,this.assessmentState(page.id).attempt??0):[];
  }
  private assessmentResponse(id:string):AssessmentAnswer {
    const page=this.screens[this.state.screen].screen.page;
    const state=this.assessmentState(page);
    const attempt=String(state.attempt??0);
    state.responses=state.responses??{};
    state.responses[attempt]=state.responses[attempt]??{};
    return state.responses[attempt][id]??(state.responses[attempt][id]={});
  }
  private assessmentAnswered(task:AlexTask,a:AssessmentAnswer):boolean {
    if(task.type==='pick')return !!a.picked?.length;
    if(task.type==='tapword')return a.sel!=null;
    return !!(a.text?.trim()) && a.text?.trim()!==task.start?.trim();
  }
  assessmentPick(index:number):void {
    const screen=this.screens[this.state.screen].screen;if(screen.kind!=='check')return;
    if(this.assessmentState(screen.page).result)return;
    const task=this.task(this.assessmentIds()[this.assessmentState(screen.page).question??0]);
    const a=this.assessmentResponse(task.id);
    if(task.multi) {a.picked=a.picked??[];a.picked=a.picked.includes(index)?a.picked.filter(i=>i!==index):[...a.picked,index];}
    else a.picked=[index];
    this.save();this.emit();
  }
  assessmentTap(index:number):void {
    const screen=this.screens[this.state.screen].screen;if(screen.kind!=='check')return;
    if(this.assessmentState(screen.page).result)return;
    const task=this.task(this.assessmentIds()[this.assessmentState(screen.page).question??0]);
    const a=this.assessmentResponse(task.id);a.sel=a.sel===index?null:index;this.save();this.emit();
  }
  assessmentText(value:string):void {
    const screen=this.screens[this.state.screen].screen;if(screen.kind!=='check'||this.assessmentState(screen.page).result)return;
    const id=this.assessmentIds()[this.assessmentState(screen.page).question??0];
    this.assessmentResponse(id).text=value;this.save();this.emit();
  }
  assessmentNavigate(index:number):void {
    const screen=this.screens[this.state.screen].screen;if(screen.kind!=='check')return;
    this.assessmentState(screen.page).question=Math.max(0,Math.min(3,index));this.save();this.emit();
  }
  assessmentNewSet():void {
    const screen=this.screens[this.state.screen].screen;if(screen.kind!=='check')return;
    const state=this.assessmentState(screen.page);
    if(state.result?.passed)return;
    state.attempt=(state.attempt??0)+1;state.question=0;state.blankConfirmed=false;state.result=undefined;
    this.feedback='';this.save();this.emit();
  }
  private assessmentPrimary():void {
    const screen=this.screens[this.state.screen].screen;
    const state=this.assessmentState(screen.page);
    const ids=this.assessmentIds();
    if((state.question??0)<ids.length-1){state.question=(state.question??0)+1;this.save();this.emit();return;}
    const blank=ids.map((id,index)=>!this.assessmentAnswered(this.task(id),this.assessmentResponse(id))?index+1:0).filter(Boolean);
    if(blank.length&&!state.blankConfirmed){
      state.blankConfirmed=true;
      this.feedback=(this.zh?'未完成：':'Unanswered questions: ')+blank.join(', ')+(this.zh?'。再次交卷可以跳过。':'. Hand in again to continue.');
      this.save();this.emit();return;
    }
    const results=ids.map((id,index)=>{
      const task=this.task(id),a=this.assessmentResponse(id);
      const correct=task.type==='pick'?this.engine.choiceGrade(task,a.picked??[]).correct:
        task.type==='tapword'?(task.targets??[]).some(t=>this.engine.locate(task.text??'',t)===a.sel):
        gradeProduction(task,a.text??'',this.engine).correct;
      return {id,correct,writing:index===ids.length-1};
    });
    const grade=this.engine.masteryPass(results);
    state.result={score:grade.score,total:grade.total,passed:grade.passed,answers:results};
    state.passed=!!state.passed||grade.passed;
    state.finished=grade.passed||(state.attempt??0)>=1;
    if(state.finished)this.state.done[screen.page]=true;
    this.feedback=grade.passed?(this.zh?'通过了这次小测。':'You passed this check.'):(this.zh?'还需要再练习。':'Not yet.')+' '+grade.score+' of '+grade.total+'.';
    this.log('assessment_submitted',{attempt:state.attempt,passed:grade.passed,score:grade.score});
    this.save();this.emit();
  }

  pick(index: number): void {
    const screen = this.screens[this.state.screen]?.screen;
    if (!screen?.task) return;
    const task = this.task(screen.task);
    if (task.type !== 'pick') return;
    const key = this.taskKey(screen);
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
    if (!screen?.task) return;
    const task = this.task(screen.task);
    if (task.type !== 'tapword' || task.need === 'all') return;
    const taskState = this.taskState(this.taskKey(screen));
    if (taskState.status !== 'open') return;
    taskState.sel = taskState.sel === index ? null : index;
    taskState.bad = null;
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
      task.type === 'pick' || (task.type === 'tapword' && status === 'shown' && (task.targets ?? []).length === 1)
        ? graded
        : status === 'done'
          ? this.affirm(this.text(task.ok) || this.text(task.why))
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
