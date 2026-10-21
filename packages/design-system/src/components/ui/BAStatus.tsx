import type { ReactNode } from 'react';
import './BAStatus.css';
export type BAStatusTone = 'information' | 'hint' | 'warning' | 'correct' | 'incorrect' | 'revealed';
export interface BAStatusProps {
  tone: BAStatusTone;
  children: ReactNode;
  className?: string;
  label?: string;
}
export function BAStatus({tone,children,className,label}: BAStatusProps) {
  return <div className={['ba-status',className].filter(Boolean).join(' ')} data-component="BA-UI-007" data-tone={tone} role={tone==='incorrect'?'alert':'status'} aria-label={label}>
    {children}
  </div>;
}
