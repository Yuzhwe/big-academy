import { Button } from 'react-aria-components';
import { BAIcon } from './BAIcon';
import type { TaskProgressStatus } from '../../types/task';
import './ActivityScreenIndicator.css';

export type IndicatorProgress = 'incomplete' | 'done' | 'locked' | 'skipped';
export type IndicatorSize = 'compact' | 'regular';

export interface ActivityScreenIndicatorProps {
  screenNumber: number;
  /** Full accessible name, including the status phrase. */
  accessibleName: string;
  /** Visible skipped caption. Other statuses stay in the accessible name. */
  caption?: string;
  progressStatus: IndicatorProgress;
  isSelected: boolean;
  canOpen: boolean;
  revealed?: boolean;
  size?: IndicatorSize;
  onNavigate?: () => void;
}

/**
 * BA-UI-006 visual primitive.
 * Numerals stay in the main circle. Done and locked add a lower status circle
 * with no connecting line. Selected is independent of progress.
 * Visual treatment is in review, not designer-approved.
 */
export function ActivityScreenIndicator({
  screenNumber,
  accessibleName,
  caption,
  progressStatus,
  isSelected,
  canOpen,
  revealed = false,
  size = 'compact',
  onNavigate,
}: ActivityScreenIndicatorProps) {
  const openable = progressStatus !== 'locked' && canOpen;
  const badge = revealed ? 'shown' : progressStatus === 'done' ? 'done' : progressStatus === 'locked' ? 'locked' : null;
  return (
    <Button
      className="activity-indicator"
      data-progress={progressStatus}
      data-selected={isSelected ? 'true' : 'false'}
      data-revealed={revealed ? 'true' : undefined}
      data-size={size}
      data-screen-number={screenNumber}
      isDisabled={!openable}
      aria-current={isSelected ? 'step' : undefined}
      aria-label={accessibleName}
      onPress={() => {
        if (openable) onNavigate?.();
      }}
    >
      <span className="activity-indicator__circle" aria-hidden="true">
        <span className="activity-indicator__number">{screenNumber}</span>
      </span>
      {badge ? (
        <span className={`activity-indicator__badge activity-indicator__badge--${badge}`} aria-hidden="true">
          {badge === 'locked' ? (
            <BAIcon name="lock" size={10} className="ba-task-progress__icon" />
          ) : (
            <BAIcon name="check" size={10} className="ba-task-progress__icon" />
          )}
        </span>
      ) : (
        <span className="activity-indicator__badge activity-indicator__badge--spacer" aria-hidden="true" />
      )}
      {progressStatus === 'skipped' && caption ? <span className="activity-indicator__caption">{caption}</span> : null}
    </Button>
  );
}

export function indicatorProgress(status: TaskProgressStatus): IndicatorProgress {
  if (status === 'done') return 'done';
  if (status === 'locked') return 'locked';
  if (status === 'skipped') return 'skipped';
  return 'incomplete';
}
