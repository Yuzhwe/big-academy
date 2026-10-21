import { BAButton } from '@big-academy/design-system';
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
  en: { start: 'Start', continue: 'Continue', review: 'Review', locked: 'Locked', skipped: 'Review' },
  zh: { start: '开始', continue: '继续', review: '复习', locked: '未解锁', skipped: '复习' },
};

const statusLabel: Record<BALocale, Record<StairLessonState, string>> = {
  en: { start: 'Available', continue: 'Current', review: 'Completed', locked: 'Locked', skipped: 'Skipped' },
  zh: { start: '可开始', continue: '进行中', review: '已完成', locked: '未解锁', skipped: '已跳过' },
};

/** BA-WR-005 · R2 candidate visuals. Eligibility is owned by the course session. */
export function StairLessonCard({
  lessonId, number, title, state, detail, locale = 'en', onEnter,
}: StairLessonCardProps) {
  const locked = state === 'locked';
  const complete = state === 'review';
  const caption = statusLabel[locale][state];
  return (
    <article className="stair-lesson-card" data-component="BA-WR-005" data-state={state} data-lesson-id={lessonId}>
      <div className="stair-lesson-card__status" aria-label={caption}>
        <span className="stair-lesson-card__number">{number}</span>
        {complete ? <span className="stair-lesson-card__state-word">{locale === 'zh' ? '完成 ✓' : 'Completed ✓'}</span> : null}
        {locked ? <span className="stair-lesson-card__state-word" aria-hidden="true">🔒</span> : null}
      </div>
      <div className="stair-lesson-card__body">
        <h3 className="stair-lesson-card__title" title={title}>{title}</h3>
        <p className="stair-lesson-card__detail">{detail ?? ''}</p>
      </div>
      <BAButton
        className="stair-lesson-card__action"
        variant={locked ? 'secondary' : 'primary'}
        size={70}
        radius="full"
        locale={locale}
        disabled={locked}
        aria-label={`${title}: ${caption}, ${actionLabel[locale][state]}`}
        onPress={() => onEnter?.(lessonId)}
      >
        <span data-testid="lesson-row" data-state={state} data-lesson-focus={lessonId}>
          {actionLabel[locale][state]}
        </span>
      </BAButton>
    </article>
  );
}
