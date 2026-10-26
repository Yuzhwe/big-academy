import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FRAG, M4_CLEAR, STAIRCASE_SKY, VERT } from './cloudShaderM4';
import './CloudShaderSky.css';

export type CloudRenderMode = 'auto' | 'shader' | 'lightweight';
export type CloudRenderer = 'shader' | 'lightweight';
export type CloudPreset = 'clear' | 'staircase';
export type CloudShaderSkyProps = {
  mode?: CloudRenderMode;
  preset?: CloudPreset;
  skyTop?: string;
  skyBottom?: string;
  cloudColor?: string;
  cloudCount?: number;
  driftSpeed?: number;
  parallaxStrength?: number;
  cameraX?: number;
  cameraY?: number;
  cameraMaxTravel?: number;
  paused?: boolean;
  reducedMotion?: boolean;
  onRendererChange?: (renderer: CloudRenderer, reason?: string) => void;
  className?: string;
};

type Params = Required<Pick<CloudShaderSkyProps, 'skyTop' | 'skyBottom' | 'cloudColor' | 'cloudCount' | 'driftSpeed' | 'paused' | 'reducedMotion'>>;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
/** Scroll displacement is absolute, not incremental: never double-apply movement. */
export function cloudParallax(cameraX: number, strength: number, travel: number) {
  return clamp(cameraX, 0, Math.max(0, travel)) * clamp(strength, 0, 0.5);
}
export function autoAllowsShader(capabilities: { webgl: boolean; cores?: number; memory?: number; reducedMotion: boolean }) {
  return capabilities.webgl && !capabilities.reducedMotion &&
    !(capabilities.cores !== undefined && capabilities.cores <= 4) &&
    !(capabilities.memory !== undefined && capabilities.memory <= 4);
}
function color3(color: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  const hex = match?.[1] ?? 'ffffff';
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
}
function makeShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw Error('Cannot create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown GLSL error';
    gl.deleteShader(shader);
    throw Error(message);
  }
  return shader;
}

function M4Canvas({ params, onFirstFrame, onFailure, paused }: {
  params: Params; paused: boolean; onFirstFrame: () => void; onFailure: (reason: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paramsRef = useRef(params);
  const pausedRef = useRef(paused);
  const rerenderRef = useRef<() => void>(() => {});
  const firstFrameRef = useRef(onFirstFrame);
  const failRef = useRef(onFailure);
  paramsRef.current = params;
  pausedRef.current = paused;
  firstFrameRef.current = onFirstFrame;
  failRef.current = onFailure;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let gl: WebGLRenderingContext | null = null;
    let vs: WebGLShader | null = null, fs: WebGLShader | null = null;
    let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null;
    let raf = 0, last = 0, lastPaint = 0, elapsed = 0, paints = 0, slowFrames = 0;
    let onScreen = true, lost = false, done = false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const fail = (reason: string) => { if (!done) { done = true; cancelAnimationFrame(raf); failRef.current(reason); } };
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
      if (!gl) throw Error('WebGL unavailable');
      vs = makeShader(gl, gl.VERTEX_SHADER, VERT);
      fs = makeShader(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram();
      if (!program) throw Error('Cannot create program');
      gl.attachShader(program, vs); gl.attachShader(program, fs);
      gl.bindAttribLocation(program, 0, 'a_pos');
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program) ?? 'Link failed');
      gl.useProgram(program);
      buffer = gl.createBuffer();
      if (!buffer) throw Error('Cannot create buffer');
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    } catch (error) { fail(String(error)); }
    if (!gl || !program || done) return () => {
      if (gl) { if (vs) gl.deleteShader(vs); if (fs) gl.deleteShader(fs); if (program) gl.deleteProgram(program); if (buffer) gl.deleteBuffer(buffer); }
    };

    const context = gl;
    const loc = Object.fromEntries(['res', 'time', 'count', 'cloud', 'skyTop', 'skyBottom']
      .map(k => [k, context.getUniformLocation(program!, 'u_' + k)]));
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w < 1 || h < 1) return false;
      const ratio = Math.max(0.3, Math.min(window.devicePixelRatio || 1, 1.25, Math.sqrt(580000 / (w * h))));
      const pw = Math.max(1, Math.floor(w * ratio)), ph = Math.max(1, Math.floor(h * ratio));
      if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
      context.viewport(0, 0, pw, ph);
      context.uniform2f(loc.res, pw, ph);
      return true;
    };
    const isStill = () => pausedRef.current || paramsRef.current.reducedMotion || !!reduced?.matches || paramsRef.current.driftSpeed === 0;
    const draw = (now: number) => {
      raf = 0;
      if (done || lost || document.hidden || !onScreen) return;
      const still = isStill();
      if (last && !still) elapsed += Math.min((now - last) / 1000, .12) * paramsRef.current.driftSpeed;
      last = now;
      if (!still && lastPaint && now - lastPaint < 1000 / 22) { raf = requestAnimationFrame(draw); return; }
      if (!resize()) return;
      if (!still && paints > 20 && lastPaint) {
        slowFrames = now - lastPaint > 115 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
        if (slowFrames >= 22) { fail('Sustained slow frames'); return; }
      }
      lastPaint = now;
      const p = paramsRef.current;
      context.useProgram(program);
      context.uniform1f(loc.time, elapsed);
      context.uniform1f(loc.count, clamp(p.cloudCount, 1, 6));
      context.uniform3fv(loc.cloud, color3(p.cloudColor));
      context.uniform3fv(loc.skyTop, color3(p.skyTop));
      context.uniform3fv(loc.skyBottom, color3(p.skyBottom));
      context.drawArrays(context.TRIANGLES, 0, 3);
      paints++;
      if (paints % 20 === 0 && context.getError() !== context.NO_ERROR) { fail('WebGL drawing error'); return; }
      if (paints === 1) firstFrameRef.current();
      if (!still) raf = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      raf = 0; last = 0; lastPaint = 0; slowFrames = 0;
      if (!done && !lost && !document.hidden && onScreen) raf = requestAnimationFrame(draw);
    };
    rerenderRef.current = restart;
    const onLost = (e: Event) => { e.preventDefault(); lost = true; fail('WebGL context lost'); };
    canvas.addEventListener('webglcontextlost', onLost);
    document.addEventListener('visibilitychange', restart);
    reduced?.addEventListener?.('change', restart);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(restart) : null;
    if (resizeObserver) resizeObserver.observe(canvas);
    else window.addEventListener('resize', restart);
    const visibility = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(entries => { onScreen = entries[0]?.isIntersecting ?? true; restart(); })
      : null;
    visibility?.observe(canvas);
    restart();
    return () => {
      done = true; cancelAnimationFrame(raf); rerenderRef.current = () => {};
      canvas.removeEventListener('webglcontextlost', onLost);
      document.removeEventListener('visibilitychange', restart);
      reduced?.removeEventListener?.('change', restart);
      resizeObserver?.disconnect(); visibility?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', restart);
      context.deleteBuffer(buffer); context.deleteProgram(program); if (vs) context.deleteShader(vs); if (fs) context.deleteShader(fs);
    };
  }, []);
  useEffect(() => { rerenderRef.current(); }, [params.skyTop, params.skyBottom, params.cloudColor, params.cloudCount, params.driftSpeed, params.paused, params.reducedMotion, paused]);
  return <canvas ref={canvasRef} className="m4-cloud-canvas" data-testid="m4-cloud-canvas" aria-hidden="true"/>;
}

export function CloudShaderSky({
  mode = 'auto', preset = 'staircase', cameraX = 0, cameraMaxTravel = 0, cameraY: _cameraY,
  parallaxStrength = 0.06, paused = false, reducedMotion = false, onRendererChange,
  className = '', ...overrides
}: CloudShaderSkyProps) {
  const defaults = preset === 'clear' ? M4_CLEAR : STAIRCASE_SKY;
  const params: Params = {
    skyTop: overrides.skyTop ?? defaults.skyTop, skyBottom: overrides.skyBottom ?? defaults.skyBottom,
    cloudColor: overrides.cloudColor ?? defaults.cloudColor,
    cloudCount: overrides.cloudCount ?? defaults.cloudCount,
    driftSpeed: overrides.driftSpeed ?? defaults.driftSpeed, paused, reducedMotion,
  };
  const [eligible, setEligible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reason, setReason] = useState('');
  const callbackRef = useRef(onRendererChange);
  callbackRef.current = onRendererChange;
  useEffect(() => {
    setReady(false); setFailed(false); setReason('');
    const memory = (navigator as Navigator & {deviceMemory?: number}).deviceMemory;
    setEligible(mode === 'shader' || (mode === 'auto' &&
      autoAllowsShader({ webgl: typeof window.WebGLRenderingContext !== 'undefined', cores: navigator.hardwareConcurrency, memory, reducedMotion: reducedMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false })));
  }, [mode, reducedMotion]);
  const wantsShader = mode !== 'lightweight' && eligible && !failed;
  const renderer: CloudRenderer = wantsShader && ready ? 'shader' : 'lightweight';
  const shift = cloudParallax(cameraX, parallaxStrength, cameraMaxTravel);
  const overscan = Math.ceil(cloudParallax(cameraMaxTravel, parallaxStrength, cameraMaxTravel)) + 2;
  useEffect(() => { callbackRef.current?.(renderer, reason || undefined); }, [renderer, reason]);
  const style = { '--m4-shift': `${shift}px`, '--m4-overscan': `${overscan}px`, '--m4-negative-shift': `${-shift}px`, '--m4-negative-overscan': `${-overscan}px`, '--m4-extra-width': `${2*overscan}px` } as CSSProperties;
  return <div className={`cloud-shader-sky ${className}`} data-testid="path-cloud" data-parallax={parallaxStrength} data-mode={mode}
    data-renderer={renderer} data-fallback-reason={reason || undefined} data-preset={preset}
    data-reduced={reducedMotion ? 'true' : 'false'} style={style} aria-hidden="true">
    {!ready || !wantsShader ? <div className="path-layer path-cloud m4-lightweight-cloud" data-testid="path-lightweight-cloud">
      <span className="r2-cloud r2-cloud--a"/><span className="r2-cloud r2-cloud--b"/><span className="r2-cloud r2-cloud--c"/>
    </div> : null}
    {wantsShader && <M4Canvas params={params} paused={paused} onFirstFrame={() => setReady(true)}
      onFailure={message => { setReason(message); setFailed(true); setReady(false); }}/>}
  </div>;
}
