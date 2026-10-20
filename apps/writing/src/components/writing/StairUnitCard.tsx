import { BANumber } from '@big-academy/design-system';
export interface StairUnitCardProps {
  id: string;
  number: number;
  title: string;
  typeLabel: string;
  meta: string;
  goals?: string[];
  state: 'done' | 'current' | 'locked';
  locale?: 'en' | 'zh';
}
/** BA-WR-008 · noninteractive chapter banner. Decoration never owns permission. */
export function StairUnitCard({
  id,
  number,
  title,
  typeLabel,
  meta,
  goals = [],
  state,
  locale = 'en',
}: StairUnitCardProps) {
  return (
    <section
      className="course-unit folded-unit"
      data-component="BA-WR-008"
      data-testid="unit"
      data-unit={id}
      data-progress={state}
    >
      <p className="course-kicker">
        {locale === 'zh' ? '第 ' : 'Unit '}
        <BANumber>{number}</BANumber>
        {locale === 'zh' ? ' 单元' : ''} · {typeLabel}
      </p>
      <h2>{title}</h2>
      <p>{meta}</p>
      {goals.length ? (
        <ul>
          {goals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
