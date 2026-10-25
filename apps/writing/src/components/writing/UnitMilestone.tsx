import { Button } from 'react-aria-components';
import type { BALocale } from '@big-academy/design-system';
import './UnitMilestone.css';
import badgeSeal from '../../assets/r2.12/badge-seal.webp';
import badgeCheck from '../../assets/r2.12/badge-check.webp';

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
      <p className="unit-milestone__kicker" hidden>
        {completed ? (zh ? '已完成的里程碑' : 'Milestone reached') : zh ? '里程碑' : 'Milestone'}
      </p>
      <h3 className="unit-milestone__title">{title}</h3>
      <Button
        className="unit-milestone__action"
        data-testid="milestone"
        data-done={completed ? '1' : '0'}
        isDisabled={!completed}
        aria-label={title + (completed ? (zh ? ' · 再看一次' : ' · Play again') : (zh ? ' · 未解锁' : ' · Locked'))}
        onPointerMove={(event) => {
          if (event.pointerType === 'touch' || (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
          const box = event.currentTarget.getBoundingClientRect();
          const dx = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - .5) * 2));
          const dy = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - .5) * 2));
          event.currentTarget.style.setProperty('--rx', `${-dy * 15}deg`);
          event.currentTarget.style.setProperty('--ry', `${dx * 15}deg`);
          event.currentTarget.style.setProperty('--shift-2x', `${dx * 5}px`);
          event.currentTarget.style.setProperty('--shift-2y', `${dy * 5}px`);
        }}
        onPointerLeave={(event) => { event.currentTarget.style.setProperty('--rx', '0deg'); event.currentTarget.style.setProperty('--ry', '0deg'); event.currentTarget.style.setProperty('--shift-2x', '0px'); event.currentTarget.style.setProperty('--shift-2y', '0px'); }}
        onPress={() => {
          if (completed) onCelebrate?.(unitId);
        }}
      >
        <img src={badgeSeal} alt="" draggable={false} /><img src={badgeCheck} alt="" draggable={false} />
        <span className="course-sr">{completed ? (zh ? '再看一次' : 'Play again') : zh ? '还没到' : 'Not yet'}</span>
      </Button>
    </div>
  );
}
