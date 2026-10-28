import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, relative, extname, sep } from 'node:path';
const [site, rootArg, portArg]=process.argv.slice(2);
if(!['library','writing'].includes(site) || !rootArg || !portArg) throw new Error('Expected site, root and port');
const root=resolve(rootArg), port=Number(portArg), startedAt=new Date().toISOString();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
async function handle(req,res){
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/__ba_local_status'){
   res.writeHead(200,{'Content-Type':types['.json'],'Cache-Control':'no-store'}).end(JSON.stringify({application:'Big Academy',site,port,startedAt}));return;
  }
  let file=resolve(root,'.'+pathname), info;
  const rel=relative(root,file);
  if(rel==='..' || rel.startsWith('..'+sep) || pathname.includes('\0')){res.writeHead(403).end();return;}
  try{info=await stat(file);if(info.isDirectory()){file=resolve(file,'index.html');info=await stat(file);}}
  catch{if(!extname(pathname)){file=resolve(root,'index.html');info=await stat(file);}else{res.writeHead(404).end('Not found');return;}}
  if(!info.isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Content-Length':info.size,'Cache-Control':extname(file)==='.html'?'no-store':'no-cache','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD'){res.end();return;}
  createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch(error){console.error(error.message);if(!res.headersSent)res.writeHead(400);res.end('Bad request');}
}
const servers=['127.0.0.1','::1'].map(host=>{
 const server=http.createServer(handle);
 server.on('error',error=>{console.error(host,error.message);process.exitCode=1;for(const item of servers)item.close();setTimeout(()=>process.exit(1),100).unref();});
 server.listen(port,host,()=>console.log(`${site}: http://${host.includes(':')?'['+host+']':host}:${port}`));return server;
});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{for(const server of servers)server.close();setTimeout(()=>process.exit(0),100).unref();});
