import type { PathNode } from '../../product/courseSession';
import '../../course/course.css';

export interface StairUnitCardProps {
  unit: NonNullable<PathNode['unit']>;
  locale?: 'en' | 'zh';
}

/** BA-WR-007 · single canonical Unit card used by library AND Staircase.
 * No fold, cutout, overlay or temporary card state. */
export function StairUnitCard({unit,locale='en'}:StairUnitCardProps) {
  const zh=locale==='zh';
  const label=zh?`第 ${unit.index} 单元`:`UNIT ${unit.index}`;
  const meta=zh?unit.meta:unit.meta.replace(/\bmins\b/gi,'min');
  return <section className="course-unit" data-component="BA-WR-007" data-testid="unit" data-unit={unit.id}>
    <div className="course-unit__identity">
      <p className="course-kicker">{label}</p>
      <p className="course-unit__meta">{meta}</p>
    </div>
    <h2>{unit.title}</h2>
    {unit.goals.length>0&&<div className="course-unit__goals">
      {unit.goals.map(goal=><p key={goal} className="course-unit__goal">{goal}</p>)}
    </div>}
  </section>;
}
