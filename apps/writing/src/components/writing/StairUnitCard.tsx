import type { PathNode } from '../../product/courseSession';
import { unitFoldPaths } from '../../course/unitFold';
import '../../course/course.css';

export interface StairUnitCardProps {
  unit: NonNullable<PathNode['unit']>;
  locale?: 'en' | 'zh';
  /** Stage A R2 approved candidate: four matching rounded corners.
   * Folded remains the currently active Staircase implementation until Stage B.
   */
  corner?: 'folded' | 'rounded';
}

/** BA-WR-007. Reuses the real paper content; optional preview-only anatomy.
 * The scenery owns positioning, cloud base, progress and lesson permissions. */
export function StairUnitCard({unit,locale='en',corner='folded'}:StairUnitCardProps) {
  const zh=locale==='zh';
  const kicker=zh?`第 ${unit.index} 单元`:corner==='folded'?`Unit ${unit.index}`:`UNIT ${unit.index}`;
  const paths=corner==='folded'?unitFoldPaths():null;
  const face=`course-unit-fold-face-${unit.id}`;
  return <section className="course-unit" data-component="BA-WR-007"
    data-testid="unit" data-unit={unit.id} data-corner={corner}>
    {paths?<svg className="course-unit__fold" viewBox="0 0 32 32" data-testid="unit-fold" aria-hidden="true">
      <defs><linearGradient id={face} x1="32" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--ba-writing-unit-fold-face-light, #fffdf9)"/>
        <stop offset="100%" stopColor="var(--ba-writing-unit-fold-face-dark, #e7d6c9)"/>
      </linearGradient></defs>
      <path className="course-unit__fold-under" d={paths.under}/>
      <path className="course-unit__fold-edge" d={paths.edge} fill="none"
        stroke="var(--ba-writing-unit-paper-border, #dcc3ab)" strokeWidth="0.5" vectorEffect="non-scaling-stroke"/>
      <path className="course-unit__fold-flap" d={paths.flap} fill={`url(#${face})`}/>
      <path className="course-unit__fold-seam" d="M 0 0 L 32 32" fill="none"
        stroke="var(--ba-writing-unit-paper-border, #dcc3ab)" strokeWidth="0.7" vectorEffect="non-scaling-stroke"/>
    </svg>:null}
    {corner==='rounded'
      ? <div className="course-unit__identity"><p className="course-kicker">{kicker}</p>
          <p className="course-unit__meta">{unit.meta}</p></div>
      : <p className="course-kicker">{kicker}</p>}
    <h2>{unit.title}</h2>
    {corner==='folded'?<p className="course-unit__meta">{unit.meta}</p>:null}
    {unit.goals.length>0&&<div className="course-unit__goals">
      {unit.goals.map(goal=><p key={goal} className="course-unit__goal">{goal}</p>)}
    </div>}
  </section>;
}
