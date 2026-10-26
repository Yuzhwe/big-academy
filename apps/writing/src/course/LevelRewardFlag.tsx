import {useEffect,useMemo,useRef} from 'react';
import artwork from '../assets/r2.12/level-flag.svg?raw';
import './LevelRewardFlag.css';

/**
 * BA-WR-011 · adapted browser Canvas column-slice waving.
 * Reference: yarden, https://stackoverflow.com/a/78383275
 * Retrieved 2026-10-26; cited source license CC BY-SA 4.0.
 * Adapted from Flutter CustomPainter to browser Canvas; no copied shader.
 * Final user-supplied flag image has NOT arrived: R2.12 SVG is TEMPORARY art.
 */
export const FLAG_DEFAULTS={period:1.6,waves:6,amplitude:4} as const;
export interface LevelRewardFlagProps {
  period?:number; waves?:number; amplitude?:number;
  playing?:boolean;resetKey?:number;imageSrc?:string;
}
function splitArtwork() {
  if(typeof DOMParser==='undefined') return {cloth:'',staticSvg:artwork};
  const parser=new DOMParser();
  const original=parser.parseFromString(artwork,'image/svg+xml').documentElement;
  const fixed=original.cloneNode(true) as Element;
  fixed.querySelectorAll('.flag-cloth,.flag-highlight,.flag-emblem').forEach(el=>el.remove());
  const fabric=original.cloneNode(true) as Element;
  fabric.querySelectorAll('ellipse,rect,circle').forEach(el=>el.remove());
  const serialize=new XMLSerializer();
  return {cloth:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(serialize.serializeToString(fabric)),
    staticSvg:serialize.serializeToString(fixed)};
}
export function LevelRewardFlag({
  period=FLAG_DEFAULTS.period,waves=FLAG_DEFAULTS.waves,
  amplitude=FLAG_DEFAULTS.amplitude,playing=true,resetKey=0,imageSrc
}:LevelRewardFlagProps){
  const canvas=useRef<HTMLCanvasElement>(null);
  const phaseRef=useRef(0);
  const previousTick=useRef<number|null>(null);
  const {cloth,staticSvg}=useMemo(splitArtwork,[]);
  useEffect(()=>{phaseRef.current=0;previousTick.current=null;},[resetKey]);
  useEffect(()=>{
    const element=canvas.current;
    if(!element)return;
    const context=element.getContext('2d');
    if(!context)return;
    const deviceScale=Math.min(Math.max(window.devicePixelRatio||1,1),2);
    const w=200,h=160,pad=12;
    element.width=Math.round(w*deviceScale);
    element.height=Math.round((h+2*pad)*deviceScale);
    context.setTransform(deviceScale,0,0,deviceScale,0,0);
    const image=new Image();
    const media=typeof window.matchMedia==='function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)'):null;
    let disposed=false,frame=0,ready=false;
    const draw=(now:number)=>{
      if(disposed)return;
      if(previousTick.current===null)previousTick.current=now;
      const delta=Math.min(Math.max(0,(now-previousTick.current)/1000),.25);
      previousTick.current=now;
      const reduced=media?.matches??false;
      if(playing&&!reduced)phaseRef.current+=2*Math.PI*delta/Math.max(.1,period);
      context.clearRect(0,0,w,h+2*pad);
      if(ready){
        const one=1/deviceScale;
        // Each slice spans one physical drawing pixel; tiny overlap avoids
        // antialiasing seams, never re-scales or skews the source image.
        for(let i=0;i<element.width;i++){
          const x=i/deviceScale;
          const offset=amplitude*Math.sin((x/w)*waves*Math.PI+(reduced?0:phaseRef.current));
          context.drawImage(image,x,0,one,h,x,pad+offset,one+.35/deviceScale,h);
        }
      }
      if(playing&&!reduced)frame=requestAnimationFrame(draw);
    };
    const wake=()=>{cancelAnimationFrame(frame);previousTick.current=null;frame=requestAnimationFrame(draw);};
    image.onload=()=>{if(!disposed){ready=true;wake();}};
    image.onerror=()=>{if(!disposed){ready=false;wake();}};
    image.src=imageSrc||cloth;
    media?.addEventListener?.('change',wake);
    if(!playing)wake(); // render first static/paused frame
    return()=>{disposed=true;cancelAnimationFrame(frame);media?.removeEventListener?.('change',wake);image.onload=null;image.onerror=null;previousTick.current=null;};
  },[amplitude,waves,period,playing,imageSrc,cloth,resetKey]);
  return <span className="course-goal__flag ba-flag" role="img" aria-label="Level reward flag">
    <span className="ba-flag__fixed" aria-hidden="true" dangerouslySetInnerHTML={{__html:staticSvg}}/>
    <canvas ref={canvas} className="ba-flag__canvas" aria-hidden="true"/>
  </span>;
}
