/**
 * Pages artifact packaging for a chosen candidate SHA. No product sources
 * are modified: runtime root-relative URLs are rewritten in built outputs.
 */
import { cp, mkdir, readdir, readFile, rm, writeFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
const [writingDist, libraryDist, outputDir, sourceSha, sourcePr] = process.argv.slice(2);
if (![writingDist, libraryDist, outputDir, sourceSha, sourcePr].every(Boolean)) {
  throw Error('Usage: package-pages.mjs <writing-dist> <library-dist> <output-dir> <sha> <pr>');
}
if (!/^[a-f0-9]{40}$/.test(sourceSha) || !/^[1-9][0-9]*$/.test(sourcePr)) {
  throw Error('Source must be a full SHA and a positive PR number');
}
const root=resolve(outputDir);
await rm(root,{recursive:true,force:true});
await mkdir(root,{recursive:true});
const sites=[
  {name:'writing',dist:resolve(writingDist),roots:['assets','licenses','path']},
  {name:'library',dist:resolve(libraryDist),roots:['assets','licenses','path','review']}
];
for(const site of sites){
  const folder=join(root,site.name);
  await cp(site.dist,folder,{recursive:true});
  // Library renders shared Writing components, such as static flag clouds.
  // Its own /library/assets path also needs the Writing public resources.
  if(site.name==='library'){
    const originalPublic=process.env.WRITING_PUBLIC_DIR;
    if(!originalPublic)throw Error('WRITING_PUBLIC_DIR missing');
    for(const part of ['assets','licenses','path']){
      const original=join(resolve(originalPublic),part);
      if(await stat(original).then(s=>s.isDirectory()).catch(()=>false)){
        await cp(original,join(folder,part),{recursive:true,force:false,errorOnExist:false});
      }
    }
  }
  let replacements=0;
  async function rewrite(dir){
    for(const item of await readdir(dir,{withFileTypes:true})){
      const full=join(dir,item.name);
      if(item.isDirectory()){await rewrite(full);continue;}
      if(!/\.(html|js|css|json|svg)$/i.test(item.name))continue;
      const old=await readFile(full,'utf8');
      const roots=site.roots.join('|');
      const quoted=new RegExp('(["\\x27\\x60])\\/('+roots+')\\/','g');
      const cssUrl=new RegExp('(url\\(\\s*["\\x27]?)\\/('+roots+')\\/','g');
      const prefix='/big-academy/'+site.name+'/';
      const updated=old
        .replace(quoted,(_match,q,segment)=>{replacements++;return q+prefix+segment+'/';})
        .replace(cssUrl,(_match,q,segment)=>{replacements++;return q+prefix+segment+'/';});
      if(updated!==old)await writeFile(full,updated);
    }
  }
  await rewrite(folder);
  const index=await readFile(join(folder,'index.html'),'utf8');
  if(!index.includes('/big-academy/'+site.name+'/assets/'))throw Error(site.name+' HTML missing Vite base');
  console.log(site.name+': rebased '+replacements+' root-relative public asset references');
}
await writeFile(join(root,'index.html'),
  '<!doctype html><html lang="en"><head><meta charset="UTF-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta http-equiv="refresh" content="0;url=/big-academy/writing/">'+
  '<title>Big Academy previews</title></head><body>'+
  '<a href="/big-academy/writing/">Writing</a> · '+
  '<a href="/big-academy/library/">Component Library</a></body></html>\n');
await writeFile(join(root,'.nojekyll'),'');
await writeFile(join(root,'deployment.json'),JSON.stringify({
  repository:'Yuzhwe/big-academy',
  source_sha:sourceSha,
  source_pr:Number(sourcePr),
  paths:['/big-academy/writing/','/big-academy/library/']
},null,2)+'\n');
console.log('Release source: PR #'+sourcePr+' @ '+sourceSha);
