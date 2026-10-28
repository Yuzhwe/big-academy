import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const support=resolve(homedir(),'Library/Application Support/Big Academy');
const agents=resolve(homedir(),'Library/LaunchAgents');
const uid=process.getuid(), domain=`gui/${uid}`;
const sites=[{id:'library',port:6007},{id:'writing',port:5174}];
const run=(command,args,allowFailure=false)=>{try{return execFileSync(command,args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}catch(error){if(!allowFailure)throw new Error(`${command}: ${error.stderr?.toString()||error.message}`);return '';}};
if(process.platform!=='darwin')throw new Error('This installer supports macOS.');
for(const site of sites)if(!existsSync(resolve(repo,`apps/${site.id}/dist/index.html`)))throw new Error(`Build apps/${site.id} first`);
await mkdir(agents,{recursive:true});await mkdir(resolve(support,'logs'),{recursive:true});await mkdir(resolve(support,'runtime'),{recursive:true});
const runtime=resolve(support,'runtime',`node-${process.version}`);
if(!existsSync(runtime))await cp(process.execPath,runtime,{dereference:true,preserveTimestamps:true});
const license=resolve(dirname(process.execPath),'..','LICENSE');
if(existsSync(license))await cp(license,resolve(support,'runtime','NODE-LICENSE.txt'));
const server=resolve(support,'local-site-server.mjs');await cp(resolve(repo,'scripts/local-site-server.mjs'),server);
const xml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for(const site of sites){
 const label=`com.bigacademy.local.${site.id}`, destination=resolve(support,'sites',site.id);
 run('/bin/launchctl',['bootout',`${domain}/${label}`],true);
 // Retire only prior Vite previews belonging to this Big Academy workspace.
 const pids=run('/usr/sbin/lsof',['-t','-nP',`-iTCP:${site.port}`,'-sTCP:LISTEN'],true).split(/\s+/).filter(Boolean);
 for(const pid of new Set(pids)){
  const cwd=run('/usr/sbin/lsof',['-a','-p',pid,'-d','cwd','-Fn'],true).split('\n').find(line=>line.startsWith('n'))?.slice(1);
  const command=run('/bin/ps',['-p',pid,'-o','command='],true);
  if(cwd?.startsWith(resolve(repo,'..')) && /node_modules\/(?:\.bin\/vite|vite\/)/.test(command)){process.kill(Number(pid),'SIGTERM');console.log(`Stopped prior Big Academy preview on ${site.port}.`);}
  else throw new Error(`Port ${site.port} is occupied by another process; it was left unchanged.`);
 }
 await mkdir(destination,{recursive:true});
 const source=resolve(repo,`apps/${site.id}/dist`);
 for(const file of await readdir(source)){if(file!=='index.html')await cp(resolve(source,file),resolve(destination,file),{recursive:true,force:true});}
 await cp(resolve(source,'index.html'),resolve(destination,'index.html'));
 const args=[runtime,server,site.id,destination,String(site.port)];
 const plist=`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>Label</key><string>${label}</string><key>ProgramArguments</key><array>${args.map(arg=>'<string>'+xml(arg)+'</string>').join('')}</array><key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>5</integer><key>ProcessType</key><string>Background</string><key>WorkingDirectory</key><string>${xml(support)}</string><key>StandardOutPath</key><string>${xml(resolve(support,'logs',site.id+'.log'))}</string><key>StandardErrorPath</key><string>${xml(resolve(support,'logs',site.id+'.error.log'))}</string></dict></plist>\n`;
 const path=resolve(agents,label+'.plist');await writeFile(path,plist,{mode:0o644});
 run('/usr/bin/plutil',['-lint',path]);run('/bin/launchctl',['enable',`${domain}/${label}`]);run('/bin/launchctl',['bootstrap',domain,path]);run('/bin/launchctl',['kickstart','-k',`${domain}/${label}`]);
 let ready=false;
 for(let attempt=0;attempt<50;attempt++){
  try{const response=await fetch(`http://localhost:${site.port}/__ba_local_status`);const value=await response.json();if(value.site===site.id){ready=true;break;}}catch{}
  await new Promise(done=>setTimeout(done,200));
 }
 if(!ready)throw new Error(`${site.id} did not start; inspect ${support}/logs`);
 console.log(`${site.id}: http://localhost:${site.port}/ — background service ready`);
}
await writeFile(resolve(support,'installation.json'),JSON.stringify({source:repo,installedAt:new Date().toISOString(),sites},null,2)+'\n');
