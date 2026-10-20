import { lazy, Suspense } from 'react';
import { CourseApp } from './course/CourseApp';
import { PilotPreview } from './PilotPreview';
import { DesignSystemPreview } from './DesignSystemPreview';

const CelebrationEffectsDemo = lazy(() => import('./celebration/CelebrationEffectsDemo'));

/**
 * `?fixture=` keeps the Top Bar pilot.
 * `?demo=celebration-effects` is an isolated, presentation-only review surface.
 * Every other visit is the Alex-backed Writing path.
 */
export function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === 'celebration-effects') {
    return <Suspense fallback={<p role="status">{params.get('locale') === 'zh' ? '正在打开效果预览…' : 'Opening effects preview…'}</p>}><CelebrationEffectsDemo /></Suspense>;
  }
  if (params.has('system')) return <DesignSystemPreview />;
  if (params.has('fixture')) return <PilotPreview />;
  return <CourseApp />;
}
