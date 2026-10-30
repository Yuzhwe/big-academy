/**
 * Public/static preview smoke test. Runs from the PRODUCT checkout root
 * after copy from the infrastructure checkout so @playwright/test resolves.
 * Local mode serves the assembled Pages artifact at its real /big-academy/ URL.
 * Hosted mode opens the actual github.io URL after deployment.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, join, sep } from 'node:path';
import { chromium } from '@playwright/test';

const siteDir=process.env.PAGES_SITE_DIR;
const hosted=process.env.PAGES_PUBLIC_BASE;
const output=resolve(process.env.PAGES_SMOKE_DIR||'pages-smoke-evidence');
if(!hosted&&!siteDir)throw Error('Specify PAGES_SITE_DIR (local) or PAGES_PUBLIC_BASE (hosted)');
await mkdir(output,{recursive:true});
let server;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
if(!hosted){
  const root=resolve(siteDir);
  server=createServer(async(req,res)=>{
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
    if(!pathname.startsWith('/big-academy/')){res.writeHead(404).end('Outside Pages prefix');return;}
    const relative=pathname.slice('/big-academy/'.length);
    const suffix=relative.endsWith('/')?relative+'index.html':relative;
    const file=resolve(root,suffix);
    if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
    try{
      const bytes=await readFile(file);
      res.writeHead(200,{'content-type':mime[extname(file).toLowerCase()]||'application/octet-stream'});
      res.end(bytes);
    }catch{res.writeHead(404).end('Not found: '+suffix);}
  });
  await new Promise(done=>server.listen(18087,'127.0.0.1',done));
}
const base=hosted||'http://127.0.0.1:18087';
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
let failures=0;
try{
  for(const app of ['writing','library']){
    for(const viewport of [{width:1440,height:900},{width:834,height:1112}]){
      const page=await browser.newPage({viewport});
      const broken=[],errors=[];
      page.on('response',response=>{
        const u=response.url();
        if(u.startsWith(base+'/big-academy/')&&response.status()>=400)broken.push(response.status()+' '+u);
      });
      page.on('pageerror',error=>errors.push(error.message));
      const url=base+'/big-academy/'+app+'/';
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
      if(!response?.ok())errors.push('Bad HTML status '+response?.status());
      await page.locator('#root').locator('*').first().waitFor({state:'visible',timeout:20000});
      await page.waitForTimeout(1500);
      await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,10000))]));
      const details=await page.evaluate(()=>{
        const root=document.querySelector('#root');
        const images=[...document.querySelectorAll('img')];
        const visible=images.filter(img=>{
          const r=img.getBoundingClientRect();
          return r.width>0&&r.height>0&&r.bottom>=0&&r.top<innerHeight;
        });
        const broken=visible.filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.src);
        return {title:document.title,textLength:(root?.textContent||'').trim().length,
          buttons:root?.querySelectorAll('button').length||0,
          font:getComputedStyle(root?.firstElementChild||document.body).fontFamily,
          visibleImages:visible.length,brokenImages:broken,
          fontStatus:document.fonts.status};
      });
      if(details.textLength<15||details.buttons===0)errors.push('Empty/noninteractive app '+JSON.stringify(details));
      for(const i of details.brokenImages)broken.push('bad image '+i);
      await page.screenshot({path:join(output,app+'-'+viewport.width+'.png'),fullPage:false});
      console.log('PAGES SMOKE '+app+' '+viewport.width+' '+JSON.stringify({url,details,broken,errors}));
      if(broken.length||errors.length)failures++;
      await page.close();
    }
  }
  const metadata=await (await fetch(base+'/big-academy/deployment.json')).json();
  if(!/^[a-f0-9]{40}$/.test(metadata.source_sha)||!metadata.source_pr)throw Error('Bad deployment metadata');
  if(process.env.PAGES_EXPECTED_SHA&&metadata.source_sha!==process.env.PAGES_EXPECTED_SHA)throw Error('Unexpected released SHA: '+metadata.source_sha);
  console.log('PAGES VERIFIED RELEASE: PR #'+metadata.source_pr+' SHA '+metadata.source_sha);
}finally{
  await browser.close();
  await new Promise(done=>server?server.close(done):done());
}
if(failures)throw Error(failures+' Pages browser smoke cases failed');
