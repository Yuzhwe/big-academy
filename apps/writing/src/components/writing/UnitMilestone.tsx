import { Button } from 'react-aria-components';
import type { BALocale } from '@big-academy/design-system';
import './UnitMilestone.css';
/* Review 04 R2: optimized PNG derivatives of designer-uploaded 1024px originals. */
import goldCheck from '../../assets/review04/writing_milestone_1.png';
import goldSeal from '../../assets/review04/writing_milestone_2.png';

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
    <div className="unit-milestone" data-component="BA-WR-006" data-state={phase} data-unit={unitId}
      onPointerMove={event=>{
        if(event.pointerType==='touch'||(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches))return;
        const badge=event.currentTarget.querySelector<HTMLElement>('.unit-milestone__action');
        if(!badge)return;
        const box=badge.getBoundingClientRect();
        const dx=Math.max(-1,Math.min(1,((event.clientX-box.left)/box.width-.5)*2));
        const dy=Math.max(-1,Math.min(1,((event.clientY-box.top)/box.height-.5)*2));
        badge.style.setProperty('--rx',`${-dy*15}deg`);
        badge.style.setProperty('--ry',`${dx*15}deg`);
        badge.style.setProperty('--shift-1x',`${dx*2.5}px`);
        badge.style.setProperty('--shift-1y',`${dy*2.5}px`);
        badge.style.setProperty('--shift-2x',`${dx*5}px`);
        badge.style.setProperty('--shift-2y',`${dy*5}px`);
      }}
      onPointerLeave={event=>{
        const badge=event.currentTarget.querySelector<HTMLElement>('.unit-milestone__action');
        if(!badge)return;
        for(const property of ['--rx','--ry'])badge.style.setProperty(property,'0deg');
        for(const property of ['--shift-1x','--shift-1y','--shift-2x','--shift-2y'])badge.style.setProperty(property,'0px');
      }}>
      <p className="unit-milestone__kicker" hidden>
        {completed ? (zh ? '已完成的里程碑' : 'Milestone reached') : zh ? '里程碑' : 'Milestone'}
      </p>
      <h3 className="unit-milestone__title">{title}</h3>
      <Button
        className="unit-milestone__action"
        data-testid="milestone"
        data-done={completed ? '1' : '0'}
        data-shine={completed ? 'true' : undefined}
        isDisabled={!completed}
        aria-label={title + (completed ? (zh ? ' · 再看一次' : ' · Play again') : (zh ? ' · 未解锁' : ' · Locked'))}
        onPress={() => {
          if (completed) onCelebrate?.(unitId);
        }}
      >
        <img src={goldSeal} alt="" draggable={false} /><img src={goldCheck} alt="" draggable={false} />
        <span className="course-sr">{completed ? (zh ? '再看一次' : 'Play again') : zh ? '还没到' : 'Not yet'}</span>
      </Button>
    </div>
  );
}
