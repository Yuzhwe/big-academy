import { useEffect, useRef, useState, type ReactNode } from 'react';
import './SolarLessonPreview.css';

/** Preview-only extracted Solar GLSL aura.
 * Adapted from user-supplied elemental-solar/src/shaders/solarAura.js.
 * No license file was supplied. Do not ship until provenance is cleared.
 * The original 3D card, floor and scene are intentionally excluded.
 */
export type SolarParameters = {
  rayIntensity:number; rayLength:number; rayCount:number; bokeh:number;
  rimBoost:number; glowSpread:number; brightness:number;
};
export const SOLAR_DEFAULTS:SolarParameters = {
  rayIntensity:0.6, rayLength:0.45, rayCount:64, bokeh:0.16,
  rimBoost:1.66, glowSpread:18, brightness:1,
};
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
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float roundBox(vec2 p,vec2 halfSize,float r){vec2 q=abs(p)-halfSize+vec2(r);return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;}',
  'void main(){',
  'vec2 px=(vUv-0.5)*uResolution;',
  'float d=roundBox(px,uCardSize*0.5,55.0);',
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
  'vec3 gold=vec3(1.0,0.78,0.35),peach=vec3(1.0,0.55,0.28),hot=vec3(1.0,0.95,0.75);',
  'vec3 col=mix(peach,gold,clamp(rays,0.0,1.0))*0.73+hot*clamp(rim+bokeh*0.45,0.0,1.0)*0.30;',
  'gl_FragColor=vec4(col,clamp(glow,0.0,0.94));',
  '}',
].join('\n');

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
function SolarBorderCanvas({params,enabled,onRuntime}:{
  params:SolarParameters; enabled:boolean; onRuntime:(state:SolarRuntime)=>void;
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
      time:u('uTime'),resolution:u('uResolution'),cardSize:u('uCardSize'),
      rayIntensity:u('uRayIntensity'),rayLength:u('uRayLength'),rayCount:u('uRayCount'),
      bokeh:u('uBokehAmt'),rimBoost:u('uRimBoost'),glowSpread:u('uGlowSpread'),brightness:u('uBrightness'),
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
      const card=canvas.parentElement?.querySelector<HTMLElement>('.stair-lesson-card');
      gpu.uniform2f(uniforms.cardSize,card?.offsetWidth??260,card?.offsetHeight??310);
      gpu.uniform1f(uniforms.rayIntensity,p.rayIntensity);
      gpu.uniform1f(uniforms.rayLength,p.rayLength);
      gpu.uniform1f(uniforms.rayCount,p.rayCount);
      gpu.uniform1f(uniforms.bokeh,p.bokeh);
      gpu.uniform1f(uniforms.rimBoost,p.rimBoost);
      gpu.uniform1f(uniforms.glowSpread,p.glowSpread);
      gpu.uniform1f(uniforms.brightness,p.brightness);
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
  },[enabled]);
  return <canvas className="solar-border-canvas" ref={canvasRef} aria-hidden="true"/>;
}

export function SolarLessonPreview({children,params=SOLAR_DEFAULTS,motionEnabled=true}:{
  children:ReactNode;params?:SolarParameters;motionEnabled?:boolean;
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
  const enabled=motionEnabled&&!systemReduced&&runtime!=='fallback';
  return <div className="solar-lesson-preview" data-current="true"
    data-solar-status={runtime==='active'&&enabled?'active':'fallback'}
    data-shine={enabled?'on':'off'}>
      {children}
      <SolarBorderCanvas params={params} enabled={enabled} onRuntime={setRuntime}/>
    </div>;
}
