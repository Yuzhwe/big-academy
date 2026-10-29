import type { ReactNode } from 'react';
import { I18nProvider } from 'react-aria-components';
import { BAButton, BAIcon, BATaskProgress, localeTag, taskChrome } from '@big-academy/design-system';
import type { BALocale, TaskProgressItem } from '@big-academy/design-system';
import './LessonTopBar.css';

export interface LessonTopBarProps {
  lessonTitle: string;
  lessonNumber: string;
  tasks: readonly TaskProgressItem[];
  /** Index into `tasks` of the activity currently on screen. */
  current: number;
  /**
   * Lesson-local permission gate. The Writing product adapter must delegate
   * this to Alex `Pages.canOpen` for the matching global screen. This component
   * does not compute unlock, skip, or score.
   */
  canOpen: (index: number) => boolean;
  onBack?: () => void;
  onNavigate?: (index: number) => void;
  /** Necessary lesson labels. Hidden visually when the bar is narrow; still read by assistive tech. */
  tags?: readonly string[];
  /** Chrome language only. Lesson title and task labels are already localized by the caller. */
  locale?: BALocale;
  /** Optional top-right controls (e.g. designer Reset Lesson). Empty by default. */
  end?: ReactNode;
}

/**
 * BA-WR-001 · lesson header.
 * The task group is absolutely centered on this header, so a long title
 * cannot push it into leftover space. The end slot holds optional tools.
 */
export function LessonTopBar({
  lessonTitle,
  lessonNumber,
  tasks,
  current,
  canOpen,
  onBack,
  onNavigate,
  tags: _tags,
  locale = 'en',
  end,
}: LessonTopBarProps) {
  const copy = taskChrome(locale);
  const fullTitle = `${lessonNumber} ${lessonTitle}`;

  return (
    <I18nProvider locale={localeTag(locale)}>
      <header
        className="lesson-topbar"
        data-component="BA-WR-001"
        data-layout="viewport-center"
        lang={localeTag(locale)}
      >
        <div className="lesson-topbar__start">
          <BAButton
            variant="ghost"
            iconOnly
            size={50}
            className="lesson-topbar__back"
            locale={locale}
            aria-label={copy.back}
            onPress={() => onBack?.()}
          >
            <BAIcon name="arrow-left" size={20} className="lesson-topbar__back-icon" />
          </BAButton>
          <div className="lesson-topbar__identity">
            <p className="lesson-topbar__title" title={fullTitle}>
              <span className="lesson-topbar__number">{lessonNumber}</span>
              <span className="lesson-topbar__name">{lessonTitle}</span>
              <span className="lesson-topbar__tag">G2-O</span>
            </p>
          </div>
        </div>
        <div className="lesson-topbar__center">
          <BATaskProgress
            tasks={tasks}
            activeIndex={current}
            canOpen={canOpen}
            onNavigate={onNavigate}
            locale={locale}
            label={locale === 'zh' ? `${lessonNumber}的任务` : `Tasks in ${lessonNumber}`}
          />
        </div>
        <div className="lesson-topbar__end" data-slot="end" {...(end ? {} : { 'aria-hidden': true as const })}>
          {end}
        </div>
      </header>
    </I18nProvider>
  );
}
