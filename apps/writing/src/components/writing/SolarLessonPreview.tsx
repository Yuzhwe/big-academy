import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import './SolarLessonPreview.css';

/** Review 04 shared Current Solar GLSL aura.
 * Adapted from user-supplied elemental-solar/src/shaders/solarAura.js.
 * No license file was supplied. Do not ship until provenance is cleared.
 * The original 3D card, floor and scene are intentionally excluded.
 */
export type SolarParameters = {
  rayIntensity:number; rayLength:number; rayCount:number; bokeh:number;
  rimBoost:number; glowSpread:number; brightness:number;
  /** Color presets apply to both the card outline and shader light. */
  borderColor:string; glowColor:string;
};
export const SOLAR_DEFAULTS:SolarParameters = {
  rayIntensity:1.80, rayLength:1.26, rayCount:64, bokeh:1.12,
  rimBoost:0.74, glowSpread:10, brightness:1.34,
  borderColor:'#FFA82E',glowColor:'#FFA82E',
};
export const SOLAR_COLOR_PRESETS = {
  A:{border:'#B25415',glow:'#E89B55',label:'A · Writing 铜棕'},
  B:{border:'#874319',glow:'#D79553',label:'B · 深焦糖棕'},
  C:{border:'#C26824',glow:'#F3B46A',label:'C · 暖杏橙'},
} as const;
export type SolarRuntime = 'active'|'paused'|'fallback';
const vertex = [
  'attribute vec2 aPosition;',
  'varying vec2 vUv;',
  'void main() { vUv = (aPosition + 1.0)*0.5; gl_Position=vec4(aPosition,0.0,1.0); }',
].join('\n');
const fragment = [
  'precision highp float;',
  'varying vec2 vUv;',
  'uniform float uTime,uRayIntensity,uRayLength,uRayCount,uBokehAmt,uRimBoost,uGlowSpread,uBrightness;',
  'uniform vec2 uResolution,uCardSize;',
  'uniform float uCornerRadius;',
  'uniform vec3 uBaseColor,uGlowColor;',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float roundBox(vec2 p,vec2 halfSize,float r){vec2 q=abs(p)-halfSize+vec2(r);return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;}',
  'void main(){',
  'vec2 px=(vUv-0.5)*uResolution;',
  'float d=roundBox(px,uCardSize*0.5,max(uCornerRadius,1.0));',
  'if(d < -0.7) discard;', // no effect may cover the card content
  'float outer=smoothstep(-0.7,1.0,d);',
  'float halo=exp(-max(d,0.0)/max(uGlowSpread,1.0));',
  'float rim=exp(-pow(max(d,0.0)/3.2,1.3));',
  'float t=uTime*0.35;',
  'float ang=atan(px.y,px.x);',
  'float rad=length(px)/max(length(uCardSize*0.5),1.0);',
  'float count=clamp(uRayCount,4.0,64.0);',
  'float rays=0.0;',
  'for(int i=0;i<64;i++){',
  'float fi=float(i);if(fi>=count)break;',
  'float a0=fi*(6.283185/count)+t*(0.15+hash(vec2(fi,0.3))*0.1);',
  'float w=0.04+hash(vec2(fi,1.1))*0.05;',
  'float da=abs(atan(sin(ang-a0),cos(ang-a0)));',
  'float ray=1.0-smoothstep(0.0,w,da);',
  'float len=(0.55+hash(vec2(fi,2.2))*0.85)*max(uRayLength,0.2);',
  'ray*=1.0-smoothstep(0.12,len+0.6,rad);',
  'ray*=0.7+0.3*sin(t*4.0+fi*2.1);rays+=ray;',
  '}',
  'rays*=max(uRayIntensity,0.0);',
  'float bokeh=0.0;',
  'for(int i=0;i<16;i++){',
  'float fi=float(i);float a=hash(vec2(fi,3.3))*6.2832+t*(0.2+hash(vec2(fi,4.4))*0.3);',
  'float rr=0.25+hash(vec2(fi,5.5))*0.75;',
  'vec2 p=vec2(cos(a),sin(a))*rr;',
  'float sz=0.012+hash(vec2(fi,6.6))*0.028;',
  'float circle=1.0-smoothstep(sz*0.4,sz,length(px/max(length(uCardSize),1.0)-p));',
  'bokeh+=circle*(0.5+0.5*sin(t*3.0+fi));',
  '}',
  'bokeh*=max(uBokehAmt,0.0);',
  'float glow=(rim*0.65+halo*(0.20+0.30*rays+0.16*bokeh))*outer*max(uRimBoost,0.0)*max(uBrightness,0.0);',
  'vec3 col=mix(uBaseColor,uGlowColor,clamp(.45+rays*.42+bokeh*.08,0.0,1.0));',
  'col+=uGlowColor*clamp(rim+bokeh*0.45,0.0,1.0)*0.18;',
  'gl_FragColor=vec4(col,clamp(glow,0.0,0.94));',
  '}',
].join('\n');

function rgb(hex:string):[number,number,number]{
  const cleaned=/^#[0-9a-f]{6}$/i.test(hex)?hex:'#B25415';
  return [1,3,5].map(i=>parseInt(cleaned.slice(i,i+2),16)/255) as [number,number,number];
}

function shader(gl:WebGLRenderingContext,type:number,src:string){
  const handle=gl.createShader(type);
  if(!handle)throw Error('Shader unsupported');
  gl.shaderSource(handle,src);gl.compileShader(handle);
  if(!gl.getShaderParameter(handle,gl.COMPILE_STATUS)){
    const message=gl.getShaderInfoLog(handle);gl.deleteShader(handle);
    throw Error(message??'Shader compilation failed');
  }
  return handle;
}
function SolarBorderCanvas({params,enabled,onRuntime,fit}:{
  params:SolarParameters; enabled:boolean; onRuntime:(state:SolarRuntime)=>void; fit:'card'|'control';
}){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const options=useRef(params);
  const callback=useRef(onRuntime);
  options.current=params;callback.current=onRuntime;
  useEffect(()=>{
    // Do not overwrite a WebGL failure with "paused": that would reenable
    // the failing context and cause an infinite fallback/retry render loop.
    if(!enabled)return;
    const canvas=canvasRef.current;if(!canvas)return;
    let gl:WebGLRenderingContext|null=null;
    let program:WebGLProgram|null=null,vs:WebGLShader|null=null,fs:WebGLShader|null=null,buffer:WebGLBuffer|null=null;
    let handle=0,last=0,start=0,slow=0,disposed=false,inView=true;
    let resizeObserver:ResizeObserver|undefined,visibilityObserver:IntersectionObserver|undefined;
    try{
      gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'low-power'});
      if(!gl)throw Error('WebGL unavailable');
      vs=shader(gl,gl.VERTEX_SHADER,vertex);fs=shader(gl,gl.FRAGMENT_SHADER,fragment);
      program=gl.createProgram();if(!program)throw Error('Program unavailable');
      gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)??'Shader link failed');
      buffer=gl.createBuffer();if(!buffer)throw Error('Buffer unavailable');
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      gl.useProgram(program);
      const pos=gl.getAttribLocation(program,'aPosition');
      gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(pos);
    }catch(error){
      callback.current('fallback');
      if(import.meta.env.DEV)console.warn('[Solar Border] using static fallback',error);
      return;
    }
    const gpu=gl as WebGLRenderingContext,linked=program as WebGLProgram;
    const u=(name:string)=>gpu.getUniformLocation(linked,name);
    const uniforms={
      time:u('uTime'),resolution:u('uResolution'),cardSize:u('uCardSize'),cornerRadius:u('uCornerRadius'),
      rayIntensity:u('uRayIntensity'),rayLength:u('uRayLength'),rayCount:u('uRayCount'),
      bokeh:u('uBokehAmt'),rimBoost:u('uRimBoost'),glowSpread:u('uGlowSpread'),brightness:u('uBrightness'),
      baseColor:u('uBaseColor'),glowColor:u('uGlowColor'),
    };
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      // Performance guard: keep a tiny single-card canvas at device pixel ratio 1.
      const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      gpu.viewport(0,0,w,h);
    };
    resize();
    if(typeof ResizeObserver!=='undefined'){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);}
    const lost=(event:Event)=>{event.preventDefault();disposed=true;cancelAnimationFrame(handle);callback.current('fallback');};
    canvas.addEventListener('webglcontextlost',lost);
    const visibility=()=>{inView=!document.hidden;};
    document.addEventListener('visibilitychange',visibility);
    if(typeof IntersectionObserver!=='undefined'){
      visibilityObserver=new IntersectionObserver(entries=>{inView=!document.hidden&&!!entries[0]?.isIntersecting;});
      visibilityObserver.observe(canvas);
    }
    callback.current('active');
    const draw=(now:number)=>{
      if(disposed)return;
      handle=requestAnimationFrame(draw);
      if(!inView||now-last<33)return; // maximum 30 fps
      const dt=last?now-last:33;last=now;start||=now;
      if(dt>85){slow++;if(slow>25){disposed=true;callback.current('fallback');return;}}
      const p=options.current;
      gpu.clearColor(0,0,0,0);gpu.clear(gpu.COLOR_BUFFER_BIT);gpu.useProgram(linked);
      gpu.uniform1f(uniforms.time,(now-start)/1000);
      gpu.uniform2f(uniforms.resolution,canvas.width,canvas.height);
      const root=canvas.parentElement;
      // Control fit: BAButton's outer hit target has transparent inline padding.
      // The light must hug the *visible* capsule shell, including its press/hover
      // scale, rather than outlining that larger invisible hit target.
      // The Current lesson card path remains untouched.
      const target=fit==='control'
        ? root?.querySelector<HTMLElement>('[data-solar-target] .ba-button__assembly')
        : root?.querySelector<HTMLElement>('[data-solar-target]')
          ?? root?.querySelector<HTMLElement>('.stair-lesson-card');
      const box=fit==='control'?target?.getBoundingClientRect():null;
      const tw=fit==='control' ? (box?.width || target?.offsetWidth || 260) : (target?.offsetWidth ?? 260);
      const th=fit==='control' ? (box?.height || target?.offsetHeight || 310) : (target?.offsetHeight ?? 310);
      gpu.uniform2f(uniforms.cardSize,tw,th);
      // Card keeps the locked 55px aura radius; control fit uses a full-pill radius.
      gpu.uniform1f(uniforms.cornerRadius, fit==='control' ? Math.max(1, Math.min(tw, th) * 0.5) : 55);
      gpu.uniform1f(uniforms.rayIntensity,p.rayIntensity);
      gpu.uniform1f(uniforms.rayLength,p.rayLength);
      gpu.uniform1f(uniforms.rayCount,p.rayCount);
      gpu.uniform1f(uniforms.bokeh,p.bokeh);
      gpu.uniform1f(uniforms.rimBoost,p.rimBoost);
      gpu.uniform1f(uniforms.glowSpread,p.glowSpread);
      gpu.uniform1f(uniforms.brightness,p.brightness);
      gpu.uniform3fv(uniforms.baseColor,new Float32Array(rgb(p.borderColor)));
      gpu.uniform3fv(uniforms.glowColor,new Float32Array(rgb(p.glowColor)));
      gpu.drawArrays(gpu.TRIANGLE_STRIP,0,4);
    };
    handle=requestAnimationFrame(draw);
    return()=>{
      disposed=true;cancelAnimationFrame(handle);
      resizeObserver?.disconnect();visibilityObserver?.disconnect();
      document.removeEventListener('visibilitychange',visibility);
      canvas.removeEventListener('webglcontextlost',lost);
      if(buffer)gpu.deleteBuffer(buffer);
      gpu.deleteProgram(linked);if(vs)gpu.deleteShader(vs);if(fs)gpu.deleteShader(fs);
    };
  },[enabled,fit]);
  return <canvas className="solar-border-canvas" ref={canvasRef} aria-hidden="true"/>;
}

export function SolarLessonPreview({children,params=SOLAR_DEFAULTS,motionEnabled=true,fit='card',forceFallback=false}:{
  children:ReactNode;params?:SolarParameters;motionEnabled?:boolean;
  /** card = lesson Current glow (default). control = path-controls pill / button wrap. */
  fit?:'card'|'control';
  /** Specimen/demo: force stroke-border fallback without touching WebGL eligibility. */
  forceFallback?:boolean;
}){
  const [runtime,setRuntime]=useState<SolarRuntime>('paused');
  const [systemReduced,setSystemReduced]=useState(()=>typeof window!=='undefined'&&
    typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if(!media)return;
    const update=()=>setSystemReduced(media.matches);
    media.addEventListener('change',update);
    return()=>media.removeEventListener('change',update);
  },[]);
  const enabled=motionEnabled&&!forceFallback&&!systemReduced&&runtime!=='fallback';
  const shineOn=enabled&&fit==='card';
  return <div className="solar-lesson-preview" data-current="true" data-solar-fit={fit}
    style={{'--ba-solar-border-color':params.borderColor} as CSSProperties}
    data-solar-status={runtime==='active'&&enabled?'active':'fallback'}
    data-shine={shineOn?'on':'off'}>
      {children}
      <SolarBorderCanvas params={params} enabled={enabled} onRuntime={setRuntime} fit={fit}/>
    </div>;
}
