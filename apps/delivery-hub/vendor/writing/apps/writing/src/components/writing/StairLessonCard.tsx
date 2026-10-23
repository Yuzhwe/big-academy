import { Button } from 'react-aria-components';
import type { BALocale } from '@big-academy/design-system';
import './StairLessonCard.css';

export type StairLessonState = 'start' | 'continue' | 'review' | 'locked' | 'skipped';

export interface StairLessonCardProps {
  lessonId: string;
  number: number;
  title: string;
  state: StairLessonState;
  detail?: string;
  locale?: BALocale;
  onEnter?: (lessonId: string) => void;
}

const actionLabel: Record<BALocale, Record<StairLessonState, string>> = {
  en: {
    start: 'Start',
    continue: 'Continue',
    review: 'Review',
    locked: 'Locked',
    skipped: 'Review',
  },
  zh: {
    start: '开始',
    continue: '继续',
    review: '复习',
    locked: '未解锁',
    skipped: '复习',
  },
};

/**
 * BA-WR-005 · path lesson card.
 * The lesson number stays in the top left for every state.
 * The card does not decide unlock. `onEnter` is the product session.
 * Candidate Warm Frame. Not validated.
 */
export function StairLessonCard({
  lessonId,
  number,
  title,
  state,
  detail,
  locale = 'en',
  onEnter,
}: StairLessonCardProps) {
  const label = actionLabel[locale][state];
  const skipped = state === 'skipped';
  return (
    <article className="stair-lesson-card" data-component="BA-WR-005" data-state={state} data-lesson-id={lessonId}>
      <p className="stair-lesson-card__number">{number}</p>
      <div className="stair-lesson-card__body">
        <h3 className="stair-lesson-card__title">{title}</h3>
        {detail ? <p className="stair-lesson-card__detail">{detail}</p> : null}
        {skipped ? (
          <p className="stair-lesson-card__skip">{locale === 'zh' ? '已掌握 · 跳过' : 'Mastered · skipped'}</p>
        ) : null}
      </div>
      <Button
        className="stair-lesson-card__action"
        data-testid="lesson-row"
        data-state={state}
        data-lesson-focus={lessonId}
        onPress={() => onEnter?.(lessonId)}
      >
        {label}
      </Button>
    </article>
  );
}
