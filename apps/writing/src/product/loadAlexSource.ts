/**
 * Loads Alex's product data and the original Engine from
 * `apps/writing/source/alex-original.html`.
 *
 * The Engine function is the prototype source, evaluated as-is.
 * It is not a rewritten scorer.
 */

export interface Bilingual {
  en?: string;
  zh?: string;
}

export type GridCell = string | { t: string; zh?: string; pic?: string };

export interface FrameFillSpec {
  frame: string;
  blanks: { label: string; min_words: number }[];
  vagueLast?: boolean;
}

export interface AlexTask {
  id: string;
  type: string;
  ask?: Bilingual | string;
  lines?: string[];
  answers?: number[];
  multi?: boolean;
  any?: boolean;
  text?: string;
  need?: string;
  targets?: { at: string; occurrence?: number }[];
  why?: Bilingual;
  ok?: Bilingual;
  coach?: {
    hints?: Bilingual[];
    options?: Bilingual[];
    words?: Record<string, Bilingual>;
    diagnose?: string[];
  };
  fields?: string[];
  in_order?: boolean;
  cells?: GridCell[];
  target?: string[];
  answer_text?: string;
  distractors?: string[];
  frameFill?: FrameFillSpec;
  rules?: Record<string, unknown>;
  grid?: { level?: string; tabs?: string[] };
  criteria?: string[];
  tip?: Bilingual;
  continue_after?: number;
  apply?: boolean;
  set?: string;
}

export interface AlexScreen {
  id: string;
  step: string;
  kind: string;
  page: string;
  task?: string;
  title?: Bilingual | string;
  min?: number;
  template: string;
  params?: { body?: string; skip_offer?: boolean; layout?: string; pick?: string };
  coach?: { arrive?: Bilingual; beats?: Bilingual[] };
  fields?: string[];
}

export interface AlexLesson {
  id?: string;
  n: number;
  title: Bilingual | string;
  goal?: Bilingual | string;
  short?: boolean | string;
  min?: number;
  screens: AlexScreen[];
}

export interface PlanSlot {
  field: string;
  label: string;
  zh?: string;
  ph?: string;
  part?: string;
}

export interface AlexPage {
  id: string;
  kind: string;
  skill?: string;
  title?: Bilingual | string;
  teach?: Bilingual | string;
  tasks?: string[];
  task?: string;
  grid?: { level?: string; tabs?: string[] };
  pool?: string[];
  writing?: string;
  auto_per_attempt?: number;
  slots?: PlanSlot[];
}

export interface GridTab {
  label?: string;
  zh?: string;
  color?: string;
  words?: { t: string; zh?: string }[];
  chunks?: { t: string; zh?: string }[];
}

export interface AlexSkill {
  id: string;
  short?: string;
  title?: string;
  zh_title?: string;
  example?: { weak?: string; strong?: string };
}

export interface StepTag {
  id: string;
  skill?: string;
  label?: Bilingual | string;
  title?: Bilingual | string;
  screens: AlexScreen[];
}

export interface ScreenRef {
  lesson: AlexLesson;
  li: number;
  k: number;
  step: StepTag;
  si: number;
  n: number;
  screen: AlexScreen;
}

export interface AlexConfig {
  lessons: AlexLesson[];
  pages: AlexPage[];
  tasks: AlexTask[];
  skills: AlexSkill[];
  step_tags?: StepTag[];
  unit_goals?: Bilingual[];
  unit?: { skill_skip?: { merge_below_min?: number } };
  grids?: { tabs: Record<string, GridTab> };
}

export interface PathLesson {
  n: number;
  kind?: string;
  title: Bilingual;
  min?: number;
  pages?: number;
  skills?: string[];
}

export interface PathUnit {
  id: string;
  type: string;
  title: Bilingual;
  playable?: boolean;
  level?: string;
  prereq: string[];
  embeds?: string[];
  min?: number;
  lessons: PathLesson[];
}

export interface PathLevel {
  id: string;
  name: Bilingual;
  grade?: Bilingual;
  current?: boolean;
  units: PathUnit[];
  lessons?: number;
  embedded_skill_units?: string[];
}

export interface LevelPath {
  current_level: string;
  current_unit: string;
  levels: PathLevel[];
}

export interface EngineApi {
  screens: (config: AlexConfig) => ScreenRef[];
  stepTags: (config: AlexConfig) => StepTag[];
  lessonIds: (config: AlexConfig) => { id?: string; n: number; screens: string[] }[];
  lessonMap: (config: AlexConfig, lessons?: { screens: (string | AlexScreen)[] }[]) => number[];
  effectiveLessons: (
    config: AlexConfig,
    skippedSteps: Record<string, boolean>,
  ) => { id?: string; n: number; title?: Bilingual | string; screens: string[]; min: number }[];
  taskById: (config: AlexConfig, id: string) => AlexTask | null;
  skillById: (config: AlexConfig, id: string) => AlexSkill | null;
  choiceGrade: (
    task: AlexTask,
    picked: number[],
  ) => { correct: boolean; right: number; wrong: number; need: number };
  choiceLetter: (index: number) => string;
  locate: (text: string, target: { at: string; occurrence?: number }) => number;
  tokens: (text: string) => { w: string; start: number; end: number }[];
  skipMode: (status: string, allow: boolean) => 'auto' | 'offer' | 'none';
  stripPictures: (text: string) => string;
  pageById: (config: AlexConfig, id: string) => AlexPage | null;
  smartInsert: (
    value: string,
    start: number,
    end: number,
    insert: string,
    kind: string,
  ) => { value: string; caret: number };
  sameText: (a: string, b: string) => boolean;
  norm: (value: string) => string;
  frameFill: (
    text: string,
    frame: FrameFillSpec,
    ok?: Bilingual,
  ) => { correct: boolean; explanation: string; zh?: string };
  gridFor: (
    config: AlexConfig,
    page: AlexPage | null,
    task: AlexTask | null,
  ) => { level: string; tabs: string[]; locked: boolean; collapsed: boolean };
  cellsFor: (config: AlexConfig, tabId: string, level: string) => { t: string; zh?: string }[];
  masteryItems: (page: AlexPage, attempt: number) => string[];
  masteryPass: (answers: { correct?: boolean; writing?: boolean }[]) => {
    auto_correct: number;
    auto_total: number;
    writing_correct: boolean;
    score: number;
    total: number;
    passed: boolean;
  };
}

export interface ApplyCheck {
  label: string;
  met: boolean;
  tip?: string;
  zh?: string;
}

export interface AnalyzerApi {
  checkApply: (
    skillId: string,
    text: string,
  ) => {
    passed: boolean;
    checks: ApplyCheck[];
    feedback: string;
    zh?: string;
    glow?: string;
    source?: string;
  };
  checkProduction: (
    item: { check?: AlexTask['rules']; success?: string; successZh?: string },
    answer: string,
  ) => { correct: boolean; explanation: string; zh?: string };
  wordCount: (text: string) => number;
  cjkRatio: (text: string) => number;
  safetyScreen: (text: string) => boolean;
}

export interface AlexSource {
  config: AlexConfig;
  levelPath: LevelPath;
  engine: EngineApi;
  analyzer: AnalyzerApi;
}

const cache = new Map<string, AlexSource>();

export function extractAssignedJson(source: string, name: string): unknown {
  const marker = `var ${name} = `;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Alex source is missing ${name}`);
  let index = start + marker.length;
  if (source[index] !== '{') throw new Error(`${name} is not a JSON object`);
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return JSON.parse(source.slice(index, cursor + 1)) as unknown;
    }
  }
  throw new Error(`Alex source has an unclosed ${name} object`);
}

const RUNTIME_END =
  "if (typeof module !== 'undefined' && module.exports) module.exports = { Engine: Engine, Prov: Prov };";

export function loadRuntime(source: string): { engine: EngineApi; analyzer: AnalyzerApi } {
  const start = source.indexOf('var Analyzer = (function () {');
  const end = source.indexOf(RUNTIME_END);
  const analyzerEnd = source.indexOf('</script>', start);
  const engineStart = source.indexOf('var Engine = (function () {', analyzerEnd);
  if (start < 0 || end < 0 || analyzerEnd < 0 || engineStart < 0 || engineStart >= end) {
    throw new Error('Alex Engine script was not found in the source HTML');
  }
  // Analyzer and Engine live in separate script tags. Concatenate the two bodies.
  const script = `${source.slice(start, analyzerEnd)}\n${source.slice(engineStart, end)}`;
  const factory = new Function(`${script}\nreturn { Engine: Engine, Analyzer: Analyzer };`) as () => {
    Engine: EngineApi;
    Analyzer: AnalyzerApi;
  };
  const runtime = factory();
  return { engine: runtime.Engine, analyzer: runtime.Analyzer };
}

export function loadEngine(source: string): EngineApi {
  return loadRuntime(source).engine;
}

export function loadAlexSource(html: string): AlexSource {
  const cached = cache.get(html);
  if (cached) return cached;
  const config = extractAssignedJson(html, 'UNIT_CONFIG') as AlexConfig;
  const levelPath = extractAssignedJson(html, 'LEVEL_PATH') as LevelPath;
  for (const level of levelPath.levels) {
    for (const unit of level.units) unit.level = level.id;
  }
  const runtime = loadRuntime(html);
  const loaded = { config, levelPath, engine: runtime.engine, analyzer: runtime.analyzer };
  cache.set(html, loaded);
  return loaded;
}

export function bilingual(value: Bilingual | string | null | undefined, zh: boolean): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (zh && value.zh) return value.zh;
  return value.en ?? '';
}
