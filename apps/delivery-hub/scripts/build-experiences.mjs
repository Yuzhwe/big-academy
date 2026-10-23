import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as Icons from 'iconoir-react';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const shellMap={grid:'ViewGrid',book:'Book',palette:'Palette',component:'Puzzle',layers:'Box',search:'Search',arrow:'ArrowRight',back:'ArrowLeft',external:'OpenNewWindow',github:'Github',git:'GitBranch',share:'ShareIos',lock:'Lock',globe:'Globe',check:'Check',file:'Page',calendar:'Calendar',close:'Xmark',menu:'Menu',info:'InfoCircle',code:'Code',box:'Box',copy:'Copy',download:'Download',eye:'Eye',spark:'Sparks',type:'Text',spacing:'Ruler',motion:'Play',accessibility:'Accessibility'};
export async function buildExperiences(){
  await fs.mkdir(path.join(dist,'assets/fonts'),{recursive:true});
  await fs.mkdir(path.join(dist,'licenses'),{recursive:true});
  let fontCSS='/* Self-hosted, unmodified OFL font assets. Douyin is not bundled. */\n';
  for(const [family,files] of [['dosis',['latin-800.css','latin-ext-800.css']],['jost',['latin-400.css','latin-500.css','latin-600.css']],['noto-sans-sc',['400.css']]]){
    const base=path.dirname(require.resolve(`@fontsource/${family}/package.json`));
    for(const cssFile of files){let css=await fs.readFile(path.join(base,cssFile),'utf8');css=css.replace(/,\s*url\([^)]*\.woff\)\s*format\('woff'\)/g,'');
      for(const m of css.matchAll(/url\(\.\/files\/([^)]*\.woff2)\)/g))await fs.copyFile(path.join(base,'files',m[1]),path.join(dist,'assets/fonts',m[1]));
      css=css.replace(/\.\/files\//g,'./fonts/');fontCSS+=css+'\n';}
    await fs.copyFile(path.join(base,'LICENSE'),path.join(dist,'licenses',family+'-OFL.txt'));
  }
  await fs.writeFile(path.join(dist,'assets/fonts.css'),fontCSS);
  const iconEntries=Object.entries(Icons).filter(([name,Icon])=>Icon&&typeof Icon==='object'&&Icon.$$typeof&&name!=='IconoirContext');
  const catalog=iconEntries.map(([name,Icon])=>({name,style:name.endsWith('Solid')?'solid':'regular',svg:renderToStaticMarkup(React.createElement(Icon,{width:24,height:24,strokeWidth:1.5,'aria-hidden':true}))}));
  const iconVersion=JSON.parse(await fs.readFile(path.join(root,'node_modules/iconoir-react/package.json'),'utf8')).version;
  await fs.writeFile(path.join(dist,'icon-catalog.json'),JSON.stringify({library:'Iconoir',version:iconVersion,license:'MIT',icons:catalog}));
  const shellIcons=Object.fromEntries(Object.entries(shellMap).map(([key,name])=>{const found=catalog.find(i=>i.name===name);if(!found)throw Error('Missing Iconoir icon '+name);return [key,found.svg];}));
  await fs.writeFile(path.join(dist,'assets/shell-icons.js'),'window.HUB_SHELL_ICONS='+JSON.stringify(shellIcons)+';');
  await fs.copyFile(path.join(root,'node_modules/iconoir-react/LICENSE'),path.join(dist,'licenses/Iconoir-MIT.txt'));
  const common={absWorkingDir:root,bundle:true,minify:true,sourcemap:false,format:'iife',target:'es2022',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},alias:{'@big-academy/design-system':path.join(root,'vendor/writing/packages/design-system/src/index.ts')},loader:{'.woff2':'file'},logLevel:'warning'};
  const rawPlugin={name:'raw-html',setup(b){b.onResolve({filter:/\.html\?raw$/},args=>({path:path.resolve(args.resolveDir,args.path.replace(/\?raw$/,'')),namespace:'raw-html'}));b.onLoad({filter:/.*/,namespace:'raw-html'},async args=>({contents:await fs.readFile(args.path,'utf8'),loader:'text'}));}};
  await build({...common,entryPoints:['src/experiences/playground.tsx'],outfile:'dist/playground/lab.js'});
  await build({...common,entryPoints:['src/experiences/writing.tsx'],outfile:'dist/prototypes/writing/app.js',plugins:[rawPlugin]});
  for(const [source,dest] of [['playground.html','playground/index.html'],['writing.html','prototypes/writing/index.html'],['original.html','prototypes/writing-original/index.html'],['prototype-shell.css','prototypes/prototype-shell.css']]){
    await fs.mkdir(path.dirname(path.join(dist,dest)),{recursive:true});await fs.copyFile(path.join(root,'src/experiences',source),path.join(dist,dest));
  }
  await fs.copyFile(path.join(root,'vendor/writing/apps/writing/source/alex-original.html'),path.join(dist,'prototypes/writing-original/source.html'));
  return {icons:catalog.length,realComponents:6,candidateDemos:7,prototypes:3};
}
