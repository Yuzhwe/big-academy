import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFile(path.join(root,f),'utf8');
const context={window:{}};vm.runInNewContext(await read('dist/data.js'),context);
const d=context.window.HUB_DATA;
assert.equal(d.repository,'Yuzhwe/big-academy');
assert(d.docs.some(x=>x.path==='DESIGN.md'&&x.primary));
assert(d.docs.some(x=>x.path==='apps/writing/PRODUCT.md'&&x.primary));
assert.equal(d.components.length,13);
assert.equal(new Set(d.docs.map(x=>x.id)).size,d.docs.length);
for(const x of d.docs){assert.match(x.ref,/^[0-9a-f]{40}$/);assert(x.content.length>0);assert(!/<script\b|<iframe\b|\son\w+=/i.test(x.html));assert(!/href="javascript:/i.test(x.html));}
for(const c of d.components)assert(c.id&&c.props&&c.events&&c.states&&c.status!=='approved');
const source=JSON.parse(await read('source-snapshot.json'));
for(const original of source.documents)assert(d.docs.some(x=>x.path===original.path&&x.ref===original.ref&&x.content===original.content));
const html=await read('dist/index.html');for(const f of ['style.css','app.js','data.js','assets/writing-path.png','assets/favicon.svg']){assert(html.includes(f)||f.includes('writing-path'));await fs.access(path.join(root,'dist',f));}
new vm.Script(await read('dist/app.js'));
assert((await fs.stat(path.join(root,'dist/assets/writing-path.png'))).size>1000);
console.log('PASS: source provenance, complete document content, 13 component contracts, safe rendered Markdown, local assets and JavaScript syntax.');
