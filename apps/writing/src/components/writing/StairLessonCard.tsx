import { BAButton, BAIcon, type BALocale } from '@big-academy/design-system';
import './StairLessonCard.css';

export type StairLessonState = 'start' | 'continue' | 'review' | 'locked' | 'skipped';

export interface StairLessonCardProps {
  lessonId: string;
  number: number;
  title: string;
  state: StairLessonState;
  minutes?: number;
  /** Legacy supporting text: only shown when a duration was not supplied. */
  detail?: string;
  locale?: BALocale;
  onEnter?: (lessonId: string) => void;
}

const actionLabel: Record<BALocale, Record<StairLessonState, string>> = {
  en: { start: 'Start', continue: 'Continue', review: 'Review', locked: 'Locked', skipped: 'Review' },
  zh: { start: '开始', continue: '继续', review: '复习', locked: '未解锁', skipped: '复习' },
};

const statusLabel: Record<BALocale, Record<StairLessonState, string>> = {
  en: { start: 'Available', continue: 'In progress', review: 'Completed', locked: 'Locked', skipped: 'Skipped' },
  zh: { start: '可开始', continue: '进行中', review: '已完成', locked: '未解锁', skipped: '已跳过' },
};

/**
 * BA-WR-005 · reusable presentation, not progress authority.
 * The product provides the real state and duration; it alone decides unlock.
 * Geometry and seal details remain candidates until designer visual review.
 */
export function StairLessonCard({
  lessonId, number, title, state, minutes, detail, locale = 'en', onEnter,
}: StairLessonCardProps) {
  const locked = state === 'locked';
  const complete = state === 'review' || state === 'skipped';
  const label = actionLabel[locale][state];
  const stateText = statusLabel[locale][state];
  return (
    <article
      className="stair-lesson-card"
      data-component="BA-WR-005"
      data-state={state}
      data-lesson-id={lessonId}
      lang={locale === 'zh' ? 'zh-CN' : 'en'}
      aria-label={(locale === 'zh' ? '第' + number + '课' : 'Lesson ' + number) + ': ' + title + ' · ' + stateText}
    >
      <div className="stair-lesson-card__seal" aria-hidden="true">
        <span className="stair-lesson-card__number">{number}</span>
        {state !== 'start' ? (
          <span className="stair-lesson-card__symbol">
            {locked ? <BAIcon name="lock" size={14} strokeWidth={2} /> :
              complete ? <BAIcon name="check" size={15} strokeWidth={2.4} /> :
              <span className="stair-lesson-card__current-dot" />}
          </span>
        ) : null}
      </div>
      <div className="stair-lesson-card__body">
        <h3 className="stair-lesson-card__title" title={title}>{title}</h3>
        {minutes !== undefined ? (
          <p className="stair-lesson-card__duration">
            <span className="stair-lesson-card__duration-number">{minutes}</span> {locale === 'zh' ? '分钟' : 'min'}
          </p>
        ) : detail ? <p className="stair-lesson-card__duration">{detail}</p> : null}
        {state === 'skipped' ? (
          <p className="stair-lesson-card__skip">{locale === 'zh' ? '已掌握 · 跳过' : 'Mastered · skipped'}</p>
        ) : null}
      </div>
      <BAButton
        className="stair-lesson-card__action"
        size={70}
        radius="full"
        variant={state === 'start' || state === 'continue' ? 'primary' : 'secondary'}
        locale={locale}
        disabled={locked}
        dataAttributes={{ 'data-testid': 'lesson-row', 'data-state': state, 'data-lesson-focus': lessonId }}
        onPress={() => onEnter?.(lessonId)}
      >
        {label}
      </BAButton>
    </article>
  );
}

