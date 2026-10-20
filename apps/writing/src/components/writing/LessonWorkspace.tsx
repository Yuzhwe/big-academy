import type { ReactNode } from 'react';
import './LessonWorkspace.css';

export interface LessonWorkspaceProps {
  activity: ReactNode;
  coach: ReactNode;
  navigation: ReactNode;
}

/**
 * BA-WR-002 · paper column and coach column.
 * The footer slot is a sibling of the scrolling coach, pinned to the rail.
 * Visual treatment is a candidate Warm Frame. Not validated.
 */
export function LessonWorkspace({ activity, coach, navigation }: LessonWorkspaceProps) {
  return (
    <div className="lesson-workspace" data-component="BA-WR-002" data-layout="paper-coach">
      <div className="lesson-workspace__paper" data-testid="activity">
        {activity}
      </div>
      <div className="lesson-workspace__rail">
        <div className="lesson-workspace__coach" data-testid="coach">
          {coach}
        </div>
        <div className="lesson-workspace__footer" data-testid="lesson-footer">
          {navigation}
        </div>
      </div>
    </div>
  );
}
