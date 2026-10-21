import type { ReactNode } from 'react';
import './LessonWorkspace.css';

export interface LessonWorkspaceProps {
  activity: ReactNode;
  coach: ReactNode;
  navigation: ReactNode;
  /** Previous/Next is the 1:2 pair. Lesson end uses three full-width actions. */
  navigationLayout?: 'pair' | 'end';
}

/**
 * BA-WR-002 · paper column and coach column.
 * Previous and Next sit in a lesson-wide footer under both columns, outside Coach.
 * Visual treatment is a candidate Warm Frame. Not validated.
 */
export function LessonWorkspace({ activity, coach, navigation, navigationLayout = 'pair' }: LessonWorkspaceProps) {
  return (
    <div className="lesson-workspace" data-component="BA-WR-002" data-layout="paper-coach">
      <div className="lesson-workspace__paper" data-testid="activity">
        {activity}
      </div>
      <div className="lesson-workspace__rail">
        <div className="lesson-workspace__coach" data-testid="coach">
          {coach}
        </div>
      </div>
      <div className="lesson-workspace__footer" data-testid="lesson-footer" data-layout={navigationLayout} data-span="lesson">
        {navigation}
      </div>
    </div>
  );
}
