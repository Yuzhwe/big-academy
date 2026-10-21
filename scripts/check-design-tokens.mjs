import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../packages/design-system/src/tokens.css',import.meta.url),'utf8');
const props=new Set([...src.matchAll(/(--ba-[a-z0-9-]+)\s*:/g)].map(m=>m[1]));
const targets=['apps/writing/src/components/writing/StairLessonCard.css','apps/writing/src/components/writing/LessonWorkspace.css'];
const problems=[];
for(const file of targets){const css=readFileSync(new URL('../'+file,import.meta.url),'utf8');for(const m of css.matchAll(/var\((--ba-[a-z0-9-]+)/g)){if(!props.has(m[1]))problems.push(file+': undefined '+m[1]);}}
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log('Token gate passed (scoped to migrated components).');
