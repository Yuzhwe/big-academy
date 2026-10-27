/** Motion policy and session-only E-01 entry receipts; never touches Alex records. */
export type MotionMode = 'high' | 'low';
export function resolveMotionMode(preference: MotionMode, systemReduced: boolean): MotionMode {
  return systemReduced ? 'low' : preference;
}

const receiptPrefix = 'ba-writing-staircase-entry-v1:';
const seenThisDocument = new Set<string>();

/** Returns true on the first visit to a Level in this browser-tab session.
 * SessionStorage survives reloads but not a new browsing session; in-memory
 * fallback covers private modes that deny storage access and React remounts.
 */
export function claimLevelIntro(levelId: string, storage?: Pick<Storage, 'getItem' | 'setItem'> | null): boolean {
  const key = receiptPrefix + levelId;
  if (seenThisDocument.has(key)) return false;
  try {
    const target = storage === undefined ? (typeof window === 'undefined' ? null : window.sessionStorage) : storage;
    if (target?.getItem(key) === '1') {
      seenThisDocument.add(key);
      return false;
    }
    target?.setItem(key, '1');
  } catch {
    // A denied sessionStorage access must not affect learning or navigation.
  }
  seenThisDocument.add(key);
  return true;
}
