import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
import type { BALocale } from '@big-academy/design-system';
import { WordChip, type WordEvaluation } from './WordChip';
import './WordGrid.css';

export type { WordEvaluation } from './WordChip';
export type WordSelection = 'default' | 'selected' | 'used';
export interface WordGridWord {
  id: string;
  text: string;
  /** Legacy aliases, preserved for existing product callers. Used never implies disabled. */
  used?: boolean;
  hint?: boolean;
  shake?: boolean;
  selection?: WordSelection;
  evaluation?: WordEvaluation;
  disabled?: boolean;
  kind?: 'word' | 'punctuation' | 'emoji' | 'sentence';
  lang?: 'en' | 'zh-CN';
}
export interface WordGridGroup { id: string; label: string; words: WordGridWord[]; }
export interface WordGridProps {
  groups: WordGridGroup[];
  activeGroup: string;
  presentation?: 'docked' | 'overlay';
  tabs?: 'auto' | 'show' | 'hide';
  /** R04 seam repair keeps the approved rounded tabs; previous slanted trial retired. */
  tabAppearance?: 'connected';
  locale?: BALocale;
  onGroupChange?: (key: string) => void;
  onInsert?: (word: string) => void;
  onWordAction?: (word: WordGridWord, groupId: string) => void;
}
const labels = {
  en: { selected:'Selected', used:'Used', correct:'Correct', correctUnselected:'Also correct', incorrect:'Incorrect', hint:'Hint', shown:'Shown answer', disabled:'Unavailable' },
  zh: { selected:'已选择', used:'已使用', correct:'正确', correctUnselected:'也是正确答案', incorrect:'错误', hint:'提示', shown:'系统展示答案', disabled:'不可操作' },
};
/** Approved neutral bank. R2 selection/evaluation extensions are candidates; the caller owns all grading. */
export function WordGrid({ groups, activeGroup, presentation='docked', tabs='auto', tabAppearance='connected', locale='en', onGroupChange, onInsert, onWordAction }: WordGridProps) {
  if (!groups.length) return null;
  const active = groups.some(g=>g.id===activeGroup) ? activeGroup : groups[0].id;
  const current = groups.find(g=>g.id===active)!;
  const showTabs = tabs==='show' || (tabs==='auto' && groups.length>1);
  const cards = <div className="word-grid__cards" data-testid="word-grid-cards">
    {current.words.length ? current.words.map(word=>{
      const selection = word.selection ?? (word.used ? 'used' : 'default');
      const evaluation = word.evaluation ?? (word.hint ? 'hint' : 'neutral');
      const extended = word.selection !== undefined || word.evaluation !== undefined || word.kind === 'sentence';
      const status = [selection!=='default' ? labels[locale][selection] : '', evaluation!=='neutral' ? labels[locale][evaluation] : '', word.disabled ? labels[locale].disabled : ''].filter(Boolean).join(' · ');
      return (
        <WordChip
          key={word.id}
          className={`word-grid__card${word.shake ? ' shake' : ''}`}
          lang={word.lang ?? 'en'}
          kind={word.kind ?? 'word'}
          selected={selection === 'selected'}
          used={selection === 'used'}
          disabled={word.disabled}
          shake={word.shake}
          evaluation={evaluation}
          aria-label={extended && status ? `${word.text} · ${status}` : word.text}
          aria-pressed={word.selection !== undefined ? selection === 'selected' : undefined}
          onClick={() => { if (onWordAction) onWordAction(word, current.id); else onInsert?.(word.text); }}
        >
          {word.text}
        </WordChip>
      );
    }) : <p className="word-grid__empty">{locale==='zh'?'这里还没有词。':'Nothing here yet.'}</p>}
  </div>;
  const review = groups.some(g=>g.words.some(w=>w.selection || w.evaluation || w.kind==='sentence')) ? 'candidate' : 'approved';
  if(!showTabs) return <div className="word-grid" data-component="BA-WR-003" data-presentation={presentation} data-visual={review} data-tabs="off">{cards}</div>;
  return <Tabs className="word-grid" data-component="BA-WR-003" data-presentation={presentation} data-visual={review} data-first-active={active === groups[0].id ? 'true' : 'false'} data-tab-appearance={tabAppearance}
    selectedKey={active} onSelectionChange={key=>onGroupChange?.(String(key))}>
    <TabList className="word-grid__tabs" aria-label={locale==='zh'?'词表分类':'Word groups'}>
      {groups.map(group=><Tab key={group.id} id={group.id} className="word-grid__tab">{group.label}</Tab>)}
    </TabList><TabPanel id={active} className="word-grid__panel">{cards}</TabPanel>
  </Tabs>;
}
