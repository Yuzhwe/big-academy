import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
describe('Figma Effect Styles source-of-truth',()=>{
  const css=readFileSync(resolve(process.cwd(),'packages/design-system/src/tokens.css'),'utf8');
  it('tracks Figma four elevations and export blur without copying values into components',()=>{
    expect(css).toContain('--ba-elevation-100: 0 0 2px 0 var(--ba-effect-shadow-subtle), 0 2px 4px 0 var(--ba-effect-shadow-default);');
    expect(css).toContain('--ba-elevation-200: 0 4px 16px 0 var(--ba-effect-shadow-subtle);');
    expect(css).toContain('--ba-elevation-300: 0 2px 2px 0 var(--ba-effect-shadow-subtle), 0 8px 24px 0 var(--ba-effect-shadow-default);');
    expect(css).toContain('--ba-elevation-400: 0 0 2px 0 var(--ba-effect-shadow-strong), 0 8px 24px 0 var(--ba-effect-shadow-strong);');
    expect(css).toContain('--ba-blur-background-20: blur(10px);');
  });
});
