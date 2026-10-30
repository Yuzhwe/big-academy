import registry from '../../writing/contracts/components.json';

export const catalog = [
  { key: 'cloud', id: 'BA-WR-013', name: '动态天空', en: 'CloudShaderSky', category: 'Writing', description: '原始 M4 Shader 与现有轻量云朵共用的天空渲染层，自动选择渲染能力并由同一相机驱动视差。', anatomy: '天空画布或轻量云朵（二选一） → M4 漂移 → Staircase cameraX 视差；正式页面不出现调参 UI。', states: ['default'], story: 'writing-path-cloudshadersky--adaptive' },
  { key: 'choice', id: 'BA-UI-003', name: '选择题', en: 'BAChoice', category: '基础交互', description: '从做出选择，到看见反馈。清楚呈现每一种作答状态。', anatomy: '选项行 → 状态图标 → 字母标记 → 内容。状态由调用方传入，组件本身不评分。', states: ['default', 'selected', 'correct', 'correctUnselected', 'wrong', 'dim', 'disabled'], story: 'primitives-bachoice--single-interactive' },
  { key: 'button', id: 'BA-UI-001', name: '按钮', en: 'BAButton', category: '基础交互', description: '让下一步清晰可见。统一主要操作、次要操作与等待反馈。', anatomy: '固定命中区域 → 可缩放视觉层 → 图标与标签。等待中保留可访问名称。', states: ['default', 'hover', 'pressed', 'focus', 'disabled', 'busy'], story: 'primitives-babutton--default' },
  { key: 'tabs', id: 'BA-UI-002', name: '标签导航', en: 'BATabs', category: '基础交互', description: '在相关内容之间切换，始终知道自己所在的位置。', anatomy: 'TabList → Tab → 对应 TabPanel。方向键切换焦点与选中项。', states: ['default', 'hover', 'pressed', 'focus', 'disabled'], story: 'primitives-batabs--level-navigation' },
  { key: 'topbar', id: 'BA-WR-001', name: '课程顶栏', en: 'LessonTopBar', category: 'Writing', description: '把课程身份、当前进度与返回路径放在一个清晰的框架中。', anatomy: '左侧返回与课程标题；居中 Activity Screen 进度；右侧留空。', states: ['default', 'long', 'done', 'locked', 'skipped'], story: 'writing-shell-lessontopbar--desktop' },
  { key: 'lesson', id: 'BA-WR-005', name: '课程卡片', en: 'StairLessonCard', category: 'Writing', description: '学习路径卡片统一为可进入、已完成和未解锁三种视觉状态。', anatomy: '课号印章 → 标题与时长 → 共享 BAButton。解锁与课程数据由产品提供。', states: ['start', 'current', 'review', 'locked'], story: 'writing-path-stairlessoncard--enterable' },
  { key: 'unit', id: 'BA-WR-007', name: '单元卡片', en: 'StairUnitCard', category: 'Writing', description: '统一四角 16px，UNIT 18px、全圆角课时标签，与高保真阶梯页共用。', anatomy: 'UNIT 编号与课时 Pill 同行 → 标题 → 目标段落。', states: ['default','long'], story: 'writing-path-stairunitcard--default' },
  { key: 'level', id: 'BA-WR-008', name: '级别介绍卡', en: 'StairLevelIntroCard', category: 'Writing', description: '现有 .course-intro Level 卡（BA-WR-008）；composition=combo 时 Start Point 叠在顶边并微倾。橙色 Level Title Card 仍为待实现目标。', anatomy: 'Level 介绍正文（16px body）→ composition=combo 时 Start Point overlay 在顶边、tip 朝右上。', states: ['default','long'], story: null },
  { key: 'hamburger', id: 'BA-WR-004', name: '汉堡包组合', en: 'HamburgerComposition', category: 'Writing', description: '三层教学示意，可独立调整文字与宽度；Top / Bottom bun 窄于中间 Reason。', anatomy: 'Top bun → Reason → Bottom bun；每层标题与示例句子垂直居中。', states: ['default', 'long'], story: 'writing-activities-hamburgercomposition--all-three-layers' },
  { key: 'coach', id: 'BA-WR-014', name: 'Coach 文字卡片', en: 'CoachMessage', category: 'Writing', description: 'CoachMessage 文字卡（BA-WR-014）。侧栏/目录不单独展示；URL ?component=coach 重定向到 Coach Cards 合页（coach-note / coach-cards）；组件本身保留复用。', anatomy: '教学正文 → 右上角音频按钮。', states: ['orientation','hint','correct','wrong'], story:'writing-shell-coachmessage--all-states' },
  { key: 'coach-note', id: 'BA-WR-017', name: 'Coach Cards', en: 'Coach Cards', category: 'Writing', description: 'Coach Cards 合页标本（alias: coach-cards）：上 CoachMessage（BA-WR-014），下 CoachNote Highlight / Improvement（BA-WR-017）。旧 ?component=coach 重定向至此。', anatomy: 'Coach Cards → CoachMessage tones → CoachNote highlight|improvement。', states: ['highlight','improvement'], story: null },
  { key: 'coach-chat', id: 'BA-WR-018', name: 'Coach 对话列表', en: 'CoachChat', category: 'Writing', description: 'Library 探索标本：限高 Viewport 内滚动 Coach 轮次（CoachMessage + CoachNote）。新 turn 在 live edge 时锚到视口顶部附近；上滑停跟；Jump to latest；可选前置历史。纯自研最小 MessageScroller 行为，不接入 Writing 课程页。', anatomy: 'Viewport → Content → Items（orientation / Highlight / Improvement / Hint…）→ Jump control。', states: ['default'], story: null },
  { key: 'path-back', id: 'BA-WR-019', name: '回到当前', en: 'BackToCurrent', category: 'Writing', description: 'Library 标本：阶梯 path-controls 中间「回到当前」/ Back to current。Current 完全离屏才显示，回视口后隐藏，轻量 scale+fade；Solar 复用课卡 Current WebGL，低性能/回退为描边边框。不改 Writing StaircaseScene。', anatomy: 'path-controls → L arrow → Solar-wrapped Back to current (h=50) → R arrow；视口离屏检测 / 强制演示开关。', states: ['default'], story: null },
  { key: 'flag', id: 'BA-WR-011', name: 'Level 奖励旗帜', en: 'LevelRewardFlag', category: 'Writing', description: '使用逐列 Canvas 竖向正弦波；默认 3s、5 波数、3px 振幅，本地可替换图片。', anatomy: '静态旗杆 + Canvas 图像布料；逐物理像素切片，竖直位移，不添加透视与光照。', states: ['upcoming','completed'], story: 'writing-path-levelrewardflag--completed' },
  { key: 'milestone', id: 'BA-WR-006', name: 'Unit 里程碑', en: 'UnitMilestone', category: 'Writing', description: '绿色底层与金色对勾完成态，银灰未完成态的两层徽章，扫光仅完成状态启用。', anatomy: '徽章 + 对勾 + 7 秒扫光 + 点击重播。', states: ['upcoming','completed'], story: 'writing-path-unitmilestone--first-return' },
  { key: 'transition', id: 'BA-WR-012', name: '页面转场', en: 'BAPageTransition', category: 'Writing', description: 'Cross Blur 已在 Writing 路由与活动页接入，两种速度与模糊强度可调整。', anatomy: '旧画面模糊 → 中点切换 → 新画面清晰。', states: ['default'], story: 'writing-transitions-bapagetransition--staircase-to-lesson' },
  { key: 'start-point', id: 'BA-WR-015', name: '开始点', en: 'StartPoint', category: 'Writing', description: '课程开始点标牌：标题 tokens（Dosis 800 / 24 / 30）；独立预览。与 Level 卡组合见 level&composition=combo。', anatomy: '左侧圆角文案面板（右缘开放）→ 右侧切图主体与装饰组。Unit 组合已撤；Level 组合在 BA-WR-008 catalog key。', states: ['default'], story: 'writing-path-startpoint--default' },
  { key: 'notebook', id: 'BA-WR-016', name: '笔记本壳', en: 'NotebookShell', category: 'Writing', description: '竖本顶装订 / 横本左装订的笔记本外壳（NotebookShell）：仅线圈/装订孔 + 纸张框，children 填内容。主标本为壳；旧 NotebookEditor（横线+textarea）作次要对照。方向由 Library Scene 控制。', anatomy: '装订孔 + U 环线圈 → 纸张框 → children（示意：占位输入 + WordGrid）。对照：NotebookEditor 横线 + textarea。', states: ['default'], story: null },
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
  continue: 'Enterable · 可进入', current:'Current · Solar 强调（已接入待验收）', review: 'Completed · 已完成', locked: '未解锁', skipped: '已跳过',
  long: '长标题', single: '单组词卡', used: '词卡已使用',
  upcoming:'未完成 · 灰色', completed:'已完成 · 金色',
  highlight:'Highlight · 亮点', improvement:'Improvement · 改进',
};
export type Scene = {
  component: ComponentKey; view: 'components' | 'overview' | 'foundations' | 'review';
  mode: 'live' | 'state'; state: string; locale: 'en' | 'zh'; width: 'fit' | '320' | '390' | '560' | '768' | '834' | '1440';
  size: 36 | 50 | 70 | 90; choice: 'single' | 'multiple'; sample: 'standard' | 'long';
  variant: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost'; motion: 'system' | 'reduce'; selected: string[];
  buttonContent:'text'|'icon'|'leading'|'trailing'; layout:'hug'|'fixed'|'full'; background:'light'|'dark'|'glass';
  tabCount:'1'|'2'|'4'|'10'; tabActive:string; composition:'card'|'terrace'|'solo'|'combo'; currentAction:'start'|'continue'; material:'en'|'zh'; answerPhase:'open'|'checked';
  wordScenario:'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'; wordContent:'word'|'punctuation'|'emoji'|'sentence'|'mixed';
  wordTabs:'auto'|'show'|'hide'; wordCount:'1'|'4'|'10'; wordSelection:'default'|'selected'|'used'; wordEvaluation:'neutral'|'correct'|'incorrect'|'hint'|'shown'; wordInteraction:'enabled'|'disabled';
  wordSelected:string[]; wordAnswer:string[]; wordGroup:string; wordResult:'neutral'|'correct'|'incorrect'|'hint'|'shown';
  solarRayIntensity:number; solarRayLength:number; solarRayCount:number; solarBokeh:number;
  solarRimBoost:number; solarGlowSpread:number; solarBrightness:number;
  flagAmplitude:number;flagWaves:number;flagPeriod:number;flagPlaying:boolean;flagReset:number;
  solarPreset:'A'|'B'|'C'|'custom';solarBorderColor:string;solarGlowColor:string;
  wordTabAppearance:'connected';
  cloudRenderMode:'auto'|'shader'|'lightweight';cloudPreset:'clear'|'staircase';
  skyTop:string;skyBottom:string;cloudColor:string;cloudCount:number;driftSpeed:number;parallaxStrength:number;cloudCameraX:number;cloudPaused:boolean;cloudSimulateUnavailable:boolean;
  transitionDuration:number;transitionBlur:number;transitionPage:'staircase'|'lesson';
  startPointText:string;startPointFill:string;startPointStroke:string;startPointInk:string;
  orientation:'portrait'|'landscape';
  pathCurrentView:'auto'|'off'|'in';
  pathSolarFallback:boolean;
};
export const defaultScene: Scene = {
  component: 'choice', view: 'components', mode: 'live', state: 'default', locale: 'en', width: 'fit',
  size: 50, choice: 'single', sample: 'standard', variant: 'primary', motion: 'system', selected: [],
  buttonContent:'text',layout:'hug',background:'light',tabCount:'4',tabActive:'L2',composition:'card',currentAction:'start',material:'en',answerPhase:'open',
  wordScenario:'A',wordContent:'word',wordTabs:'auto',wordCount:'1',wordSelection:'default',wordEvaluation:'neutral',wordInteraction:'enabled',wordSelected:[],wordAnswer:[],wordGroup:'g0',wordResult:'neutral',
  solarRayIntensity:1.80,solarRayLength:1.26,solarRayCount:64,solarBokeh:1.12,solarRimBoost:0.74,solarGlowSpread:10,solarBrightness:1.34,
  flagAmplitude:3,flagWaves:5,flagPeriod:3,flagPlaying:true,flagReset:0,
  solarPreset:'custom',solarBorderColor:'#FFA82E',solarGlowColor:'#FFA82E',
  cloudRenderMode:'auto',cloudPreset:'staircase',skyTop:'#85DBF9',skyBottom:'#F8F4ED',cloudColor:'#FBF8F2',cloudCount:5,driftSpeed:0.8,parallaxStrength:0.06,cloudCameraX:0,cloudPaused:false,cloudSimulateUnavailable:false,
  wordTabAppearance:'connected',transitionDuration:500,transitionBlur:12,transitionPage:'staircase',
  startPointText:'',startPointFill:'#ffc24e',startPointStroke:'#715146',startPointInk:'#2f0f04',
  orientation:'portrait',
  pathCurrentView:'auto',
  pathSolarFallback:false,
};
function oneOf<T extends string>(value: string | null, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? value as T : fallback;
}
/** URL aliases → catalog keys. coach-cards and legacy coach open Coach Cards合页 (coach-note). */
export const componentAliases: Record<string, ComponentKey> = {
  'coach-cards': 'coach-note',
  'coach': 'coach-note',
};
export function resolveComponentKey(raw: string | null): ComponentKey {
  const mapped = raw && componentAliases[raw] ? componentAliases[raw] : raw;
  return oneOf(mapped, catalog.map(c => c.key), 'choice');
}
export function readScene(search: string): Scene {
  const p = new URLSearchParams(search);
  const component = resolveComponentKey(p.get('component'));
  const entry = catalog.find(c => c.key === component)!;
  const choice = oneOf(p.get('choice'), ['single', 'multiple'], 'single');
  const selected = [...new Set((p.get('selected') ?? '').split(',').filter(s => ['a', 'b', 'c'].includes(s)))];
  const color=(key:string,fallback:string)=>{const value=p.get(key)??fallback;return /^#[0-9a-fA-F]{6}$/.test(value)?value:fallback;};
  const num=(name:string,fallback:number,min:number,max:number)=>{
    const raw=p.get(name);
    if(raw==null||raw==='')return fallback;
    const parsed=Number(raw);
    return Number.isFinite(parsed)?Math.min(max,Math.max(min,parsed)):fallback;
  };
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
    composition:oneOf(p.get('composition'),['card','terrace','solo','combo'],'card'),currentAction:oneOf(p.get('currentAction'),['start','continue'],'start'),
    material:oneOf(p.get('material'),['en','zh'],'en'),answerPhase:oneOf(p.get('answerPhase'),['open','checked'],'open'),
    wordScenario:oneOf(p.get('wordScenario'),['A','B','C','D','E','F','G','H'],'A'), wordContent:oneOf(p.get('wordContent'),['word','punctuation','emoji','sentence','mixed'],'word'),
    wordTabs:oneOf(p.get('wordTabs'),['auto','show','hide'],'auto'),wordCount:oneOf(p.get('wordCount'),['1','4','10'],'1'),
    wordSelection:oneOf(p.get('wordSelection'),['default','selected','used'],'default'),wordEvaluation:oneOf(p.get('wordEvaluation'),['neutral','correct','incorrect','hint','shown'],'neutral'),
    wordInteraction:oneOf(p.get('wordInteraction'),['enabled','disabled'],'enabled'),wordGroup:oneOf(p.get('wordGroup'),Array.from({length:10},(_,i)=>`g${i}`),'g0'),
    wordSelected:[...new Set((p.get('wordSelected')??'').split(',').filter(v=>/^g\d-w\d{1,2}$/.test(v)))].slice(0,100),
    wordAnswer:(p.get('wordAnswer')??'').split(',').filter(v=>/^g\d-w\d{1,2}$/.test(v)).slice(0,100),
    wordResult:oneOf(p.get('wordResult'),['neutral','correct','incorrect','hint','shown'],'neutral'),
    selected: choice === 'single' ? selected.slice(0, 1) : selected,
    solarRayIntensity:num('solarRayIntensity',1.80,0,2.5),
    solarRayLength:num('solarRayLength',1.26,0.2,2.2),
    solarRayCount:Math.round(num('solarRayCount',64,4,64)),
    solarBokeh:num('solarBokeh',1.12,0,2.5),
    solarRimBoost:num('solarRimBoost',0.74,0,2.5),
    solarGlowSpread:num('solarGlowSpread',10,2,50),
    solarBrightness:num('solarBrightness',1.34,0.2,1.8),
    flagAmplitude:num('flagAmplitude',3,0,16),
    flagWaves:num('flagWaves',5,0,12),
    flagPeriod:num('flagPeriod',3,.2,5),
    flagPlaying:oneOf(p.get('flagPlaying'),['true','false'],'true')==='true',
    flagReset:Math.round(num('flagReset',0,0,9999)),
    solarPreset:oneOf(p.get('solarPreset'),['A','B','C','custom'],'custom'),
    solarBorderColor:color('solarBorderColor','#FFA82E'),
    solarGlowColor:color('solarGlowColor','#FFA82E'),
    wordTabAppearance:'connected',
    cloudRenderMode:oneOf(p.get('cloudRenderMode'),['auto','shader','lightweight'],'auto'),
    cloudPreset:oneOf(p.get('cloudPreset'),['clear','staircase'],'staircase'),
    skyTop:color('skyTop',p.get('cloudPreset')==='clear'?'#3876BA':'#85DBF9'),
    skyBottom:color('skyBottom',p.get('cloudPreset')==='clear'?'#8CBFE8':'#F8F4ED'),
    cloudColor:color('cloudColor','#FBF8F2'),cloudCount:Math.round(num('cloudCount',5,1,6)),
    driftSpeed:num('driftSpeed',.8,0,2),parallaxStrength:num('parallaxStrength',.06,0,.5),
    cloudCameraX:num('cloudCameraX',0,0,1200),cloudPaused:oneOf(p.get('cloudPaused'),['true','false'],'false')==='true',
    cloudSimulateUnavailable:oneOf(p.get('cloudSimulateUnavailable'),['true','false'],'false')==='true',
    transitionDuration:Math.round(num('transitionDuration',500,0,1200)),
    transitionBlur:num('transitionBlur',12,0,30),
    transitionPage:oneOf(p.get('transitionPage'),['staircase','lesson'],'staircase'),
    startPointText:(p.get('startPointText')??'').slice(0,28),
    startPointFill:color('startPointFill','#ffc24e'),
    startPointStroke:color('startPointStroke','#715146'),
    startPointInk:color('startPointInk','#2f0f04'),
    orientation:oneOf(p.get('orientation'),['portrait','landscape'],'portrait'),
    pathCurrentView:oneOf(p.get('pathCurrentView'),['auto','off','in'],'auto'),
    pathSolarFallback:oneOf(p.get('pathSolarFallback'),['true','false'],'false')==='true',
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
