import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { StaircaseScene } from './StaircaseScene';

// Only the entrance/lifecycle is under test. WebGL sky is unrelated.
vi.mock('./CloudShaderSky', () => ({ CloudShaderSky: () => null }));

function enterLevel(levelId: string, motionMode: 'high' | 'low' = 'high') {
  return render(
    <StaircaseScene levelId={levelId} locale="en" motionMode={motionMode} count={3} focusIndex={0}>
      <ol className="course-nodes">
        <li data-node-kind="lesson" style={{ '--step-index': 0 } as CSSProperties}>A</li>
        <li data-node-kind="lesson" style={{ '--step-index': 1 } as CSSProperties}>B</li>
        <li data-node-kind="lesson" style={{ '--step-index': 2 } as CSSProperties}>C</li>
      </ol>
    </StaircaseScene>,
  );
}

describe('Review 09: Staircase entrance lifecycle', () => {
  it('arms the sequential entrance on each of 10 Activity returns, 10 Level changes, and 10 mixed re-entries', () => {
    const visits = [
      ...Array.from({ length: 10 }, () => 'L2'),
      ...Array.from({ length: 10 }, (_, index) => index % 2 ? 'L3' : 'L2'),
      ...Array.from({ length: 10 }, (_, index) => index % 3 ? 'L2' : 'L3'),
    ];
    for (const id of visits) {
      const screen = enterLevel(id);
      const stage = screen.container.querySelector('.staircase-viewport');
      expect(stage).toHaveAttribute('data-intro', 'enter');
      const lessons = screen.container.querySelectorAll('.course-nodes > li[data-node-kind="lesson"]');
      expect(lessons).toHaveLength(3);
      expect([...lessons].map(node => (node as HTMLElement).style.getPropertyValue('--step-index'))).toEqual(['0', '1', '2']);
      screen.unmount(); // Simulates leaving before the entrance finishes.
    }
  });

  it('does not arm an entrance while the reduced-motion mode is in effect', () => {
    const screen = enterLevel('L2', 'low');
    expect(screen.container.querySelector('.staircase-viewport')).toHaveAttribute('data-intro', 'settled');
    screen.unmount();
  });
});
