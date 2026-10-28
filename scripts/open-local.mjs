import { execFile } from 'node:child_process';
const url='http://127.0.0.1:5174/';
for(let attempt=0;attempt<100;attempt++){
 try{const response=await fetch(url);if(response.ok && (await response.text()).includes('<title>Big Academy Writing</title>')){execFile('open',[url]);break;}}catch{}
 await new Promise(resolve=>setTimeout(resolve,200));
}
