import source from '../../../packages/design-system/src/tokens.css?raw';
export type ColorToken = { name:string; definition:string; value:string; scope:string; layer:string; purpose:string; note:string; effect:boolean };
const declarations: {name:string; definition:string; scope:string; note:string}[]=[];
// One executable token source; every scoped declaration is kept, including overrides.
for(const block of source.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
  const scope=block[1].replace(/\/\*[\s\S]*?\*\//g,'').trim();
  for(const d of block[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);(?:[^\S\n]*\/\*([^*]*)\*\/)?/g)) {
    declarations.push({name:d[1],definition:d[2].trim(),scope,note:d[3]?.trim() ?? ''});
  }
}
const roots=Object.fromEntries(declarations.filter(d=>d.scope===':root').map(d=>[d.name,d.definition]));
function resolve(value:string, scope:string, chain:string[]=[]):string {
  const local=Object.fromEntries(declarations.filter(d=>d.scope===scope).map(d=>[d.name,d.definition]));
  return value.replace(/var\((--[\w-]+)(?:,\s*([^()]+))?\)/g,(_,name:string,fallback:string)=>{
    if(chain.includes(name)) return `unresolved(${name})`;
    return resolve(local[name]??roots[name]??fallback??`unresolved(${name})`,scope,[...chain,name]);
  });
}
export const colorTokens:ColorToken[]=declarations.flatMap(d=>{
  const value=resolve(d.definition,d.scope,[d.name]);
  if(!/(#[\da-f]{3,8}\b|rgba?\(|hsla?\(|transparent|gradient\(|color-mix\()/i.test(value)) return [];
  const primitive=/^--ba-color-(neutral|warm|brand|writing|success|danger|warning|info)-\d+$/.test(d.name);
  const layer=primitive?'Primitive':d.name.startsWith('--ba-color-')?'Semantic':'Component / Legacy';
  const purpose=/disabled|muted/.test(d.name)?'禁用与弱化':/success|error|danger|warning|hint|info|correct|revealed/.test(d.name)?'反馈':/border|stroke|focus/.test(d.name)?'边框与焦点':/content|ink|text/.test(d.name)?'文字':/surface|background|bg|canvas|paper/.test(d.name)?'背景与表面':/shadow|elevation/.test(d.name)?'阴影与效果':'品牌、强调与其他';
  return [{...d,value,layer,purpose,effect:/shadow|elevation/.test(d.name)&&!/^rgba?\(/.test(value)}];
});
