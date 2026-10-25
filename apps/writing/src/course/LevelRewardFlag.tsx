import { useEffect, useId, useRef } from 'react';
import artwork from '../assets/r2.12/level-flag.svg?raw';

/** Internal decorative composite; geometry and 4% wind from supplied R2.12. */
export function LevelRewardFlag() {
  const ref=useRef<HTMLSpanElement>(null);
  const id=useId().replace(/[^a-zA-Z0-9]/g,'');
  useEffect(()=>{
    const root=ref.current;
    const cloth=root?.querySelector('.flag-cloth'), shine=root?.querySelector('.flag-highlight');
    if(!root || !cloth || !shine || typeof window.matchMedia !== 'function')return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const wind=Number.parseFloat(getComputedStyle(root).getPropertyValue('--ba-path-flag-wind')) || 0;
    let frame=0;
    const animate=(now:number)=>{
      const t=now/1000;
      const sway=wind*137*Math.sin(t*1.18), crest=wind*137*.65*Math.sin(t*1.18+1.2);
      cloth.setAttribute('d',`M40 29 Q76 ${18+crest} 107 ${28-sway*.28} Q140 ${36+crest} ${177+sway} ${24+sway*.26} L${177+sway} ${112+sway*.5} Q141 ${127+crest} 107 ${115-sway*.4} Q70 ${101+crest} 40 111 Z`);
      shine.setAttribute('d',`M55 41 Q110 ${30+crest} ${159+sway*.7} ${41+sway*.16}`);
      frame=requestAnimationFrame(animate);
    };
    const sync=()=>{cancelAnimationFrame(frame);if(!reduced.matches)frame=requestAnimationFrame(animate);else {const svg=new DOMParser().parseFromString(artwork,'image/svg+xml');cloth.setAttribute('d',svg.querySelector('.flag-cloth')!.getAttribute('d')!);shine.setAttribute('d',svg.querySelector('.flag-highlight')!.getAttribute('d')!);}};
    sync();reduced.addEventListener('change',sync);
    return()=>{cancelAnimationFrame(frame);reduced.removeEventListener('change',sync);};
  },[]);
  return <span ref={ref} className="course-goal__flag" aria-hidden="true" dangerouslySetInnerHTML={{__html:artwork.replaceAll('fabric-level',`fabric-${id}`).replaceAll('flag-pole-level',`flag-pole-${id}`)}}/>;
}
