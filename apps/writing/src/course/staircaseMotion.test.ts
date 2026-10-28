import {describe, it, expect} from 'vitest';
import {claimLevelIntro, resolveMotionMode} from './staircaseMotion';

describe('Review 06 motion preference and per-Level session receipts', () => {
  it('always gives live system reduced motion priority over selected High', () => {
    expect(resolveMotionMode('high', false)).toBe('high');
    expect(resolveMotionMode('low', false)).toBe('low');
    expect(resolveMotionMode('high', true)).toBe('low');
    expect(resolveMotionMode('low', true)).toBe('low');
  });
  it('claims only the first visit for each Level without touching learning storage', () => {
    const entries = new Map<string, string>();
    const store = {getItem:(key:string)=>entries.get(key)??null, setItem:(key:string,value:string)=>{entries.set(key,value);}};
    expect(claimLevelIntro('Review06-test-L0',store)).toBe(true);
    expect(claimLevelIntro('Review06-test-L0',store)).toBe(false);
    expect(claimLevelIntro('Review06-test-L1',store)).toBe(true);
    expect(claimLevelIntro('Review06-test-L1',store)).toBe(false);
    expect(entries.size).toBe(2);
    expect([...entries.keys()].every(key=>key.startsWith('ba-writing-staircase-entry-v1:'))).toBe(true);
  });
  it('does not replay when a saved session receipt already exists on page load', () => {
    const store = {getItem:(key:string)=>key.endsWith(':Review06-restored')?'1':null, setItem:()=>{throw Error('should not rewrite saved receipt');}};
    expect(claimLevelIntro('Review06-restored',store)).toBe(false);
  });
  it('still prevents remount replay when sessionStorage is denied', () => {
    const denied = {getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}};
    expect(claimLevelIntro('Review06-denied',denied)).toBe(true);
    expect(claimLevelIntro('Review06-denied',denied)).toBe(false);
  });
});
