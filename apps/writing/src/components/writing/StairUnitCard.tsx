import type { PathNode } from '../../product/courseSession';
import './StairUnitCard.css';
export interface StairUnitCardProps {
  unit:NonNullable<PathNode['unit']>;
  status?:'normal'|'current'|'done'|'locked';
  locale?:'en'|'zh';
}
/** BA-WR-007 R2 folded paper, pending visual sign-off; decoration has no interaction. */
export function StairUnitCard({unit,status='normal',locale='en'}:StairUnitCardProps) {
  return <section className="course-unit stair-unit-card" data-component="BA-WR-007" data-testid="unit" data-unit={unit.id} data-state={status}>
    <svg className="stair-unit-card__fold" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M 0 0 H 40 V 40 Z" fill="var(--ba-writing-unit-fold-under)" />
      <path d="M 2 0 H 34 Q 40 0 40 6 V 34 Q 40 39 35 35 Z" fill="url(#paper-fold-face)" stroke="var(--ba-writing-unit-paper-border)" strokeWidth=".8"/>
      <defs><linearGradient id="paper-fold-face" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFFDF9"/><stop offset="1" stopColor="#E7D6C9"/></linearGradient></defs>
    </svg>
    <p className="course-kicker">{locale==='zh'?'第 '+unit.index+' 单元':'Unit '+unit.index} · {unit.typeLabel}</p>
    <h2>{unit.title}</h2>
    <p>{unit.meta}</p>
    {unit.goals.length?<div className="stair-unit-card__goals">{unit.goals.map(goal=><p key={goal}>{goal}</p>)}</div>:null}
  </section>;
}
