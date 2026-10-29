/** Staircase motion policy: visual-only; never touches Alex progress records. */
export type MotionMode = 'high' | 'low';
export function resolveMotionMode(preference: MotionMode, systemReduced: boolean): MotionMode {
  return systemReduced ? 'low' : preference;
}

/** A fresh Staircase entry (including a Level switch) plays its original stagger
 * unless reduced motion is active. Unlike the old per-Level session receipt,
 * this decision is repeatable after each remount and does not use storage.
 */
export function shouldStartStaircaseIntro(mode: MotionMode): boolean {
  return mode === 'high';
}
