import { useEffect, useRef, type ReactNode } from 'react';
import { animateSpring } from '../../motion/spring';
import { Dialog, DialogTrigger, Heading, Popover } from 'react-aria-components';
import './BAOverlay.css';
export interface BAOverlayProps {
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open:boolean)=>void;
  title: string;
  children: ReactNode;
  className?: string;
}
/** BA-UI-005. Accessible, nonmodal anchored popover; React Aria manages Escape/focus restoration. */
export function BAOverlay({trigger,open,onOpenChange,title,children,className}:BAOverlayProps){
  const dialogRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!open||!dialogRef.current)return;
    const el=dialogRef.current;
    return animateSpring({preset:'modal-enter',from:0,to:1,update:(x)=>{
      const visible=Math.max(0,Math.min(1,x));
      el.style.opacity=String(visible);
      el.style.transform='scale('+(.96+.04*visible)+')';
    }});
  },[open]);
  return <DialogTrigger isOpen={open} onOpenChange={onOpenChange}>
    {trigger}
    <Popover isNonModal className={['ba-overlay',className].filter(Boolean).join(' ')} placement="bottom end" data-component="BA-UI-005" offset={8}>
      <Dialog ref={dialogRef} className="ba-overlay__dialog" aria-label={title}>
        <Heading slot="title" className="ba-overlay__title">{title}</Heading>
        {children}
      </Dialog>
    </Popover>
  </DialogTrigger>;
}
