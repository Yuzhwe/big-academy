import {describe,it,expect} from 'vitest';
import {FLAG_DEFAULTS,flagOffsetY,flagPhase} from './LevelRewardFlag';
import {defaultScene,readScene,sceneSearch} from '../../../library/src/catalog';

describe('BA-WR-011 · yarden Flutter-to-Canvas sine wave',()=>{
 it('has exactly 3s / waves 5 / amplitude 3px defaults',()=>{
   expect(FLAG_DEFAULTS).toEqual({period:3,waves:5,amplitude:3});
 });
 it('uses waves times PI, so waves=5 keeps the column sine formula',()=>{
   const width=200,amp=3,waves=5;
   expect(flagOffsetY(0,width,waves,amp,0)).toBeCloseTo(0);
   expect(flagOffsetY(width/10,width,waves,amp,0)).toBeCloseTo(3);
   expect(flagOffsetY(width/5,width,waves,amp,0)).toBeCloseTo(0);
   expect(flagOffsetY(width,width,waves,amp,0)).toBeCloseTo(0);
 });
 it('advances by elapsed time, not frame count; reset phase is zero',()=>{
   expect(flagPhase(0,1.6)).toBe(0);
   expect(flagPhase(.75,3)).toBeCloseTo(Math.PI/2);
   expect(flagPhase(3,3)).toBeCloseTo(2*Math.PI);
 });
 it('round-trips all designer controls through shareable URL without uploading any image',()=>{
   const after=readScene(sceneSearch({...defaultScene,component:'flag',
     flagAmplitude:3,flagWaves:5,flagPeriod:3,flagPlaying:false,flagReset:3}));
   expect(after.flagAmplitude).toBe(3);
   expect(after.flagWaves).toBe(5);
   expect(after.flagPeriod).toBe(3);
   expect(after.flagPlaying).toBe(false);
   expect(after.flagReset).toBe(3);
 });
});
