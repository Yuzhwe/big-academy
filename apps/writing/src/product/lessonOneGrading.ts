import type { AlexTask, EngineApi } from './loadAlexSource';

export interface GradeResult { correct: boolean; explanation: string; zh?: string; }
type PatternRule = { re: string; msg?: string; zh?: string };
type WordTask = AlexTask & {
  frameFill?: { frame: string; blanks: { min_words: number; label: string }[]; vagueLast?: boolean };
  rules?: { mustInclude?: PatternRule[]; mustNotMatch?: PatternRule[]; minWords?: number; stripRe?: string; notVague?: boolean; capital?: boolean; endPunct?: boolean; noRunOn?: boolean };
  start?: string;
};

/** Evaluates the authored task schema, preserving the original Engine.frameFill implementation. */
export function gradeProduction(task: WordTask, value: string, engine: EngineApi): GradeResult {
  const fail = (en: string, zh: string): GradeResult => ({correct:false,explanation:en,zh});
  if (task.frameFill) return engine.frameFill(value, task.frameFill, task.ok);
  const text = engine.norm(value);
  const rules = task.rules;
  if (!rules) {
    return fail('This task has no authored writing grader.', '本题没有配置写作判题规则。');
  }
  if (text.includes('___')) return fail('Fill each ___ first.', '请先填好每一个 ___。');
  const words = text.match(/[A-Za-z0-9']+/g) ?? [];
  if (words.length < 2) return fail('Write a little more first.', '请再多写几个词。');
  const cjk = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  if (cjk / Math.max(1,text.length) > .3) return fail('Write this answer in English.', '请用英语完成这道题。');
  for (const r of rules.mustInclude ?? []) if (!new RegExp(r.re,'i').test(text)) return fail(r.msg ?? 'One important part is missing.',r.zh ?? '还缺少一个重要部分。');
  for (const r of rules.mustNotMatch ?? []) if (new RegExp(r.re,'i').test(text)) return fail(r.msg ?? 'Check the wording.',r.zh ?? '请检查句子表达。');
  if (rules.noRunOn && /,[ ]*(?:we|i|he|she|they|it)[ ]/i.test(text) && !/,\s*(and|so|but)\b/i.test(text)) return fail('Two complete ideas need the right joining word or punctuation.', '两个完整意思需要正确的连接词或标点。');
  const effective = rules.stripRe ? text.replace(new RegExp(rules.stripRe,'i'),'') : text;
  const effectiveWords = effective.match(/[A-Za-z0-9']+/g) ?? [];
  if (rules.minWords && effectiveWords.length < rules.minWords) return fail('Write a little more detail.', '请多写一些细节。');
  if (rules.notVague && /^(it is|it's|so |very )*(good|bad|nice|fun|cool|great)\.?$/i.test(effective.trim())) return fail('Please use a specific detail.', '请补充一个具体细节。');
  if (rules.capital && !/^[\"'“‘(]*[A-Z]/.test(text)) return fail('Start with a capital letter.', '句首请使用大写字母。');
  if (rules.endPunct && !/[.!?][\"'”’)]?$/.test(text)) return fail('Finish with a full stop, exclamation mark, or question mark.', '结尾请加上标点符号。');
  return {correct:true,explanation:task.ok?.en ?? 'Correct.',zh:task.ok?.zh};
}
const opinion = /\b(i think|i believe|i feel|i know|in my opinion|should|shouldn't|must|ought to|is better|are better|would be better|the best|is the best|i agree|i disagree|it is important|we need|needs? to)\b/i;
function similarity(a:string,b:string) {
  const aSet = new Set((a.toLowerCase().match(/[a-z]+/g)??[]));
  const bSet = new Set((b.toLowerCase().match(/[a-z]+/g)??[]));
  const common=[...aSet].filter(x=>bSet.has(x)).length;
  return common / Math.max(1, aSet.size+bSet.size-common);
}
export interface ApplyResult {correct:boolean; checks:{name:string; passed:boolean; tip:string}[]; lines:string[]; }
export function gradeApply(value:string):ApplyResult {
  let lines=value.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  if(lines.length===1)lines=(value.match(/[^.!?]+[.!?]*/g)??[]).map(x=>x.trim()).filter(Boolean);
  const garden=lines.filter(x=>/\bgarden\b/i.test(x));
  const valid=garden.filter(x=>opinion.test(x));
  const distinct=valid.length>=3 && valid.every((a,i)=>valid.every((b,j)=>i===j||similarity(a,b)<.8));
  const checks=[
    {name:'Three topic sentences',passed:lines.length>=3,tip:'Write three sentences, one per line.'},
    {name:'Each one tells an opinion',passed:valid.length>=3,tip:'Use an opinion expression in each line.'},
    {name:'Each one is about a school garden',passed:garden.length>=3,tip:'Keep all three sentences about the school garden.'},
    {name:'The three sentences are different',passed:distinct,tip:'Try three different ways to state your opinion.'},
  ];
  return {correct:checks.every(x=>x.passed),checks,lines};
}
