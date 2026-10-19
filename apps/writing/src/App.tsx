import { CourseApp } from './course/CourseApp';
import { PilotPreview } from './PilotPreview';
import { DesignSystemPreview } from './DesignSystemPreview';

/**
 * `?fixture=` keeps the Top Bar pilot.
 * Every other visit is the Alex-backed Writing path.
 */
export function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('system')) return <DesignSystemPreview />;
  if (params.has('fixture')) return <PilotPreview />;
  return <CourseApp />;
}
