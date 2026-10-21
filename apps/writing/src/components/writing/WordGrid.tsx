import { BAButton } from '@big-academy/design-system';
import './WordGrid.css';
export interface WordGridGroup {id:string;label:string;words:{id:string;text:string}[];}
export interface WordGridProps {
  groups:WordGridGroup[];
  activeGroup:string;
  onGroupChange:(id:string)=>void;
  onInsert:(wordId:string)=>void;
  disabled?:boolean;
  locale?:'en'|'zh';
  collapsed?:boolean;
}
/** BA-WR-003: presentation and insertion events only. The product owns caret/word correctness. */
export function WordGrid({groups,activeGroup,onGroupChange,onInsert,disabled=false,locale='en',collapsed=false}:WordGridProps) {
  const group=groups.find(x=>x.id===activeGroup)??groups[0];
  if(collapsed || !group)return null;
  return <section className="writing-word-grid" data-component="BA-WR-003" aria-label={locale==='zh'?'词语格':'Word grid'}>
    {groups.length>1?<div className="writing-word-grid__tabs" role="tablist" aria-label={locale==='zh'?'词组':'Word groups'}>
      {groups.map(item=><button key={item.id} type="button" role="tab" aria-selected={group.id===item.id} className="writing-word-grid__tab" onClick={()=>onGroupChange(item.id)}>{item.label}</button>)}
    </div>:null}
    <div className="writing-word-grid__words" role="group" aria-label={group.label}>
      {group.words.map(word=><BAButton key={word.id} size={50} variant="secondary" radius="full" disabled={disabled} onPress={()=>onInsert(word.id)}>{word.text}</BAButton>)}
    </div>
  </section>;
}
