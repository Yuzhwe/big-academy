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
export function flagPhase(elapsedSeconds:number,period:number){
  return 2*Math.PI*elapsedSeconds/Math.max(.1,period);
}
export function flagOffsetY(x:number,width:number,waves:number,amplitude:number,phase:number){
  return amplitude*Math.sin((x/width)*waves*Math.PI+phase);
}
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
  /* Explicit intrinsic SVG pixel size prevents browser 300×150 fallback from
   * stretching the original 200×160 art when Canvas samples columns. */
  fabric.setAttribute('width','200');fabric.setAttribute('height','160');
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
    const w=200,h=160,pad=20;
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
        /* Contain the supplied image without changing its aspect ratio.
         * Sample one device pixel worth of its source width per column. */
        const scale=Math.min(w/image.naturalWidth,h/image.naturalHeight);
        const fitW=image.naturalWidth*scale,fitH=image.naturalHeight*scale;
        const left=(w-fitW)/2,top=pad+(h-fitH)/2;
        const count=Math.ceil(fitW*deviceScale);
        for(let i=0;i<count;i++){
          const x=i/deviceScale;
          const width=Math.min(one,fitW-x);
          if(width<=0)continue;
          const offset=flagOffsetY(x,fitW,waves,amplitude,reduced?0:phaseRef.current);
          const sourceX=(x/fitW)*image.naturalWidth;
          const sourceWidth=(width/fitW)*image.naturalWidth;
          context.drawImage(image,sourceX,0,sourceWidth,image.naturalHeight,
            left+x,top+offset,width+.35/deviceScale,fitH);
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
    <span className="ba-flag__fixed" aria-hidden="true" style={{display:imageSrc?'none':undefined}} dangerouslySetInnerHTML={{__html:staticSvg}}/>
    <canvas ref={canvas} className="ba-flag__canvas" aria-hidden="true"/>
  </span>;
}
