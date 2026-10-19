import { CourseApp } from './course/CourseApp';
import { PilotPreview } from './PilotPreview';

/**
 * `?fixture=` keeps the Top Bar pilot.
 * Every other visit is the Alex-backed Writing path.
 */
export function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('fixture')) return <PilotPreview />;
  return <CourseApp />;
}
