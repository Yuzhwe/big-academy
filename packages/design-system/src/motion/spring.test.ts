import {describe,expect,it,vi} from 'vitest';
import {animateSpring,readSpringPreset} from './spring';
describe('token-driven runtime motion',()=>{
 it('reads source-owned spring parameters without inventing absent mass',()=>{
  const root=document.createElement('div');
  root.style.setProperty('--ba-motion-spring-bubble-enter-stiffness','450');
  root.style.setProperty('--ba-motion-spring-bubble-enter-damping','24');
  expect(readSpringPreset('bubble-enter',root)).toEqual({stiffness:450,damping:24});
 });
 it('uses reduced-motion instantly and never starts frames',()=>{
  const update=vi.fn();
  const original=globalThis.requestAnimationFrame;
  const raf=vi.fn(()=>1);
  globalThis.requestAnimationFrame=raf;
  animateSpring({preset:'gentle',from:0,to:1,update,reducedMotion:true});
  expect(update).toHaveBeenCalledWith(1);
  expect(raf).not.toHaveBeenCalled();
  globalThis.requestAnimationFrame=original;
 });
 it('reads active numeric tokens and fails on absent parameters',()=>{
  const root=document.createElement('div');
  root.style.setProperty('--ba-motion-spring-snappy-stiffness','320');
  root.style.setProperty('--ba-motion-spring-snappy-damping','28');
  root.style.setProperty('--ba-motion-spring-snappy-mass','1');
  expect(readSpringPreset('snappy',root)).toEqual({stiffness:320,damping:28,mass:1});
  expect(()=>readSpringPreset('heavy-snap',root)).toThrow(/Missing authored spring token/);
 });
});
