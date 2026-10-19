/** Read-only GitHub ingestion. Run from a trusted checkout with a read-scoped token. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(await fs.readFile(path.join(root,'sources.json'),'utf8'));
if(config.repository!=='Yuzhwe/big-academy')throw new Error('Only the canonical Big Academy repository is allowed');
const token=process.env.GH_TOKEN||process.env.GITHUB_TOKEN;
if(!token)throw new Error('Set GH_TOKEN or GITHUB_TOKEN with read access to Yuzhwe/big-academy. Do not put credentials in source files.');
const base=`https://api.github.com/repos/${config.repository}`;
async function get(url){const r=await fetch(base+url,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});if(!r.ok)throw new Error(`GitHub read failed: ${r.status} at ${url}`);return r.json();}
const refs=[...new Set([config.primaryBranch,...config.variants.map(v=>v.branch),...(config.prototypeSource?[config.prototypeSource.branch]:[])])];
const branches=await Promise.all(refs.map(async name=>{const b=await get(`/branches/${encodeURIComponent(name)}`);return {name,commit:{sha:b.commit.sha}};}));
const primary=branches.find(b=>b.name===config.primaryBranch);
const tree=await get(`/git/trees/${primary.commit.sha}?recursive=1`);
if(tree.truncated)throw new Error('GitHub tree truncated; refusing an incomplete snapshot.');
const requests=tree.tree.filter(x=>x.type==='blob'&&!x.path.startsWith('apps/delivery-hub/')&&(/\.md$/i.test(x.path)||x.path.endsWith('tokens.css')||x.path.endsWith('contracts/components.json'))).map(x=>({branch:primary.name,path:x.path}));
for(const v of config.variants)for(const p of v.paths)requests.push({branch:v.branch,path:p});
async function readFile(x){const ref=branches.find(b=>b.name===x.branch).commit.sha;const f=await get(`/contents/${x.path.split('/').map(encodeURIComponent).join('/')}?ref=${ref}`);if(!f.content||f.encoding!=='base64')throw new Error(`Content unavailable: ${x.path}`);return {...x,ref,content:Buffer.from(f.content,'base64').toString('utf8'),encoding:'utf-8',sha:f.sha,display_url:`https://github.com/${config.repository}/blob/${ref}/${x.path}`,display_title:x.path.split('/').pop()};}
const documents=[];for(let i=0;i<requests.length;i+=5)documents.push(...await Promise.all(requests.slice(i,i+5).map(readFile)));
// Keep executable prototype imports separate from documentation snapshots.
if(config.prototypeSource){
  const sourceBranch=branches.find(b=>b.name===config.prototypeSource.branch);
  const runtimeTree=await get(`/git/trees/${sourceBranch.commit.sha}?recursive=1`);
  if(runtimeTree.truncated)throw new Error('Prototype source tree truncated');
  const paths=runtimeTree.tree.filter(x=>x.type==='blob'&&(x.path.startsWith('apps/writing/src/')||x.path.startsWith('packages/design-system/src/')||x.path==='apps/writing/source/alex-original.html')&&!/\.test\.|\.stories\./.test(x.path)).map(x=>x.path);
  const runtime=[];
  for(let i=0;i<paths.length;i+=5)runtime.push(...await Promise.all(paths.slice(i,i+5).map(path=>readFile({branch:sourceBranch.name,path}))));
  for(const item of runtime){const target=path.join(root,'vendor/writing',item.path);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,item.content);}
  await fs.writeFile(path.join(root,'vendor/writing/manifest.json'),JSON.stringify({repository:config.repository,branch:sourceBranch.name,commit:sourceBranch.commit.sha,files:runtime.map(({path,sha})=>({path,sha}))},null,2)+'\n');
}
const imageBranch=branches.find(b=>b.name.startsWith('cursor/'));
if(imageBranch){const f=await get(`/contents/apps/writing/docs/evidence/slice/path-1440.png?ref=${imageBranch.commit.sha}`);if(f.encoding!=='base64'||!f.content)throw new Error('Preview evidence not available');await fs.writeFile(path.join(root,'writing-path.png.tmp'),Buffer.from(f.content,'base64'));}
const snapshot={repository:config.repository,capturedAt:new Date().toISOString(),branches,documents};
await fs.writeFile(path.join(root,'source-snapshot.json.tmp'),JSON.stringify(snapshot,null,2)+'\n');
await fs.rename(path.join(root,'source-snapshot.json.tmp'),path.join(root,'source-snapshot.json'));
if(imageBranch)await fs.rename(path.join(root,'writing-path.png.tmp'),path.join(root,'writing-path.png'));
console.log(`Refreshed ${documents.length} documents from ${branches.length} configured branches. Build and publish to update the website.`);
