import type { ReactNode } from 'react';
import './LessonWorkspace.css';

export type CoachMessageTone = 'orientation' | 'hint' | 'correct' | 'wrong';

export function CoachMessage({ children, tone = 'orientation', ...props }: {
  children: ReactNode; tone?: CoachMessageTone; role?: 'status'; 'data-testid'?: string;
}) {
  return <p className="lesson-workspace__message" data-tone={tone} {...props}>{children}</p>;
}

export interface LessonWorkspaceProps {
  activity: ReactNode;
  coach: ReactNode;
  navigation: ReactNode;
  /** Previous/Next is the 1:2 pair. Lesson end uses three full-width actions. */
  navigationLayout?: 'pair' | 'end';
}

/**
 * BA-WR-002 · paper column and coach column.
 * Previous and the primary action sit at the bottom of the Coach rail.
 * Visual treatment is a candidate Warm Frame. Not validated.
 */
export function LessonWorkspace({ activity, coach, navigation, navigationLayout = 'pair' }: LessonWorkspaceProps) {
  return (
    <div className="lesson-workspace" data-component="BA-WR-002" data-layout="paper-coach">
      <main id="course-main" tabIndex={-1} className="lesson-workspace__paper" data-testid="activity">
        {activity}
      </main>
      <aside className="lesson-workspace__rail">
        <div className="lesson-workspace__coach" data-testid="coach">
          {coach}
        </div>
        <div className="lesson-workspace__footer" data-testid="lesson-footer" data-layout={navigationLayout} data-span="rail">
          {navigation}
        </div>
      </aside>
    </div>
  );
}
