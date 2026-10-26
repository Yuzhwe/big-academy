import {describe,it,expect} from 'vitest';
import {FLAG_DEFAULTS,flagOffsetY,flagPhase} from './LevelRewardFlag';
import {defaultScene,readScene,sceneSearch} from '../../../library/src/catalog';

describe('BA-WR-011 · yarden Flutter-to-Canvas sine wave',()=>{
 it('has exactly 1.6s / waves 6 / amplitude 4px defaults',()=>{
   expect(FLAG_DEFAULTS).toEqual({period:1.6,waves:6,amplitude:4});
 });
 it('uses waves times PI, so waves=6 means three full across-width sine cycles',()=>{
   const width=200,amp=4,waves=6;
   expect(flagOffsetY(0,width,waves,amp,0)).toBeCloseTo(0);
   expect(flagOffsetY(width/12,width,waves,amp,0)).toBeCloseTo(4);
   expect(flagOffsetY(width/6,width,waves,amp,0)).toBeCloseTo(0);
   expect(flagOffsetY(width,width,waves,amp,0)).toBeCloseTo(0);
 });
 it('advances by elapsed time, not frame count; reset phase is zero',()=>{
   expect(flagPhase(0,1.6)).toBe(0);
   expect(flagPhase(.4,1.6)).toBeCloseTo(Math.PI/2);
   expect(flagPhase(1.6,1.6)).toBeCloseTo(2*Math.PI);
 });
 it('round-trips all designer controls through shareable URL without uploading any image',()=>{
   const after=readScene(sceneSearch({...defaultScene,component:'flag',
     flagAmplitude:4,flagWaves:6,flagPeriod:1.6,flagPlaying:false,flagReset:3}));
   expect(after.flagAmplitude).toBe(4);
   expect(after.flagWaves).toBe(6);
   expect(after.flagPeriod).toBe(1.6);
   expect(after.flagPlaying).toBe(false);
   expect(after.flagReset).toBe(3);
 });
});
