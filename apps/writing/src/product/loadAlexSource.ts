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
  };
  fields?: string[];
  set?: string;
  in_order?: boolean;
  cells?: (string | {t:string})[];
  target?: string[];
  answer_text?: string;
  start?: string;
  frameFill?: { frame:string; blanks:{label:string;min_words:number}[]; vagueLast?:boolean };
  rules?: { mustInclude?:{re:string;msg?:string;zh?:string}[]; mustNotMatch?:{re:string;msg?:string;zh?:string}[]; minWords?:number; stripRe?:string; notVague?:boolean; capital?:boolean; endPunct?:boolean; noRunOn?:boolean };
  apply?: boolean;
  criteria?: string[];
  tip?: Bilingual;
  continue_after?: number;
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

export interface AlexPage {
  id: string;
  kind: string;
  skill?: string;
  title?: Bilingual | string;
  teach?: Bilingual | string;
  tasks?: string[];
  task?: string;
  pool?: string[];
  auto_per_attempt?: number;
  writing?: string;
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
  norm: (text: string) => string;
  frameFill: (text:string, spec:NonNullable<AlexTask['frameFill']>, ok?:Bilingual)=> {correct:boolean;explanation:string;zh?:string};
  masteryItems: (page: AlexPage, attempt:number)=>string[];
  masteryPass: (answers:{correct:boolean;writing:boolean}[])=>{auto_correct:number;auto_total:number;writing_correct:boolean;score:number;total:number;passed:boolean};
  smartInsert: (text:string,start:number,end:number,value:string,kind:string)=>{value:string};
  cellsFor: (config:AlexConfig, tabId:string, level:string)=>{t:string}[];
}

export interface AlexSource {
  config: AlexConfig;
  levelPath: LevelPath;
  engine: EngineApi;
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

export function loadEngine(source: string): EngineApi {
  const start = source.indexOf('var Engine = (function () {');
  const endMarker =
    "if (typeof module !== 'undefined' && module.exports) module.exports = { Engine: Engine, Prov: Prov };";
  const end = source.indexOf(endMarker);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Alex Engine script was not found in the source HTML');
  }
  const script = source.slice(start, end);
  const factory = new Function(`${script}\nreturn Engine;`) as () => EngineApi;
  return factory();
}

export function loadAlexSource(html: string): AlexSource {
  const cached = cache.get(html);
  if (cached) return cached;
  const config = extractAssignedJson(html, 'UNIT_CONFIG') as AlexConfig;
  const levelPath = extractAssignedJson(html, 'LEVEL_PATH') as LevelPath;
  for (const level of levelPath.levels) {
    for (const unit of level.units) unit.level = level.id;
  }
  const loaded = { config, levelPath, engine: loadEngine(html) };
  cache.set(html, loaded);
  return loaded;
}

export function bilingual(value: Bilingual | string | null | undefined, zh: boolean): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (zh && value.zh) return value.zh;
  return value.en ?? '';
}
