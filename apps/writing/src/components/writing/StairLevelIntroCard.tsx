import '../../course/course.css';
import './StairLevelIntroCard.css';

export interface StairLevelIntroCardProps {
  /** Product Level title (e.g. level.name), shown above body like Unit card h2. */
  title?: string;
  /** Level introduction body copy (localized by caller). */
  intro: string;
  locale?: 'en' | 'zh';
  className?: string;
}

/**
 * BA-WR-008 StairLevelIntroCard — Level intro card body used by Writing
 * StartPointLevelCombo / staircase and Library catalog.
 *
 * 2026-10-29: optional Level title heading mirrors Unit card title typography
 * (24px / 800 / 30px, accent #B25415). Separate orange Level Title Card above
 * this card remains the approved future composition (pending).
 */
export function StairLevelIntroCard({ title, intro, locale = 'en', className }: StairLevelIntroCardProps) {
  return (
    <section
      className={['course-intro', 'stair-level-intro-card', className].filter(Boolean).join(' ')}
      data-component="BA-WR-008"
      data-testid="level-intro"
      data-locale={locale}
    >
      {title ? (
        <h2 className="stair-level-intro-card__title" data-testid="level-intro-title">
          {title}
        </h2>
      ) : null}
      <p className="stair-level-intro-card__body">{intro}</p>
    </section>
  );
}
