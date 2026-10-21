import { readFileSync } from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const card=read('apps/writing/src/components/writing/StairLessonCard.tsx');
const course=read('apps/writing/src/course/CourseApp.tsx');
const topbar=read('apps/writing/src/components/writing/LessonTopBar.tsx');
const workspace=read('apps/writing/src/components/writing/LessonWorkspace.css');
const issues=[];
if(!/import\s*\{[^}]*BAButton/.test(card)||!/<BAButton\b/.test(card))issues.push('Lesson CTA must consume shared BAButton');
if(/import\s*\{[^}]*\bButton\b[^}]*\}\s*from\s*['"]react-aria-components['"]/.test(card))issues.push('Lesson card bypasses BAButton');
if(!/<BAButton\b/.test(topbar))issues.push('TopBar Back must consume BAButton');
if((course.match(/<BAButton\b/g)||[]).length<4)issues.push('Coach/Footer must consume BAButton');
if(!/grid-template-columns:\s*minmax\(0,1fr\)\s+minmax\(0,2fr\)/.test(workspace))issues.push('Footer must use full-width 1:2 grid');
if(issues.length){console.error(issues.join('\n'));process.exit(1);}
console.log('Component reuse gate passed (documented limited scope).');
