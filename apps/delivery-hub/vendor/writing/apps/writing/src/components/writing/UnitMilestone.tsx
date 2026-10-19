import { Button } from 'react-aria-components';
import type { BALocale } from '@big-academy/design-system';
import './UnitMilestone.css';

export interface UnitMilestoneProps {
  unitId: string;
  title: string;
  completed: boolean;
  locale?: BALocale;
  /**
   * True only for the automatic first-return highlight.
   * A completed milestone can still be replayed when this is false.
   * Celebration does not change course progress.
   */
  celebrationEligible: boolean;
  onCelebrate?: (unitId: string) => void;
}

/**
 * BA-WR-006 · unit milestone.
 * Completion is injected by the product session from Alex lesson states.
 * Candidate Warm Frame. Not validated.
 */
export function UnitMilestone({
  unitId,
  title,
  completed,
  celebrationEligible,
  locale = 'en',
  onCelebrate,
}: UnitMilestoneProps) {
  const phase = !completed ? 'upcoming' : celebrationEligible ? 'newly-completed' : 'completed';
  const zh = locale === 'zh';
  return (
    <div className="unit-milestone" data-component="BA-WR-006" data-state={phase} data-unit={unitId}>
      <p className="unit-milestone__kicker">
        {completed ? (zh ? '已完成的里程碑' : 'Milestone reached') : zh ? '里程碑' : 'Milestone'}
      </p>
      <h3 className="unit-milestone__title">{title}</h3>
      <Button
        className="unit-milestone__action"
        data-testid="milestone"
        data-done={completed ? '1' : '0'}
        isDisabled={!completed}
        onPress={() => {
          if (completed) onCelebrate?.(unitId);
        }}
      >
        {completed ? (zh ? '再看一次' : 'Play again') : zh ? '还没到' : 'Not yet'}
      </Button>
    </div>
  );
}
