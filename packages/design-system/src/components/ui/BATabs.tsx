import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
import type { BASegmentSize } from './BASegmentedControl';
import './BASegmentedControl.css';
import './BATabs.css';

export type BATabOption = {
  id: string;
  label: string;
  accessibleLabel?: string;
  disabled?: boolean;
  icon?: ReactNode;
};
export interface BATabsProps {
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  className?: string;
  children: ReactNode;
}
/** BA-UI-002 · React Aria Tabs navigation and TabPanel, not RadioGroup. */
export function BATabs({ selectedKey, defaultSelectedKey, onSelectionChange, className, children }: BATabsProps) {
  return <Tabs className={className} selectedKey={selectedKey} defaultSelectedKey={defaultSelectedKey}
    onSelectionChange={key => onSelectionChange?.(String(key))}>
    {children}
  </Tabs>;
}
export interface BATabListProps {
  options: readonly BATabOption[];
  selectedKey: string;
  'aria-label': string;
  size?: BASegmentSize;
  emphasis?: 'strong' | 'subtle';
  radius?: 'full' | 'standard';
  distribution?: 'equal' | 'hug';
  className?: string;
}
/** Identical segmented visuals; actual TabList/Tab semantics. */
export function BATabList({
  options, selectedKey, 'aria-label': label,
  size=50, emphasis='strong', radius='full', distribution='hug', className
}: BATabListProps) {
  const rootRef=useRef<HTMLDivElement>(null);
  const [rect,setRect]=useState<{x:number;width:number}|null>(null);
  useLayoutEffect(()=>{
    const root=rootRef.current;
    if (!root) return;
    const measure=()=>{
      const track=root.querySelector<HTMLElement>('.ba-tabs__tablist');
      const selected=Array.from(root.querySelectorAll<HTMLElement>('.ba-tabs__option')).find(
        e=>e.dataset.tabKey===selectedKey
      );
      if (!track || !selected) {setRect(null);return;}
      const t=track.getBoundingClientRect(), a=selected.getBoundingClientRect();
      const x=a.left-t.left+2, width=Math.max(0,a.width-4);
      setRect(prev=>prev && prev.x===x && prev.width===width?prev:{x,width});
    };
    measure();
    const ro=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);
    if(ro){
      ro.observe(root);
      root.querySelectorAll<HTMLElement>('.ba-tabs__option').forEach(el=>ro.observe(el));
    }
    return ()=>ro?.disconnect();
  },[selectedKey,size,distribution,options]);
  const style={
    '--ba-seg-indicator-x': String(rect?.x??2)+'px',
    '--ba-seg-indicator-width': String(rect?.width??0)+'px',
    '--ba-seg-indicator-opacity': rect?1:0,
  } as CSSProperties;
  return <div ref={rootRef} data-component="BA-UI-002-TABLIST"
      data-size={size} data-emphasis={emphasis} data-radius={radius}
      data-distribution={distribution}
      className={['ba-segmented','ba-tabs__wrapper',className].filter(Boolean).join(' ')}>
    <TabList className="ba-segmented__track ba-tabs__tablist" aria-label={label} style={style}>
      {options.map(option => <Tab key={option.id} id={option.id}
        data-tab-key={option.id} aria-label={option.accessibleLabel??option.label}
        isDisabled={option.disabled} className="ba-segmented__option ba-tabs__option">
        <span className="ba-segmented__content">
          {option.icon?<span className="ba-segmented__icon" aria-hidden="true">{option.icon}</span>:null}
          <span className="ba-segmented__label">{option.label}</span>
        </span>
      </Tab>)}
    </TabList>
  </div>;
}
export function BATabPanel({id,children,className}:{id:string;children:ReactNode;className?:string}) {
  return <TabPanel id={id} className={['ba-tabs__panel',className].filter(Boolean).join(' ')}>
    {children}
  </TabPanel>;
}
