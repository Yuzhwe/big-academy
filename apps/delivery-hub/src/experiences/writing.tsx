import {createRoot} from 'react-dom/client';
import {CourseApp} from '../../vendor/writing/apps/writing/src/course/CourseApp';
import {PilotPreview} from '../../vendor/writing/apps/writing/src/PilotPreview';
import {CourseSession} from '../../vendor/writing/apps/writing/src/product/courseSession';
import html from '../../vendor/writing/apps/writing/source/alex-original.html?raw';
import '../../vendor/writing/packages/design-system/src/tokens.css';
import '../../vendor/writing/apps/writing/src/preview.css';

// Hosting adapter only: isolate this site's demo progress from Alex's original page.
const prefix='ba-hub-writing-v2:';
const memory=new Map<string,string>();
function keys(){try{return Object.keys(localStorage).filter(k=>k.startsWith(prefix));}catch{return [...memory.keys()];}}
const storage:Storage={get length(){return keys().length;},key(index){return keys()[index]?.slice(prefix.length)??null;},getItem(key){try{return localStorage.getItem(prefix+key);}catch{return memory.get(prefix+key)??null;}},setItem(key,value){try{localStorage.setItem(prefix+key,value);}catch{memory.set(prefix+key,value);}},removeItem(key){try{localStorage.removeItem(prefix+key);}catch{memory.delete(prefix+key);}},clear(){for(const k of keys()){try{localStorage.removeItem(k);}catch{memory.delete(k);}}}};
const fixture=new URLSearchParams(location.search).has('fixture');
if(fixture){document.querySelector('#prototype-notice')!.textContent='Top Bar 组件测试场景：可切换状态、语言与长标题。这里的任务权限来自示例数据。';}
const session=fixture?null:new CourseSession({html,storage,search:location.search});
createRoot(document.getElementById('root')!).render(fixture?<PilotPreview/>:<CourseApp session={session!}/>);
const reset=document.getElementById('reset-dialog') as HTMLDialogElement;
document.getElementById('reset-prototype')!.addEventListener('click',()=>reset.showModal());
document.getElementById('cancel-reset')!.addEventListener('click',()=>reset.close());
document.getElementById('confirm-reset')!.addEventListener('click',()=>{storage.clear();location.reload();});
