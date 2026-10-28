import type { Scene } from './catalog';
import type { WordGridGroup, WordGridWord } from '../../writing/src/components/writing/WordGrid';
export const scenarios = [
  ['A','单词选择','word'], ['B','造句词块','word'], ['C','标点选择','punctuation'], ['D','Emoji 选择','emoji'],
  ['E','句子选择','sentence'], ['F','多 Tab','mixed'], ['G','提示与展示答案','word'], ['H','响应式压力测试','mixed'],
] as const;
export function scenarioPatch(id:Scene['wordScenario']):Partial<Scene> {
  return {wordScenario:id,wordContent:scenarios.find(s=>s[0]===id)![2],wordCount:id==='F'?'4':id==='H'?'10':'1',
    wordTabs:id==='F'||id==='H'?'show':'auto',wordSelected:[],wordAnswer:[],wordGroup:'g0',wordResult:'neutral',wordSelection:'default',wordEvaluation:'neutral',wordInteraction:'enabled',mode:'live',state:'default',sample:id==='H'?'long':'standard'};
}
export function wordGroups(scene:Scene):WordGridGroup[] {
  const data:Record<Scene['wordContent'],Array<[string,WordGridWord['kind']]>> = {
    word:[['We','word'],['love','word'],['gardens','word'],['.','punctuation'],['extraordinary','word']],
    punctuation:[[',','punctuation'],['.','punctuation'],['?','punctuation'],['!','punctuation']],
    emoji:[['🌱','emoji'],['🌻 🦋','emoji'],['Grow together 🌿','emoji']],
    sentence:[['Gardens help us learn.','sentence'],['A school garden gives every student a quiet place to learn about plants, grow vegetables, and spend time with friends after a busy day at school.','sentence'],['我们一起照顾校园里的植物，也在花园里学习如何观察自然、互相帮助并分享自己的发现。','sentence']],
    mixed:[['We','word'],[',','punctuation'],['🌱 🦋','emoji'],['We learn and grow together in a school garden, sharing ideas and discovering something new every day.','sentence']],
  };
  let rows=data[scene.wordContent];
  if(scene.wordScenario==='H') rows=[...rows,['Supercalifragilisticexpialidocious'.repeat(4),'word'],...Array.from({length:16},(_,i)=>[`word${i+1}`, 'word'] as [string,WordGridWord['kind']])];
  return Array.from({length:Number(scene.wordCount)},(_,g)=>({id:`g${g}`,label:scene.sample==='long'?`分类 ${g+1} · A long category title for exploration`:scene.locale==='zh'?['本组词块','观点','名词','标点'][g%4]+(g>=4?` ${g+1}`:''):['Words','Opinion','Nouns','Marks'][g%4]+(g>=4?` ${g+1}`:''),
    words:rows.map(([text,kind],w)=>({id:`g${g}-w${w}`,text,kind,lang:/[\u4e00-\u9fff]/.test(text)?'zh-CN':'en'}))}));
}
