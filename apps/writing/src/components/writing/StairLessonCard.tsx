import { Button } from 'react-aria-components';
import { BAIcon, type BALocale } from '@big-academy/design-system';
import './StairLessonCard.css';

export type StairLessonState = 'start' | 'continue' | 'review' | 'locked' | 'skipped';
export type StairLessonLocation = 'current' | 'available' | 'completed' | 'locked' | 'skipped';

export interface StairLessonCardProps {
  lessonId: string;
  number: number;
  title: string;
  state: StairLessonState;
  location?: StairLessonLocation;
  detail?: string;
  locale?: BALocale;
  onEnter?: (lessonId: string) => void;
}

const actionLabel: Record<BALocale, Record<StairLessonState, string>> = {
  en: { start: 'Start', continue: 'Continue', review: 'Review', locked: 'Locked', skipped: 'Review' },
  zh: { start: '开始', continue: '继续', review: '复习', locked: '未解锁', skipped: '复习' },
};

function locationFromState(state: StairLessonState): StairLessonLocation {
  if (state === 'continue') return 'current';
  if (state === 'review') return 'completed';
  if (state === 'locked') return 'locked';
  if (state === 'skipped') return 'skipped';
  return 'available';
}

/**
 * BA-WR-005 · path lesson card.
 * Status and number share one upper-left assembly. The card does not decide unlock.
 */
export function StairLessonCard({
  lessonId,
  number,
  title,
  state,
  location,
  detail,
  locale = 'en',
  onEnter,
}: StairLessonCardProps) {
  const place = location ?? locationFromState(state);
  const label = actionLabel[locale][state];
  const zh = locale === 'zh';
  const here = zh ? '你在这里' : "You're here.";
  const done = zh ? '完成 ✓' : 'Completed ✓';
  const lockedLabel = detail || (zh ? '先完成前面的课' : 'Finish prior unit');
  return (
    <article
      className="stair-lesson-card"
      data-component="BA-WR-005"
      data-state={state}
      data-location={place}
      data-lesson-id={lessonId}
      lang={zh ? 'zh-CN' : 'en'}
    >
      <div className="stair-lesson-card__status">
        {place === 'current' ? <p className="stair-lesson-card__here">{here}</p> : null}
        {place === 'completed' ? (
          <p className="stair-lesson-card__capsule">
            <span className="stair-lesson-card__badge">{number}</span>
            <span>{done}</span>
          </p>
        ) : place === 'locked' ? (
          <p className="stair-lesson-card__capsule">
            <span className="stair-lesson-card__badge">{number}</span>
            <span>{lockedLabel}</span>
            <BAIcon name="lock" size={18} />
          </p>
        ) : (
          <p className="stair-lesson-card__badge" aria-hidden="true">{number}</p>
        )}
      </div>
      <div className="stair-lesson-card__body">
        <h3 className="stair-lesson-card__title">{title}</h3>
        {detail && place !== 'locked' ? <p className="stair-lesson-card__detail">{detail}</p> : null}
        {place === 'skipped' ? (
          <p className="stair-lesson-card__skip">{zh ? '已掌握 · 跳过' : 'Mastered · skipped'}</p>
        ) : null}
      </div>
      <Button
        className="stair-lesson-card__action"
        data-testid="lesson-row"
        data-state={state}
        data-lesson-focus={lessonId}
        isDisabled={state === 'locked'}
        onPress={() => onEnter?.(lessonId)}
      >
        {label}
      </Button>
    </article>
  );
}
