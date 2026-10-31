import type { HTMLAttributes, ReactNode } from 'react';
import './CoachNote.css';

export type CoachNoteTone = 'highlight' | 'improvement';

export type CoachNoteProps = {
  tone: CoachNoteTone;
  /** Defaults to Highlight / Improvement. */
  title?: string;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'children' | 'className'>;

const DEFAULT_TITLE: Record<CoachNoteTone, string> = {
  highlight: 'Highlight',
  improvement: 'Improvement',
};

/**
 * BA-WR-017 · CoachNote
 * Reusable Highlight / Improvement margin note card (Joe Apply Check reference).
 * Library catalog key: coach-note. Not a CoachMessage substitute.
 */
export function CoachNote({ tone, title, children, className, ...rest }: CoachNoteProps) {
  const resolvedTitle = title ?? DEFAULT_TITLE[tone];
  const classes = ['coach-note', className].filter(Boolean).join(' ');
  return (
    <article
      className={classes}
      data-tone={tone}
      data-component="BA-WR-017"
      data-testid={`coach-note-${tone}`}
      {...rest}
    >
      <p className="coach-note__title">{resolvedTitle}</p>
      <div className="coach-note__body">{children}</div>
    </article>
  );
}
