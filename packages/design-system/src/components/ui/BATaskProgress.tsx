import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-aria-components';
import { BAIcon } from './BAIcon';
import { BAOverlay } from './BAOverlay';
import type { BALocale, TaskProgressItem } from '../../types/task';
import { taskChrome, taskMayNavigate } from '../../i18n/chrome';
import './BATaskProgress.css';

export interface BATaskProgressProps {
  tasks: readonly TaskProgressItem[];
  activeIndex: number;
  canOpen: (index:number)=>boolean;
  onNavigate?: (index:number)=>void;
  locale?: BALocale;
  label?: string;
}
export function ActivityScreenIndicator({task,number,selected,compact=false,canEnter,onPress,locale='en'}:{
  task:TaskProgressItem;number:number;selected:boolean;compact?:boolean;canEnter:boolean;onPress?:()=>void;locale?:BALocale;
}){
  const copy=taskChrome(locale);
  const suffix=task.shown?(locale==='zh'?'，已显示答案':', answer revealed'):'';
  return <Button
    className="ba-activity-indicator"
    data-component="BA-UI-006-INDICATOR"
    data-status={task.status}
    data-selected={selected?'true':undefined}
    data-size={compact?'compact':'regular'}
    isDisabled={!canEnter}
    aria-current={selected?'step':undefined}
    aria-label={copy.task(number,task.label,copy.status[task.status])+suffix}
    onPress={onPress}
  >
    <span className="ba-activity-indicator__circle" aria-hidden="true">{number}</span>
    {task.status==='skipped'?<span className="ba-activity-indicator__caption">{copy.status.skipped}</span>:null}
    {(task.status==='done'||task.status==='locked')?<span className="ba-activity-indicator__badge" aria-hidden="true">
      <BAIcon name={task.status==='done'?'check':'lock'} size={12}/>
    </span>:null}
  </Button>;
}
/** BA-UI-006. A single numbered indicator is shared by the rail and every popover cell. */
export function BATaskProgress({tasks,activeIndex,canOpen,onNavigate,locale='en',label}:BATaskProgressProps){
  const copy=taskChrome(locale);
  const railRef=useRef<HTMLDivElement>(null);
  const [capacity,setCapacity]=useState<number>(Infinity);
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const element=railRef.current;
    if(!element)return;
    const measure=()=>{
      const width=element.getBoundingClientRect().width;
      if(width>0)setCapacity(Math.max(2,Math.floor((width-56)/48)));
    };
    measure();
    if(typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(measure);
    observer.observe(element);
    return ()=>observer.disconnect();
  },[]);
  const overflow=Number.isFinite(capacity)&&capacity<tasks.length;
  const shownCount=overflow?Math.max(1,capacity):tasks.length;
  const start=Math.min(Math.max(0,activeIndex-Math.floor(shownCount/2)),Math.max(0,tasks.length-shownCount));
  const visible=Array.from({length:shownCount},(_,i)=>start+i);
  const go=(index:number)=>{
    if(!taskMayNavigate(tasks[index].status,index,canOpen))return;
    onNavigate?.(index);
    setOpen(false);
  };
  return <nav ref={railRef} className="ba-task-progress" data-component="BA-UI-006" aria-label={label??copy.nav}>
    <ol className="ba-task-progress__list">
      {visible.map(index=>{
        const task=tasks[index];
        return <li key={task.id} className="ba-task-progress__item">
          <ActivityScreenIndicator task={task} number={task.number??index+1} selected={index===activeIndex}
            compact canEnter={taskMayNavigate(task.status,index,canOpen)} onPress={()=>go(index)} locale={locale}/>
        </li>;
      })}
    </ol>
    {overflow?<BAOverlay title={locale==='zh'?'全部活动页':'All activity screens'} open={open} onOpenChange={setOpen}
      trigger={<Button className="ba-task-progress__overflow" aria-label={locale==='zh'?'查看全部活动页':'All activity screens'} aria-expanded={open}>•••</Button>}>
      <ol className="ba-task-progress__grid">
        {tasks.map((task,index)=><li key={task.id}>
          <ActivityScreenIndicator task={task} number={task.number??index+1} selected={index===activeIndex}
            canEnter={taskMayNavigate(task.status,index,canOpen)} onPress={()=>go(index)} locale={locale}/>
        </li>)}
      </ol>
    </BAOverlay>:null}
  </nav>;
}
export { taskMayNavigate };
