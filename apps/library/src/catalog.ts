import registry from '../../writing/contracts/components.json';

export const catalog = [
  { key: 'choice', id: 'BA-UI-003', name: '选择题', en: 'BAChoice', category: '基础交互', description: '从做出选择，到看见反馈。清楚呈现每一种作答状态。', anatomy: '选项行 → 状态图标 → 字母标记 → 内容。状态由调用方传入，组件本身不评分。', states: ['default', 'selected', 'correct', 'correctUnselected', 'wrong', 'dim', 'disabled'], story: 'primitives-bachoice--single-interactive' },
  { key: 'button', id: 'BA-UI-001', name: '按钮', en: 'BAButton', category: '基础交互', description: '让下一步清晰可见。统一主要操作、次要操作与等待反馈。', anatomy: '固定命中区域 → 可缩放视觉层 → 图标与标签。等待中保留可访问名称。', states: ['default', 'hover', 'pressed', 'focus', 'disabled', 'busy'], story: 'primitives-babutton--default' },
  { key: 'tabs', id: 'BA-UI-002', name: '标签导航', en: 'BATabs', category: '基础交互', description: '在相关内容之间切换，始终知道自己所在的位置。', anatomy: 'TabList → Tab → 对应 TabPanel。方向键切换焦点与选中项。', states: ['default', 'hover', 'pressed', 'focus', 'disabled'], story: 'primitives-batabs--level-navigation' },
  { key: 'topbar', id: 'BA-WR-001', name: '课程顶栏', en: 'LessonTopBar', category: 'Writing', description: '把课程身份、当前进度与返回路径放在一个清晰的框架中。', anatomy: '左侧返回与课程标题；居中 Activity Screen 进度；右侧留空。', states: ['default', 'long', 'done', 'locked', 'skipped'], story: 'writing-shell-lessontopbar--desktop' },
  { key: 'lesson', id: 'BA-WR-005', name: '课程卡片', en: 'StairLessonCard', category: 'Writing', description: '学习路径卡片统一为可进入、已完成和未解锁三种视觉状态。', anatomy: '课号印章 → 标题与时长 → 共享 BAButton。解锁与课程数据由产品提供。', states: ['start', 'review', 'locked'], story: 'writing-path-stairlessoncard--enterable' },
  { key: 'unit', id: 'BA-WR-007', name: '单元卡片', en: 'StairUnitCard', category: 'Writing', description: '同一纸张折角、标题和全圆角课程信息标签，在组件库与阶梯页共用。', anatomy: 'UNIT 编号 → 标题 → 课时信息 Pill → 目标段落 → 连续纸张折角。', states: ['default','long'], story: 'writing-path-stairunitcard--default' },
  { key: 'words', id: 'BA-WR-003', name: '词卡面板', en: 'WordGrid', category: 'Writing', description: '按类别找到表达所需的词，让写作一步一步展开。', anatomy: '连接式分类标签 → 词卡区域。切换类别不执行插入，点击词卡才发出插入事件。', states: ['default', 'selected', 'used', 'disabled', 'correct', 'incorrect', 'hint', 'shown', 'hover', 'pressed', 'focus'], story: 'writing-activities-wordgrid--multi-group' },
] as const;
export type Entry = typeof catalog[number];
export type ComponentKey = Entry['key'];
export type Contract = {
  id: string; name: string; status: string; visualStatus?: string; implementation?: string;
  props: Record<string, string>; events?: Record<string, string>; states: string[];
  requirements?: string[]; layoutOwner?: string; runtimeEvidence?: string | null; notes?: string;
};
export function contractFor(entry: Entry): Contract {
  const contract = registry.components.find(item => item.id === entry.id);
  if (!contract) throw new Error(`Missing contract ${entry.id}`);
  return contract as unknown as Contract;
}
export function statusFor(entry: Entry) {
  const visual = contractFor(entry).visualStatus ?? '';
  return { approved: visual === 'Approved', label: visual === 'Approved' ? '基线视觉已批准' : '待视觉评审', source: visual || '未记录' };
}
export const stateNames: Record<string, string> = {
  hover:'悬停（实际操作）', pressed:'按下（实际操作）', focus:'键盘焦点（实际操作）', incorrect:'错误', hint:'提示', shown:'系统展示答案',
  default: '默认', selected: '已选中', correct: '正确 · 已选', correctUnselected: '正确 · 未选',
  wrong: '错误', dim: '变淡', disabled: '禁用', busy: '等待中', start: 'Enterable · 可进入',
  continue: 'Enterable · 可进入', review: 'Completed · 已完成', locked: '未解锁', skipped: '已跳过',
  long: '长标题', single: '单组词卡', used: '词卡已使用',
};
export type Scene = {
  component: ComponentKey; view: 'components' | 'overview' | 'foundations' | 'review';
  mode: 'live' | 'state'; state: string; locale: 'en' | 'zh'; width: 'fit' | '320' | '390' | '560' | '768' | '834' | '1440';
  size: 36 | 50 | 70 | 90; choice: 'single' | 'multiple'; sample: 'standard' | 'long';
  variant: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost'; motion: 'system' | 'reduce'; selected: string[];
  buttonContent:'text'|'icon'|'leading'|'trailing'; layout:'hug'|'fixed'|'full'; background:'light'|'dark'|'glass';
  tabCount:'1'|'2'|'4'|'10'; tabActive:string; composition:'card'|'terrace'; currentAction:'start'|'continue'; material:'en'|'zh'; answerPhase:'open'|'checked';
  wordScenario:'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'; wordContent:'word'|'punctuation'|'emoji'|'sentence'|'mixed';
  wordTabs:'auto'|'show'|'hide'; wordCount:'1'|'4'|'10'; wordSelection:'default'|'selected'|'used'; wordEvaluation:'neutral'|'correct'|'incorrect'|'hint'|'shown'; wordInteraction:'enabled'|'disabled';
  wordSelected:string[]; wordAnswer:string[]; wordGroup:string; wordResult:'neutral'|'correct'|'incorrect'|'hint'|'shown';
};
export const defaultScene: Scene = {
  component: 'choice', view: 'components', mode: 'live', state: 'default', locale: 'en', width: 'fit',
  size: 50, choice: 'single', sample: 'standard', variant: 'primary', motion: 'system', selected: [],
  buttonContent:'text',layout:'hug',background:'light',tabCount:'4',tabActive:'L2',composition:'card',currentAction:'start',material:'en',answerPhase:'open',
  wordScenario:'A',wordContent:'word',wordTabs:'auto',wordCount:'1',wordSelection:'default',wordEvaluation:'neutral',wordInteraction:'enabled',wordSelected:[],wordAnswer:[],wordGroup:'g0',wordResult:'neutral',
};
function oneOf<T extends string>(value: string | null, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? value as T : fallback;
}
export function readScene(search: string): Scene {
  const p = new URLSearchParams(search);
  const component = oneOf(p.get('component'), catalog.map(c => c.key), 'choice');
  const entry = catalog.find(c => c.key === component)!;
  const choice = oneOf(p.get('choice'), ['single', 'multiple'], 'single');
  const selected = [...new Set((p.get('selected') ?? '').split(',').filter(s => ['a', 'b', 'c'].includes(s)))];
  return {
    component, view: oneOf(p.get('view'), ['components', 'overview', 'foundations', 'review'], 'components'),
    mode: oneOf(p.get('mode'), ['live', 'state'], 'live'),
    state: oneOf(p.get('state'), entry.states, entry.states[0]),
    locale: oneOf(p.get('locale'), ['en', 'zh'], 'en'),
    width: oneOf(p.get('width'), ['fit', '320', '390', '560', '768', '834', '1440'], 'fit'),
    size: Number(oneOf(p.get('size'), ['36', '50', '70', '90'], '50')) as Scene['size'],
    choice, sample: oneOf(p.get('sample'), ['standard', 'long'], 'standard'),
    variant: oneOf(p.get('variant'), ['primary', 'secondary', 'tertiary', 'outline', 'ghost'], 'primary'),
    motion: oneOf(p.get('motion'), ['system', 'reduce'], 'system'),
    buttonContent:oneOf(p.get('buttonContent'),['text','icon','leading','trailing'],'text'),
    layout:oneOf(p.get('layout'),['hug','fixed','full'],'hug'), background:oneOf(p.get('background'),['light','dark','glass'],'light'),
    tabCount:oneOf(p.get('tabCount'),['1','2','4','10'],'4'), tabActive:oneOf(p.get('tabActive'),Array.from({length:10},(_,i)=>`L${i}`),'L2'),
    composition:oneOf(p.get('composition'),['card','terrace'],'card'),currentAction:oneOf(p.get('currentAction'),['start','continue'],'start'),
    material:oneOf(p.get('material'),['en','zh'],'en'),answerPhase:oneOf(p.get('answerPhase'),['open','checked'],'open'),
    wordScenario:oneOf(p.get('wordScenario'),['A','B','C','D','E','F','G','H'],'A'), wordContent:oneOf(p.get('wordContent'),['word','punctuation','emoji','sentence','mixed'],'word'),
    wordTabs:oneOf(p.get('wordTabs'),['auto','show','hide'],'auto'),wordCount:oneOf(p.get('wordCount'),['1','4','10'],'1'),
    wordSelection:oneOf(p.get('wordSelection'),['default','selected','used'],'default'),wordEvaluation:oneOf(p.get('wordEvaluation'),['neutral','correct','incorrect','hint','shown'],'neutral'),
    wordInteraction:oneOf(p.get('wordInteraction'),['enabled','disabled'],'enabled'),wordGroup:oneOf(p.get('wordGroup'),Array.from({length:10},(_,i)=>`g${i}`),'g0'),
    wordSelected:[...new Set((p.get('wordSelected')??'').split(',').filter(v=>/^g\d-w\d{1,2}$/.test(v)))].slice(0,100),
    wordAnswer:(p.get('wordAnswer')??'').split(',').filter(v=>/^g\d-w\d{1,2}$/.test(v)).slice(0,100),
    wordResult:oneOf(p.get('wordResult'),['neutral','correct','incorrect','hint','shown'],'neutral'),
    selected: choice === 'single' ? selected.slice(0, 1) : selected,
  };
}
export function sceneSearch(scene: Scene): string {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(scene)) p.set(key, Array.isArray(value) ? value.join(',') : String(value));
  return `?${p.toString()}`;
}
export const choiceOptions = (sample: Scene['sample']) => [
  { id: 'a', letter: 'A', text: 'Gardens have plants.' },
  { id: 'b', letter: 'B', text: 'Our school should have a garden for two big reasons.' },
  { id: 'c', letter: 'C', text: sample === 'long' ? 'I think a garden gives every student a quiet place to learn, grow, and spend time together after school, while helping us understand the natural world around us.' : 'There are flowers in the garden.' },
];
