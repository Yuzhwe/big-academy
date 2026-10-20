import { useEffect, useRef, useState } from 'react';
import type { CourseSession, ParticleCelebration } from '../product/courseSession';
import { startEffect } from '../celebration/particleRuntime';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Non-blocking ribbons and explosions. Receipts are written only after playback starts. */
export function LessonParticles({ session }: { session: CourseSession }) {
  const particle = session.particle;
  const [shown, setShown] = useState<ParticleCelebration | null>(null);
  const started = useRef<string | null>(null);

  useEffect(() => {
    if (!particle || started.current === particle.id) return;
    started.current = particle.id;
    const current = particle;
    setShown(current);
    const reduced = typeof window.matchMedia !== 'function' || window.matchMedia(REDUCED_MOTION).matches;
    const practice = current.kind === 'practice';
    window.setTimeout(() => setShown((value) => (value?.id === current.id ? null : value)), practice ? 1600 : 3200);
    if (reduced) {
      session.acknowledgeParticle(current.id);
      return;
    }
    const bursts = practice ? 1 : 3;
    for (let index = 0; index < bursts; index += 1) {
      window.setTimeout(() => {
        startEffect('explosions', `writing-boom-${current.id}-${index}`).catch(() => undefined);
      }, 180 + index * 420);
    }
    startEffect('ribbons', `writing-ribbons-${current.id}`, { count: practice ? 8 : 30 })
      .then(() => session.acknowledgeParticle(current.id))
      .catch(() => undefined);
  }, [particle, session]);

  if (!shown) return null;
  const reduced = typeof window.matchMedia !== 'function' || window.matchMedia(REDUCED_MOTION).matches;
  return (
    <div className="course-particle" data-kind={shown.kind}>
      {reduced ? <p role="status">{shown.label}</p> : <p className="visually-hidden" role="status">{shown.label}</p>}
      <div id={`writing-ribbons-${shown.id}`} />
    </div>
  );
}
