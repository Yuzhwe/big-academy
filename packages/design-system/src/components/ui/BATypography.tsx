import type { ReactNode } from 'react';
import './BATypography.css';

export type BATextRole = 'display' | 'heading' | 'body' | 'control' | 'supporting' | 'caption';
export interface BATextProps {
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'label';
  textRole?: BATextRole;
  children: ReactNode;
  className?: string;
  id?: string;
}
/** BA-UI-TYPE — semantic cross-product type. Metrics remain candidates. */
export function BAText({ as: Element = 'span', textRole = 'body', children, className, id }: BATextProps) {
  return <Element id={id} className={['ba-text', className].filter(Boolean).join(' ')} data-component="BA-UI-TYPE" data-text-role={textRole}>{children}</Element>;
}
/** Explicit Dosis 800 for UI numerals; never mutate student-authored text. */
export function BANumber({ children, className }: { children: number | string; className?: string }) {
  return <span className={['ba-number', className].filter(Boolean).join(' ')} data-component="BA-UI-NUMBER">{children}</span>;
}
