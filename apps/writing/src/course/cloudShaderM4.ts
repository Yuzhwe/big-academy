/**
 * Big Academy M4 Cloud Shader — unchanged vertex and fragment GLSL extracted
 * from user-supplied cloud-shader-demo.html (2026-10-26).
 * Geometry/noise/self-shading/source order retained for visual comparison.
 * Original demo credits Aceternity UI Cloud Shader:
 * https://ui.aceternity.com/registry/cloud-shader.json
 * Upstream licensing must be verified before external redistribution.
 */
export const M4_CLEAR = Object.freeze({
  skyTop: '#3876BA', skyBottom: '#8CBFE8', cloudColor: '#FBF8F2',
  cloudCount: 5, driftSpeed: 0.8,
});
/** Visual candidate only; original Shader core stays unchanged. */
export const STAIRCASE_SKY = Object.freeze({
  ...M4_CLEAR, skyTop: '#85DBF9', skyBottom: '#F8F4ED',
});
export const VERT = `
        attribute vec2 a_pos;
        varying vec2 v_uv;
        void main() {
          v_uv = a_pos * 0.5 + 0.5;
          gl_Position = vec4(a_pos, 0.0, 1.0);
        }
      `;
export const FRAG = `
        precision highp float;
        varying vec2 v_uv;
        uniform vec2 u_res;
        uniform float u_time;
        uniform float u_count;
        uniform vec3 u_cloud;
        uniform vec3 u_skyTop;
        uniform vec3 u_skyBottom;
        const mat2 R = mat2(0.80, 0.60, -0.60, 0.80);

        float hash(vec2 p) { return fract(sin(dot(p, vec2(41.31, 289.17))) * 26737.367); }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        float fbm(vec2 p) {
          float sum = 0.0, amp = 0.5;
          for (int i = 0; i < 4; i++) { sum += amp * vnoise(p); p = R * p * 2.03 + 19.19; amp *= 0.5; }
          return sum;
        }
        float billow(vec2 p) {
          float sum = 0.0, amp = 0.5;
          for (int i = 0; i < 5; i++) {
            sum += amp * (1.0 - abs(2.0 * vnoise(p) - 1.0));
            p = R * p * 2.11 + 13.37; amp *= 0.5;
          }
          return sum;
        }
        float cloudDensity(vec2 p, vec2 c, vec2 r, float seed, float t) {
          vec2 q = p - c;
          float ry = q.y > 0.0 ? r.y : r.y * 0.42;
          float env = 1.0 - length(vec2(q.x / r.x, q.y / ry));
          if (env < -0.35) return 0.0;
          vec2 dp = q * (2.4 / r.x) + seed;
          dp += 0.6 * vec2(fbm(dp * 1.4 + t * 0.04), fbm(dp * 1.4 + 7.7 - t * 0.03));
          float detail = billow(dp * 1.6);
          return env + (detail - 0.62) * 0.62;
        }
        vec3 shadeCloud(vec3 color, vec3 sky, vec2 p, vec2 c, vec2 r, float seed, float t, float dist) {
          float d = cloudDensity(p, c, r, seed, t);
          if (d < 0.02) return color;
          float dUp = cloudDensity(p + vec2(0.0, r.y * 0.55), c, r, seed, t);
          float occl = clamp((dUp - d) * 1.1 + d * 0.55, 0.0, 1.0);
          vec3 lit = u_cloud * 1.04;
          vec3 shadow = mix(u_cloud * 0.60, sky, 0.38);
          vec3 cloudCol = mix(lit, shadow, occl * 0.85);
          float alpha = smoothstep(0.02, 0.38, d);
          float rim = smoothstep(0.02, 0.14, d) * (1.0 - smoothstep(0.14, 0.40, d));
          cloudCol += rim * 0.10;
          cloudCol = mix(cloudCol, sky, dist * 0.35);
          alpha *= mix(1.0, 0.8, dist);
          return mix(color, cloudCol, alpha);
        }
        vec3 cloudPass(vec3 color, vec3 sky, vec2 p, float aspect, float t,
                       float spd, float phase, float y, vec2 r, float seed, float dist) {
          float cx = mix(-r.x - 0.25, aspect + r.x + 0.25, fract(t * spd + phase));
          float cy = y + sin(t * 0.05 + phase * 6.2831) * 0.012;
          return shadeCloud(color, sky, p, vec2(cx, cy), r, seed, t, dist);
        }
        void main() {
          float aspect = u_res.x / u_res.y;
          vec2 p = vec2(v_uv.x * aspect, v_uv.y);
          float t = u_time;
          vec3 sky = mix(u_skyBottom, u_skyTop, v_uv.y);
          vec3 color = sky;
          // Equivalent haze with strictly increasing smoothstep edges.
          color = mix(color, u_skyBottom * 1.06, (1.0 - smoothstep(0.0, 0.35, v_uv.y)) * 0.5);
          vec2 sunPos = vec2(aspect * 0.78, 0.92);
          float sunDist = length(p - sunPos);
          color += vec3(1.0, 0.95, 0.82) * exp(-sunDist * sunDist * 5.0) * 0.28;
          float cirrusBand = smoothstep(0.55, 0.8, v_uv.y) * (1.0 - smoothstep(0.9, 1.0, v_uv.y));
          if (cirrusBand > 0.01) {
            float streak = fbm(vec2(p.x * 1.6 - t * 0.006, p.y * 12.0));
            float wisp = smoothstep(0.52, 0.78, streak) * cirrusBand;
            color = mix(color, u_cloud * 0.98, wisp * 0.35);
          }
          if (u_count > 5.5) color = cloudPass(color, sky, p, aspect, t, 0.006, 0.10, 0.84, vec2(0.20, 0.10), 43.7, 1.0);
          if (u_count > 4.5) color = cloudPass(color, sky, p, aspect, t, 0.008, 0.62, 0.73, vec2(0.24, 0.12), 71.3, 0.85);
          if (u_count > 3.5) color = cloudPass(color, sky, p, aspect, t, 0.011, 0.33, 0.60, vec2(0.34, 0.16), 17.3, 0.55);
          if (u_count > 2.5) color = cloudPass(color, sky, p, aspect, t, 0.013, 0.80, 0.47, vec2(0.30, 0.15), 29.9, 0.45);
          if (u_count > 1.5) color = cloudPass(color, sky, p, aspect, t, 0.016, 0.05, 0.35, vec2(0.46, 0.20), 91.1, 0.15);
          color = cloudPass(color, sky, p, aspect, t, 0.020, 0.48, 0.20, vec2(0.56, 0.24), 57.2, 0.0);
          gl_FragColor = vec4(color, 1.0);
        }
      `;

/**
 * Compositing-only derivative of the untouched M4 shader above.
 *
 * M4's shadeCloud mixing can be represented as
 *   result = base * (1-opacity) + cloudRGB * opacity.
 * This variant tracks the same exact per-cloud blend coverage, reconstructs
 * cloudRGB and outputs premultiplied-independent RGBA over the approved CSS sky.
 * Every M4 density, position, turbulence, shading and drift operation is retained.
 * The original complete-sky FRAG remains available for pixel comparison.
 * This derivative is pending real browser and designer visual acceptance.
 */
export function deriveM4CloudOnly(fragment: string): string {
  const exact = (source: string, from: string, to: string) => {
    if (!source.includes(from)) throw new Error('M4 shader source contract changed: ' + from.slice(0, 30));
    return source.replace(from, to);
  };
  let shader = exact(fragment,
    'float seed, float t, float dist) {',
    'float seed, float t, float dist, inout float opacity) {');
  shader = exact(shader,
    'float seed, float dist) {',
    'float seed, float dist, inout float opacity) {');
  shader = exact(shader,
    'return shadeCloud(color, sky, p, vec2(cx, cy), r, seed, t, dist);',
    'return shadeCloud(color, sky, p, vec2(cx, cy), r, seed, t, dist, opacity);');
  shader = exact(shader,
    'return mix(color, cloudCol, alpha);',
    'opacity = 1.0 - (1.0 - opacity) * (1.0 - alpha);\n          return mix(color, cloudCol, alpha);');
  shader = exact(shader,
    'float cirrusBand = smoothstep(',
    'vec3 baseSky = color;\n          float opacity = 0.0;\n          float cirrusBand = smoothstep(');
  shader = exact(shader,
    'color = mix(color, u_cloud * 0.98, wisp * 0.35);',
    'color = mix(color, u_cloud * 0.98, wisp * 0.35);\n            opacity = 1.0 - (1.0 - opacity) * (1.0 - wisp * 0.35);');
  const occurrences = (shader.match(/color = cloudPass\([^;]+\);/g) ?? []).length;
  if (occurrences !== 6) throw new Error('M4 cloud-pass count changed: ' + occurrences);
  shader = shader.replace(/color = cloudPass\(([^;]+)\);/g,
    (_whole, args: string) => 'color = cloudPass(' + args + ', opacity);');
  shader = exact(shader,
    'gl_FragColor = vec4(color, 1.0);',
    'vec3 cloudRGB = (color - baseSky * (1.0 - opacity)) / max(opacity, 0.0001);\n          gl_FragColor = vec4(clamp(cloudRGB, 0.0, 1.0), clamp(opacity, 0.0, 1.0));');
  return shader;
}
export const M4_CLOUD_ONLY_FRAG = deriveM4CloudOnly(FRAG);
