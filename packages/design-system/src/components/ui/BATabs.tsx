import { useRef, type ReactNode, type CSSProperties } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
import { useBASelectionSurface } from './useBASelectionSurface';
import type { BASegmentOption, BASegmentSize } from './BASegmentedControl';
import './BASegmentedControl.css';

/** BA-UI-002 · true Tabs navigation with shared Segmented Control visual anatomy. */
export interface BATabsProps {
  children: ReactNode;
  className?: string;
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
}
export function BATabs({children, className, selectedKey,defaultSelectedKey,onSelectionChange}:BATabsProps) {
  return <Tabs data-component="BA-UI-002" className={className}
    selectedKey={selectedKey} defaultSelectedKey={defaultSelectedKey}
    onSelectionChange={key => onSelectionChange?.(String(key))}>{children}</Tabs>;
}

export interface BATabListProps {
  items: readonly BASegmentOption[];
  selectedKey: string;
  'aria-label':string;
  size?:BASegmentSize;
  emphasis?:'strong'|'subtle';
  radius?:'full'|'standard';
  distribution?:'equal'|'hug';
  className?:string;
  width?:number|string;
}
/** No duplicate visuals. The same .ba-segmented track/option CSS is used,
 * with a pseudo selected-surface because React Aria TabList owns its collection. */
export function BATabList({
  items,selectedKey,'aria-label':label,size=50,emphasis='strong',
  radius='full',distribution='hug',className,width,
}:BATabListProps) {
  const root=useRef<HTMLDivElement>(null);
  const active=useBASelectionSurface(root,selectedKey,size,distribution,items.map(item=>item.id).join('|'));
  return <div ref={root}
    className={['ba-segmented','ba-tabs__wrapper',className].filter(Boolean).join(' ')}
    data-size={size} data-radius={radius} data-emphasis={emphasis} data-distribution={distribution}
    style={width==null?undefined:{width}}>
    <TabList className="ba-segmented__track ba-tabs__track" aria-label={label}
      style={{
        '--ba-tabs-selected-x':active ? active.x+'px' : '2px',
        '--ba-tabs-selected-width':active ? active.width+'px' : '0px',
        '--ba-tabs-selected-opacity':active ? 1 : 0,
      } as CSSProperties}>
      {items.map(item=>{
        const a11y=item.accessibleLabel??item.label??item.id;
        return <Tab key={item.id} id={item.id} data-key={item.id} isDisabled={item.disabled}
          aria-label={a11y} className="ba-segmented__option ba-tabs__tab">
          <span className="ba-segmented__content">
            {item.icon?<span className="ba-segmented__icon" aria-hidden="true">{item.icon}</span>:null}
            {item.label?<span className="ba-segmented__label">{item.label}</span>:null}
          </span>
        </Tab>;
      })}
    </TabList>
  </div>;
}
export function BATabPanel({id,children,className}: {id:string;children:ReactNode;className?:string}) {
  return <TabPanel id={id} className={className}>{children}</TabPanel>;
}
