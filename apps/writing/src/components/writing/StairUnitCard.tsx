import type { PathNode } from '../../product/courseSession';
import { unitFoldPaths } from '../../course/unitFold';
import '../../course/course.css';

export interface StairUnitCardProps {
  unit: NonNullable<PathNode['unit']>;
  locale?: 'en' | 'zh';
}

/** BA-WR-007. One Unit paper component in Storybook and Staircase.
 * The scene owns absolute coordinates/cloud platforms; this owns paper anatomy. */
export function StairUnitCard({ unit, locale = 'en' }: StairUnitCardProps) {
  const face = `course-unit-fold-face-${unit.id}`;
  const paths = unitFoldPaths();
  const zh = locale === 'zh';
  return (
    <section className="course-unit" data-component="BA-WR-007" data-testid="unit" data-unit={unit.id}>
      <svg className="course-unit__fold" viewBox="0 0 32 32" data-testid="unit-fold" aria-hidden="true">
        <defs>
          <linearGradient id={face} x1="32" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--ba-writing-unit-fold-face-light, #fffdf9)" />
            <stop offset="100%" stopColor="var(--ba-writing-unit-fold-face-dark, #e7d6c9)" />
          </linearGradient>
        </defs>
        <path className="course-unit__fold-under" d={paths.under} />
        <path className="course-unit__fold-edge" d={paths.edge} fill="none"
          stroke="var(--ba-writing-unit-paper-border, #dcc3ab)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <path className="course-unit__fold-flap" d={paths.flap} fill={`url(#${face})`} />
        <path className="course-unit__fold-seam" d="M 0 0 L 32 32" fill="none"
          stroke="var(--ba-writing-unit-paper-border, #dcc3ab)" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="course-kicker">{zh ? `第 ${unit.index} 单元` : `Unit ${unit.index}`}</p>
      <h2>{unit.title}</h2>
      <p className="course-unit__meta">{unit.meta}</p>
      {unit.goals.length > 0 && <div className="course-unit__goals">
        {unit.goals.map(goal => <p key={goal} className="course-unit__goal">{goal}</p>)}
      </div>}
    </section>
  );
}
