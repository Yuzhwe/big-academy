/** Color Lab V1.2 · isolated, NON-PRODUCTION candidate palette.
 * Original Figma 600 references are immutable; approved tokens.css is untouched.
 * OKLCH (sRGB D65) generation, gamut clipping and WCAG 2.x contrast are computed.
 */
export const LEVELS = [50,100,200,300,400,500,600,700,800,900] as const;
export type Level = typeof LEVELS[number];
export const WHITE = '#FFFFFF';
export const WARM = '#FEF9EF';
export const DARK_ALPHA = '#072E51';
export const STATUS_RED = '#AE2314'; // Figma primitive/red/600; not part of V1.2 theme scales.
export const FAMILIES = [
  {key:'teal',name:'Teal',original:'#2F9D9D',locked900:'#133547',purpose:'Interactive Whiteboard'},
  {key:'volcano',name:'Volcano',original:'#E27184',purpose:'Reading'},
  {key:'blue',name:'Blue',original:'#2364DB',purpose:'Course'},
  {key:'orange',name:'Warm Orange · naming candidate',original:'#D97757',purpose:'Writing'},
  {key:'purple',name:'Purple',original:'#7100C2',purpose:'Plus'},
  {key:'green',name:'Green',original:'#14AE5C',purpose:'Success / Correct'},
  {key:'gray',name:'Gray',original:'#596674',purpose:'Neutral / Disabled · 600 candidate'}
] as const;
export type FamilyKey = typeof FAMILIES[number]['key'];

type RGB = {r:number;g:number;b:number};
export type LCH = {l:number;c:number;h:number};
const clamp=(v:number,min=0,max=1)=>Math.min(max,Math.max(min,v));
const lin=(x:number)=>x<=0.04045?x/12.92:Math.pow((x+0.055)/1.055,2.4);
const gam=(x:number)=>x<=0.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-0.055;
const format=(v:number)=>Math.round(clamp(v)*255).toString(16).padStart(2,'0').toUpperCase();
export function hexRGB(hex:string):RGB {
 const h=hex.replace('#','');
 if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error('Expected six-digit HEX');
 return {r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255};
}
export function rgbHex(v:RGB):string {return '#'+format(v.r)+format(v.g)+format(v.b);}
export function toOKLCH(hex:string):LCH {
 const o=hexRGB(hex),r=lin(o.r),g=lin(o.g),b=lin(o.b);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
 const m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
 const s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 const L=.2104542553*l+.793617785*m-.0040720468*s;
 const a=1.9779984951*l-2.428592205*m+.4505937099*s;
 const bb=.0259040371*l+.7827717662*m-.808675766*s;
 return {l:L,c:Math.hypot(a,bb),h:(Math.atan2(bb,a)*180/Math.PI+360)%360};
}
function rawRGB({l,c,h}:LCH):RGB {
 const rad=h*Math.PI/180,a=c*Math.cos(rad),b=c*Math.sin(rad);
 const ll=Math.pow(l+.3963377774*a+.2158037573*b,3);
 const mm=Math.pow(l-.1055613458*a-.0638541728*b,3);
 const ss=Math.pow(l-.0894841775*a-1.291485548*b,3);
 return {r:gam(4.0767416621*ll-3.3077115913*mm+.2309699292*ss),
 g:gam(-1.2684380046*ll+2.6097574011*mm-.3413193965*ss),
 b:gam(-.0041960863*ll-.7034186147*mm+1.7076147010*ss)};
}
function gamut(v:RGB):boolean {return Object.values(v).every(x=>Number.isFinite(x)&&x>=-0.000001&&x<=1.000001);}
export function fromOKLCH(lch:LCH):string {
 // Binary-search chroma rather than per-channel RGB clipping (preserves hue).
 const target={...lch,l:clamp(lch.l),c:Math.max(0,lch.c)};
 let rgb=rawRGB(target);
 if(!gamut(rgb)){
  let low=0, high=target.c;
  for(let i=0;i<28;i++){const m=(low+high)/2;const cand=rawRGB({...target,c:m});if(gamut(cand)){low=m;rgb=cand;}else high=m;}
  rgb=rawRGB({...target,c:low});
 }
 return rgbHex(rgb);
}
export function composite(foreground:string,alpha:number,background:string):string {
 const f=hexRGB(foreground),b=hexRGB(background),a=clamp(alpha);
 return rgbHex({r:f.r*a+b.r*(1-a),g:f.g*a+b.g*(1-a),b:f.b*a+b.b*(1-a)});
}
export function cssAlpha(color:string,alpha:number):string {
 const {r,g,b}=hexRGB(color);
 return 'rgb('+Math.round(r*255)+' '+Math.round(g*255)+' '+Math.round(b*255)+' / '+Math.round(alpha*100)+'%)';
}
export function luminance(hex:string):number {
 const v=hexRGB(hex);return .2126*lin(v.r)+.7152*lin(v.g)+.0722*lin(v.b);
}
export function contrast(a:string,b:string):number {
 const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export const contrastText=(foreground:string,background:string,alpha=1)=>contrast(composite(foreground,alpha,background),background);
function corrected600(original:string):string {
 if(contrast(original,WHITE)>=4.5)return original;
 const start=toOKLCH(original);
 let low=.12,high=start.l, best=fromOKLCH({...start,l:low});
 // Aim at 4.55 to preserve clearance after 8-bit sRGB rounding.
 for(let i=0;i<28;i++){
  const mid=(low+high)/2,candidate=fromOKLCH({...start,l:mid});
  if(contrast(candidate,WHITE)>=4.55){low=mid;best=candidate;} else high=mid;
 }
 return best;
}
const hueLerp=(from:number,to:number,t:number)=>{
 const dist=((to-from+540)%360)-180;return (from+dist*t+360)%360;
};
function mix(a:LCH,b:LCH,t:number):LCH {
 return {l:a.l+(b.l-a.l)*t,c:a.c+(b.c-a.c)*t,h:hueLerp(a.h,b.h,t)};
}
export type Palette={key:FamilyKey;name:string;purpose:string;original600:string;adjusted600:string;originalRatio:number;adjustedRatio:number;locked900:boolean;scale:Record<Level,string>};
export function generatePalette(family:typeof FAMILIES[number]):Palette {
 const adjusted=corrected600(family.original);
 const base=toOKLCH(adjusted);
 const pale=toOKLCH('#FFFFFF');
 const scale={} as Record<Level,string>;
 const lighter:[Level,number,number][]=[[50,.98,.07],[100,.952,.14],[200,.910,.26],[300,.856,.40],[400,.781,.58],[500,Math.min(.74,base.l+(.74-base.l)*.48),.78]];
 for(const [level,l,chromaScale] of lighter){
  scale[level]=fromOKLCH({l:Math.max(base.l+.015,l),c:base.c*chromaScale,h:base.h});
 }
 scale[600]=adjusted;
 if('locked900' in family && family.locked900){
  const end=toOKLCH(family.locked900);
  scale[700]=fromOKLCH(mix(base,end,1/3));
  scale[800]=fromOKLCH(mix(base,end,2/3));
  scale[900]=family.locked900;
 }else{
  const end={...base,l:Math.max(.20,base.l-.24),c:base.c*.55};
  scale[700]=fromOKLCH(mix(base,end,.33));
  scale[800]=fromOKLCH(mix(base,end,.66));
  scale[900]=fromOKLCH(end);
 }
 void pale;
 return {key:family.key,name:family.name,purpose:family.purpose,original600:family.original,adjusted600:adjusted,originalRatio:contrast(family.original,WHITE),adjustedRatio:contrast(adjusted,WHITE),locked900:'locked900' in family,scale};
}
export const PALETTES=FAMILIES.map(generatePalette);
export const ROLE_DEFS=[
 {id:1,name:'App Background',group:'Background',source:'White / Gray 50',example:'Canvas'},
 {id:2,name:'Subtle Background',group:'Background',source:'Theme 50',example:'Page tint'},
 {id:3,name:'Component Background',group:'Background',source:'Theme 100',example:'Soft surface'},
 {id:4,name:'Hover Background',group:'Interactive',source:'Theme 200',example:'Hover'},
 {id:5,name:'Selected Background',group:'Interactive',source:'Theme 300',example:'Selected'},
 {id:6,name:'Subtle Border',group:'Border',source:'Theme 900 / 20%',example:'Decorative stroke'},
 {id:7,name:'Interactive Border',group:'Border',source:'Theme 900 / 80%',example:'Strong outline'},
 {id:8,name:'Strong Border / Focus',group:'Border',source:'Theme 900 or Theme 600',example:'Focus candidate'},
 {id:9,name:'Solid Background',group:'Solid',source:'Theme 600',example:'CTA default'},
 {id:10,name:'Solid Hover',group:'Solid',source:'Theme 700',example:'CTA hover'},
 {id:11,name:'Secondary Text',group:'Text',source:'Theme 900 / 60%',example:'Supporting copy'},
 {id:12,name:'Primary Text',group:'Text',source:'Theme 900 / 100%',example:'Body text'},
] as const;
export type Role=typeof ROLE_DEFS[number];
export function resolvedRole(role:Role,palette:Palette,background:string=WHITE){
 const s=palette.scale;
 const table:Record<number,{source:string;color:string;alpha:number;background:string}>={
  1:{source:background===WHITE?'White':'Gray 50',color:background===WHITE?WHITE:PALETTES[6].scale[50],alpha:1,background},
  2:{source:'Theme 50',color:s[50],alpha:1,background},
  3:{source:'Theme 100',color:s[100],alpha:1,background},
  4:{source:'Theme 200',color:s[200],alpha:1,background},
  5:{source:'Theme 300',color:s[300],alpha:1,background},
  6:{source:'Theme 900 / 20%',color:s[900],alpha:.2,background},
  7:{source:'Theme 900 / 80%',color:s[900],alpha:.8,background},
  8:{source:'Theme 900',color:s[900],alpha:1,background},
  9:{source:'Theme 600',color:s[600],alpha:1,background},
  10:{source:'Theme 700',color:s[700],alpha:1,background},
  11:{source:'Theme 900 / 60%',color:s[900],alpha:.6,background},
  12:{source:'Theme 900 / 100%',color:s[900],alpha:1,background},
 };
 const result=table[role.id];return {...result,css:cssAlpha(result.color,result.alpha),composited:composite(result.color,result.alpha,background),ratio:contrastText(result.color,background,result.alpha)};
}
export function exportTokenData(){
 const primitives=Object.fromEntries(PALETTES.map(p=>[p.key,Object.fromEntries(LEVELS.map(level=>[level,p.scale[level]]))]));
 return {version:'1.2-candidate',approved:false,colorSpace:'OKLCH / sRGB',base600:PALETTES.map(p=>({name:p.key,original:p.original600,adjusted:p.adjusted600,contrastWCAG:p.adjustedRatio,locked900:p.locked900})),primitives,semantics:{roles:ROLE_DEFS,success:'green',error:STATUS_RED,disabled:'gray',themeAlpha:'selected palette 900',darkAlpha:DARK_ALPHA},components:{primary:{default:600,hover:700,pressed:800,foreground:WHITE,review:'candidate'},secondary:{stroke:'theme-900@alpha',review:'candidate'},choice:{correct:'green',wrong:'red',review:'existing component remains unchanged'}}};
}
