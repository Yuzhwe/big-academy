import { useEffect, useRef } from 'react';
import { Button } from 'react-aria-components';
import type { BALocale } from '@big-academy/design-system';
import goldCheck from '../../assets/review04/writing_milestone_1.png';
import greenSeal from '../../assets/review05/writing_milestone_1.1.webp';
import './UnitMilestone.css';

export interface UnitMilestoneProps {
  unitId: string; title: string; completed: boolean; locale?: BALocale;
  /** Automatic first-return highlight; completed manual replay stays eligible. */
  celebrationEligible: boolean;
  onCelebrate?: (unitId: string) => void;
}

/** BA-WR-006. Stable hit geometry, one RAF for two depths; independent CSS shine. */
export function UnitMilestone({unitId,title,completed,celebrationEligible,locale='en',onCelebrate}:UnitMilestoneProps) {
  const root = useRef<HTMLDivElement>(null);
  const motion = useRef({x:0,y:0,tx:0,ty:0,frame:0,last:0,returning:false});
  const tick = (now:number) => {
    const m=motion.current, el=root.current;
    if (!el) return;
    const css=getComputedStyle(el);
    const response=Number(css.getPropertyValue(m.returning?'--ba-milestone-return-ms':'--ba-milestone-follow-ms'))||55;
    const dt=m.last?Math.min(now-m.last,64):16;
    m.last=now;
    const blend=1-Math.exp(-dt/response);
    m.x+=(m.tx-m.x)*blend;m.y+=(m.ty-m.y)*blend;
    el.style.setProperty('--badge-x',String(m.x));el.style.setProperty('--badge-y',String(m.y));
    if (Math.abs(m.x-m.tx)+Math.abs(m.y-m.ty)>.0005) m.frame=requestAnimationFrame(tick);
    else {m.frame=0;m.last=0;}
  };
  const target=(x:number,y:number,returning=false)=>{
    const m=motion.current;m.tx=x;m.ty=y;m.returning=returning;
    if (!m.frame) m.frame=requestAnimationFrame(tick);
  };
  useEffect(()=>{
    const mq=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reset=()=>{const m=motion.current;cancelAnimationFrame(m.frame);m.frame=0;m.x=m.y=m.tx=m.ty=m.last=0;root.current?.style.setProperty('--badge-x','0');root.current?.style.setProperty('--badge-y','0');};
    mq?.addEventListener('change',reset);
    return()=>{reset();mq?.removeEventListener('change',reset);};
  },[]);
  const zh=locale==='zh';
  return <div ref={root} className="unit-milestone" data-component="BA-WR-006" data-unit={unitId}
    data-state={!completed?'upcoming':celebrationEligible?'newly-completed':'completed'}
    onPointerMove={event=>{
      if(event.pointerType==='touch'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
      const box=event.currentTarget.getBoundingClientRect();
      if(!box.width||!box.height)return;
      // Scene node wrappers are wider than the badge. Normalize against the
      // untransformed action size so library and Staircase have equal travel.
      const action=event.currentTarget.querySelector<HTMLElement>('.unit-milestone__action');
      const width=action?.offsetWidth||box.width,height=action?.offsetHeight||box.height;
      target(Math.max(-1,Math.min(1,(event.clientX-box.left-box.width/2)/(width/2))),Math.max(-1,Math.min(1,(event.clientY-box.top-box.height/2)/(height/2))));
    }} onPointerLeave={()=>target(0,0,true)}>
    <Button className="unit-milestone__action" data-testid="milestone" data-done={completed?'1':'0'}
      data-shine={completed?'true':undefined} isDisabled={!completed}
      aria-label={`${title} · ${completed?(zh?'已完成 · 再看一次':'Completed · Play again'):(zh?'未完成':'Upcoming')}`}
      onPress={()=>{if(completed)onCelebrate?.(unitId);}}>
      <img src={greenSeal} alt="" draggable={false}/><img src={goldCheck} alt="" draggable={false}/>
      {completed&&<span className="unit-milestone__sheen" aria-hidden="true"/>}
    </Button>
  </div>;
}
