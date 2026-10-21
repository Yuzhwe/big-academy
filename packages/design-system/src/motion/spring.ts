/** Big Academy token-driven spring runtime.
 * No duplicate physics constants. Missing masses use the solver's ordinary unit mass,
 * which is not an asserted source token or a new design value.
 */
export type BASpringPreset = 'bouncy' | 'snappy' | 'gentle' | 'heavy-snap' | 'bubble-enter' | 'modal-enter';
export interface SpringPhysics {stiffness:number;damping:number;mass?:number;}
export function readSpringPreset(preset:BASpringPreset, root:Element=document.documentElement):SpringPhysics {
  const style=getComputedStyle(root);
  const number=(suffix:string)=>{
    const text=style.getPropertyValue('--ba-motion-spring-'+preset+'-'+suffix).trim();
    return text && Number.isFinite(Number(text)) ? Number(text) : undefined;
  };
  const stiffness=number('stiffness'), damping=number('damping'), mass=number('mass');
  if(stiffness===undefined||damping===undefined)throw new Error('Missing authored spring token: '+preset);
  return {stiffness,damping,...(mass===undefined?{}:{mass})};
}
export interface SpringOptions {
  preset:BASpringPreset;
  from:number;
  to:number;
  update:(value:number)=>void;
  root?:Element;
  reducedMotion?:boolean;
}
/** Interruptible requestAnimationFrame spring; returns a cleanup function. */
export function animateSpring({preset,from,to,update,root,reducedMotion}:SpringOptions):()=>void {
  const reduce=reducedMotion ?? (typeof matchMedia==='function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if(reduce || typeof requestAnimationFrame==='undefined'){update(to);return ()=>{};}
  const {stiffness,damping,mass}=readSpringPreset(preset,root);
  const inertia=mass??1;
  let x=from,v=0,frame=0,last=0,closed=false;
  const step=(now:number)=>{
    if(closed)return;
    const dt=Math.min(.032,last?(now-last)/1000:1/60);
    last=now;
    v+=(-stiffness*(x-to)-damping*v)/inertia*dt;
    x+=v*dt;
    if(Math.abs(x-to)<.002 && Math.abs(v)<.02){update(to);closed=true;return;}
    update(x);
    frame=requestAnimationFrame(step);
  };
  update(from);
  frame=requestAnimationFrame(step);
  return ()=>{closed=true;cancelAnimationFrame(frame);};
}
