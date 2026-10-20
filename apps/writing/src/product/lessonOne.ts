/**
 * Lesson 1 task decisions.
 * Graders stay in Alex Engine / Analyzer. This module only sequences tries,
 * blanks, and build misses. It does not keep a second progress store.
 */

import type { AlexTask, AnalyzerApi, Bilingual, EngineApi } from './loadAlexSource';

export interface CheckResult {
  id: string;
  correct: boolean;
  writing: boolean;
  explanation?: string;
  zh?: string;
}

export interface CheckHistory {
  at: number;
  attempt: number;
  results: CheckResult[];
  score: number;
  total: number;
  passed: boolean;
}

export interface CheckRecord {
  attempt: number;
  finished: boolean;
  passed: boolean;
  history: CheckHistory[];
  q: number;
  view: number | null;
  blankAsk: boolean;
}

export interface ApplyResult {
  passed: boolean;
  checks: { label: string; met: boolean; tip?: string; zh?: string }[];
  feedback: string;
  zh?: string;
  glow?: string;
  source?: string;
  safety_flag?: boolean;
}

export interface ApplyRecord {
  tries: number;
  passed: boolean;
  movedOn?: boolean;
  result?: ApplyResult | null;
  hintLv?: number;
}

export type BuildDecision =
  | { kind: 'reject'; miss: number; speak: boolean; pulse: boolean }
  | { kind: 'grow'; built: string[]; miss: number }
  | { kind: 'done'; built: string[]; tries: number; miss: number }
  | { kind: 'retry'; built: string[]; tries: number; miss: number }
  | { kind: 'shown'; built: string[]; tries: number; miss: number };

export function readCheck(raw: Partial<CheckRecord> | undefined): CheckRecord {
  return {
    attempt: raw?.attempt ?? 0,
    finished: !!raw?.finished,
    passed: !!raw?.passed,
    history: raw?.history ?? [],
    q: raw?.q ?? 0,
    view: raw?.view ?? null,
    blankAsk: !!raw?.blankAsk,
  };
}

export function cellText(cell: string | { t?: string } | undefined): string {
  if (!cell) return '';
  return typeof cell === 'string' ? cell : cell.t ?? '';
}

/**
 * Ordered build. A wrong card does not add a try.
 * PRODUCT counts the third wrong card in a row. Alex's original counter
 * does not reset after a correct card; this helper resets the streak so
 * "in a row" matches PRODUCT.md.
 */
export function judgeBuild(input: {
  inOrder: boolean;
  target: string[];
  built: string[];
  miss: number;
  tries: number;
  cell: string;
  matches: boolean;
}): BuildDecision {
  const built = input.built.slice();
  if (input.inOrder) {
    const want = input.target[built.length];
    if (input.cell !== want) {
      const miss = input.miss + 1;
      return { kind: 'reject', miss, speak: miss === 3, pulse: miss >= 3 };
    }
  }
  built.push(input.cell);
  const miss = 0;
  if (built.length < input.target.length) return { kind: 'grow', built, miss };
  const tries = input.tries + 1;
  const sameOrder = JSON.stringify(built) === JSON.stringify(input.target);
  if (input.matches || sameOrder) return { kind: 'done', built, tries, miss };
  if (tries >= 2) return { kind: 'shown', built, tries, miss };
  return { kind: 'retry', built, tries, miss };
}

export function joinBuilt(engine: EngineApi, cells: string[]): string {
  let value = '';
  for (const cell of cells) {
    const kind = /^[.,!?;:]$/.test(cell) ? 'mark' : 'phrase';
    value = engine.smartInsert(value, value.length, value.length, cell, kind).value;
  }
  return value.trim();
}

export interface GradeText {
  correct: boolean;
  explanation: string;
  zh?: string;
}

export function gradeWriting(engine: EngineApi, analyzer: AnalyzerApi, task: AlexTask, text: string): GradeText {
  if (/_{2,}/.test(text)) {
    return { correct: false, explanation: 'Fill each ___ first.', zh: '先把每个 ___ 填上。' };
  }
  if (task.frameFill) return engine.frameFill(text, task.frameFill, task.ok);
  if (task.rules) {
    return analyzer.checkProduction(
      { check: task.rules, success: task.ok?.en, successZh: task.ok?.zh },
      text,
    );
  }
  if (task.accept?.some((item) => engine.sameText(item, text))) {
    return { correct: true, explanation: task.ok?.en ?? '', zh: task.ok?.zh };
  }
  return { correct: false, explanation: 'Not quite yet. Read it again slowly. What is missing?', zh: '还不太对。慢慢再读一遍，少了什么？' };
}

export function diagnosis(analyzer: AnalyzerApi, task: AlexTask, text: string, diagnostics?: Record<string, Bilingual>): Bilingual | null {
  const ids = task.coach?.diagnose;
  if (!ids?.length || !diagnostics) return null;
  const id = analyzer.diagnose(text, ids, { original: task.text, answer: task.answer_text, prompt: task.ask });
  return id ? diagnostics[id] ?? null : null;
}

export function blankNumbers(flags: boolean[]): number[] {
  return flags.map((answered, index) => (answered ? -1 : index + 1)).filter((n) => n > 0);
}

export function blankSentence(numbers: number[], zh: boolean): string {
  if (zh) return `还有题没做：${numbers.join('、')}。可以回去试一试，也可以直接交。`;
  if (numbers.length === 1) return `Question ${numbers[0]} is still blank. You can go back and try, or hand it in as it is.`;
  const head = numbers.slice(0, -1).join(', ');
  const tail = numbers[numbers.length - 1];
  return `Questions ${head} and ${tail} are still blank. You can go back and try, or hand it in as it is.`;
}
