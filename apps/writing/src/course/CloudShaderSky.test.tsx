import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { CloudShaderSky, autoAllowsShader, cloudParallax } from './CloudShaderSky';
import { M4_CLEAR, STAIRCASE_SKY, FRAG, M4_CLOUD_ONLY_FRAG } from './cloudShaderM4';
import { defaultScene, readScene, sceneSearch } from '../../../library/src/catalog';

describe('BA-WR-013 · M4 adaptive sky', () => {
  it('retains the original M4 Clear parameters and original GLSL noise pipeline', () => {
    expect(M4_CLEAR).toEqual({ skyTop:'#3876BA',skyBottom:'#8CBFE8',cloudColor:'#FBF8F2',cloudCount:5,driftSpeed:.8 });
    expect(STAIRCASE_SKY.skyTop).toBe('#85DBF9');
    expect(STAIRCASE_SKY.skyBottom).toBe('#F8F4ED');
    expect(FRAG).toContain('cloudDensity');
    expect(FRAG).toContain('shadeCloud');
    expect(FRAG).toContain('gl_FragColor = vec4(color, 1.0)');
  });
  it('keeps original M4 full sky intact but composites only alpha-tracked clouds over current CSS sky', () => {
    expect(FRAG).toContain('gl_FragColor = vec4(color, 1.0);');
    expect(FRAG).not.toContain('inout float opacity');
    expect(M4_CLOUD_ONLY_FRAG).toContain('inout float opacity');
    expect(M4_CLOUD_ONLY_FRAG).toContain('vec3 baseSky = color;');
    expect(M4_CLOUD_ONLY_FRAG).toContain('gl_FragColor = vec4(clamp(cloudRGB');
    expect(M4_CLOUD_ONLY_FRAG.match(/cloudPass\(/g)?.length).toBe(7); // definition + six identical calls
    expect(M4_CLOUD_ONLY_FRAG).toContain('float d = cloudDensity(p, c, r, seed, t);');
  });
  it('lets the workbench simulate WebGL unavailable even when the host supports it', async () => {
    const { getByTestId, container, unmount } = render(<CloudShaderSky mode="shader" simulateWebGLUnavailable />);
    await waitFor(() => expect(getByTestId('path-cloud').getAttribute('data-fallback-reason')).toContain('simulated'));
    expect(container.querySelectorAll('.r2-cloud')).toHaveLength(3);
    expect(container.querySelectorAll('canvas')).toHaveLength(0);
    unmount();
  });
  it('uses one absolute camera signal; camera changes never affect drift clock', () => {
    expect(cloudParallax(0,.06,1200)).toBe(0);
    expect(cloudParallax(500,.06,1200)).toBe(30);
    expect(cloudParallax(500,.06,1200)).toBe(30);
    expect(cloudParallax(1200,.06,1200)).toBe(72);
    expect(cloudParallax(1500,.06,1200)).toBe(72);
    expect(cloudParallax(-50,.06,1200)).toBe(0);
    expect(cloudParallax(500,10,1200)).toBe(250);
  });
  it('rejects low-end/reduced-motion auto Shader, not just the absence of WebGL', () => {
    expect(autoAllowsShader({webgl:false,cores:8,reducedMotion:false})).toBe(false);
    expect(autoAllowsShader({webgl:true,cores:2,reducedMotion:false})).toBe(false);
    expect(autoAllowsShader({webgl:true,cores:4,memory:4,reducedMotion:false})).toBe(true);
    expect(autoAllowsShader({webgl:true,cores:8,memory:2,reducedMotion:false})).toBe(false);
    expect(autoAllowsShader({webgl:true,cores:8,memory:8,reducedMotion:true})).toBe(false);
    expect(autoAllowsShader({webgl:true,cores:8,memory:8,reducedMotion:false})).toBe(true);
  });
  it('reuses the original three lightweight puffs without creating WebGL in forced lightweight mode', () => {
    const {getByTestId,container,unmount}=render(<CloudShaderSky mode="lightweight" cameraX={200}
      cameraMaxTravel={1200} parallaxStrength={.06}/>);
    expect(getByTestId('path-cloud').getAttribute('data-renderer')).toBe('lightweight');
    expect(getByTestId('path-cloud').style.getPropertyValue('--m4-negative-shift')).toBe('-12px');
    expect(container.querySelectorAll('.r2-cloud')).toHaveLength(3);
    expect(container.querySelectorAll('canvas')).toHaveLength(0);
    unmount();
    expect(container.querySelectorAll('.r2-cloud')).toHaveLength(0);
  });
  it('fails safe to original lightweight clouds if forced Shader context cannot initialize', async () => {
    const spy=vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation(()=>null);
    try {
      const {getByTestId,container,unmount}=render(<CloudShaderSky mode="shader" />);
      await waitFor(() => expect(getByTestId('path-cloud').getAttribute('data-fallback-reason')).toContain('WebGL unavailable'));
      expect(getByTestId('path-cloud').getAttribute('data-renderer')).toBe('lightweight');
      expect(container.querySelectorAll('.r2-cloud')).toHaveLength(3);
      unmount();
    } finally {spy.mockRestore();}
  });
  it('persists all designer parameters in a shareable URL', () => {
    const value=readScene(sceneSearch({...defaultScene,component:'cloud',cloudPreset:'clear',
      cloudRenderMode:'shader',skyTop:'#3876BA',skyBottom:'#8CBFE8',cloudColor:'#FBF8F2',
      cloudCount:5,driftSpeed:.8,parallaxStrength:.14,cloudCameraX:640,cloudPaused:true}));
    expect(value.cloudPreset).toBe('clear');
    expect(value.cloudRenderMode).toBe('shader');
    expect(value.cloudCameraX).toBe(640);
    expect(value.cloudPaused).toBe(true);
    expect(value.parallaxStrength).toBe(.14);
  });
});
