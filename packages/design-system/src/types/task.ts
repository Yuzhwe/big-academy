/**
 * Lesson-local activity row for BA-UI-006.
 *
 * `status` is supplied by a product adapter. This package does not derive
 * done, locked, or skipped from course progress, and it does not call
 * Alex `Pages.canOpen` or `Skip.skipped`.
 *
 * Indexes passed to `canOpen` and `onNavigate` are indexes into `tasks`,
 * not Alex's global screen index. Translating those indexes is the adapter's job.
 */
export type TaskProgressStatus = 'done' | 'current' | 'available' | 'locked' | 'skipped';

export interface TaskProgressItem {
  id: string;
  /** Activity title. The caller passes the already chosen locale. */
  label: string;
  status: TaskProgressStatus;
  /** 1-based number drawn in the chip. Defaults to index + 1. */
  number?: number;
  /** Original practice ended by revealing an answer rather than a correct response. */
  shown?: boolean;
}

export type BALocale = 'en' | 'zh';
