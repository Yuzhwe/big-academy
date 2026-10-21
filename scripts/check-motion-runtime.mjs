import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const token=read('packages/design-system/src/tokens.css');
const source=read('packages/design-system/src/motion/spring.ts');
const overlay=read('packages/design-system/src/components/ui/BAOverlay.tsx');
const names=['bouncy','snappy','gentle','heavy-snap','bubble-enter','modal-enter'];
const errors=[];
for(const name of names)for(const prop of ['stiffness','damping']){
 if(!token.includes('--ba-motion-spring-'+name+'-'+prop+':'))errors.push('Missing '+name+' '+prop);
}
if(!/getComputedStyle\(root\)/.test(source))errors.push('Spring runtime must read CSS variables at runtime');
if(!/requestAnimationFrame\(step\)/.test(source))errors.push('Spring runtime must animate actual frames');
if(!/prefers-reduced-motion/.test(source))errors.push('Reduced motion handling absent');
if(!/animateSpring\(/.test(overlay))errors.push('BAOverlay does not consume shared spring runtime');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Motion runtime gate passed: six authored spring presets + interactive consumer.');
