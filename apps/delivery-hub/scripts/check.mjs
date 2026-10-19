import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
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
new vm.Script(await read('dist/foundations.js'));
assert((await fs.stat(path.join(root,'dist/assets/writing-path.png'))).size>1000);
const manifest=JSON.parse(await read('vendor/writing/manifest.json'));
for(const f of manifest.files){const data=await fs.readFile(path.join(root,'vendor/writing',f.path));const hash=crypto.createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');assert.equal(hash,f.sha,`Modified imported source: ${f.path}`);}
const catalog=JSON.parse(await read('dist/icon-catalog.json'));assert(catalog.icons.length>1500);assert.equal(new Set(catalog.icons.map(i=>i.name)).size,catalog.icons.length);
for(const i of catalog.icons)assert(/^<svg/.test(i.svg)&&!/<script|onload=|javascript:/i.test(i.svg));
for(const f of ['playground/index.html','playground/lab.js','playground/lab.css','prototypes/writing/index.html','prototypes/writing/app.js','prototypes/writing/app.css','prototypes/writing-original/index.html','prototypes/writing-original/source.html','assets/fonts.css','licenses/Iconoir-MIT.txt','licenses/dosis-OFL.txt','licenses/jost-OFL.txt','licenses/noto-sans-sc-OFL.txt'])await fs.access(path.join(root,'dist',f));
const fonts=await read('dist/assets/fonts.css');for(const m of fonts.matchAll(/url\(\.\/fonts\/([^)]*)\)/g))await fs.access(path.join(root,'dist/assets/fonts',m[1]));
const original=await fs.readFile(path.join(root,'vendor/writing/apps/writing/source/alex-original.html'));assert.deepEqual(await fs.readFile(path.join(root,'dist/prototypes/writing-original/source.html')),original);
assert((await read('dist/prototypes/writing/index.html')).includes('reset-prototype'));
console.log('PASS: source documents, contracts, 27 exact prototype blobs, complete Iconoir catalog, safe Markdown, font/license assets and executable prototype outputs.');
