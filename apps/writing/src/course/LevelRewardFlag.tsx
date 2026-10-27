import {useEffect,useRef} from 'react';
import completedCloth from '../assets/review05/writing_flag_1.5.png';
import upcomingCloth from '../assets/review05/writing_flag_1.png';
import pole from '../assets/review05/writing_flag_2.cutout.png';
import './LevelRewardFlag.css';

/** Adapted from yarden's Flutter algorithm to browser Canvas.
 * https://stackoverflow.com/a/78383275 · retrieved 2026-10-26 · CC BY-SA 4.0.
 * Original source imagery retained in assets/review05, no redrawn pole or cloth.
 */
export const FLAG_DEFAULTS={period:3,waves:5,amplitude:3} as const;
export function flagPhase(elapsedSeconds:number,period:number){return 2*Math.PI*elapsedSeconds/Math.max(.1,period);}
export function flagOffsetY(x:number,width:number,waves:number,amplitude:number,phase:number){return amplitude*Math.sin((x/width)*waves*Math.PI+phase);}
export interface LevelRewardFlagProps {
  completed?:boolean; label?:string; period?:number; waves?:number; amplitude?:number;
  playing?:boolean; resetKey?:number; imageSrc?:string;
}
export function LevelRewardFlag({completed=false,label,period=FLAG_DEFAULTS.period,waves=FLAG_DEFAULTS.waves,amplitude=FLAG_DEFAULTS.amplitude,playing=true,resetKey=0,imageSrc}:LevelRewardFlagProps){
  const canvas=useRef<HTMLCanvasElement>(null),phaseRef=useRef(0);
  const wakeRef=useRef<(() => void)|null>(null);
  const playingRef=useRef(playing);
  playingRef.current=playing;
  const src=imageSrc||(completed?completedCloth:upcomingCloth);
  useEffect(()=>{phaseRef.current=0;},[resetKey]);
  useEffect(()=>{
    const element=canvas.current;if(!element)return;
    const context=element.getContext('2d');if(!context)return;
    const css=getComputedStyle(element),w=parseFloat(css.getPropertyValue('--ba-flag-cloth-width'))||200,h=parseFloat(css.getPropertyValue('--ba-flag-cloth-height'))||150;
    const pad=Math.ceil(Math.max(4,Math.abs(amplitude)))+2;
    const dpr=Math.min(Math.max(window.devicePixelRatio||1,1),2);
    element.width=Math.round(w*dpr);element.height=Math.round((h+pad*2)*dpr);
    element.style.height=`${h+pad*2}px`;element.style.marginTop=`${-pad}px`;
    context.setTransform(dpr,0,0,dpr,0,0);
    const image=new Image(),media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    element.dataset.imageState='loading';
    let disposed=false,frame=0,ready=false,previous:number|null=null,onScreen=true;
    const draw=(now:number)=>{
      frame=0;if(disposed||document.hidden||!onScreen)return;
      const reduced=media?.matches??false;
      if(previous!==null&&playingRef.current&&!reduced)phaseRef.current+=flagPhase(Math.max(0,(now-previous)/1000),period);
      previous=now;context.clearRect(0,0,w,h+pad*2);
      if(ready){
        const fit=Math.min(w/image.naturalWidth,h/image.naturalHeight),fw=image.naturalWidth*fit,fh=image.naturalHeight*fit;
        const left=(w-fw)/2,top=pad+(h-fh)/2;
        for(let i=0;i<Math.ceil(fw*dpr);i++){
          const x=i/dpr,width=Math.min(1/dpr,fw-x);if(width<=0)continue;
          const offset=reduced||!playingRef.current?0:flagOffsetY(x,fw,waves,amplitude,phaseRef.current);
          context.drawImage(image,x/fw*image.naturalWidth,0,width/fw*image.naturalWidth,image.naturalHeight,left+x,top+offset,width+.35/dpr,fh);
        }
      }
      element.dataset.phase=String(phaseRef.current);
      if(ready&&playingRef.current&&!reduced)frame=requestAnimationFrame(draw);
    };
    const wake=()=>{cancelAnimationFrame(frame);previous=null;element.dataset.visibility=document.visibilityState;element.dataset.reduced=String(media?.matches??false);frame=requestAnimationFrame(draw);};
    wakeRef.current=wake;
    image.onload=()=>{if(!disposed){ready=true;element.dataset.imageState='ready';wake();}};image.onerror=()=>{ready=false;element.dataset.imageState='error';};image.src=src;
    media?.addEventListener('change',wake);document.addEventListener('visibilitychange',wake);
    const visibility=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{onScreen=entries[0]?.isIntersecting??true;element.dataset.onScreen=String(onScreen);wake();}):null;
    visibility?.observe(element);
    return()=>{disposed=true;wakeRef.current=null;cancelAnimationFrame(frame);media?.removeEventListener('change',wake);document.removeEventListener('visibilitychange',wake);visibility?.disconnect();image.onload=null;image.onerror=null;};
  },[amplitude,waves,period,src,resetKey]);
  // Repaint the decoded image on High/Low switch; never reload the cloth asset.
  useEffect(()=>{wakeRef.current?.();},[playing]);
  return <span className="course-goal__flag ba-flag" role="img" data-component="BA-WR-011" data-playing={playing} data-state={completed?'completed':'upcoming'} aria-label={label??`Level reward · ${completed?'Completed':'Upcoming'}`}>
    <img className="ba-flag__pole" src={pole} alt="" draggable={false}/>
    <canvas ref={canvas} className="ba-flag__canvas" data-cloth={src} aria-hidden="true"/>
  </span>;
}
