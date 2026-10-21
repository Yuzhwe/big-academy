import './HamburgerLayer.css';
export interface HamburgerLayerProps {
  layers: {id:string;title:string;supporting?:string}[];
  focusId?: string;
  locale?:'en'|'zh';
}
/** BA-WR-004 educational paragraph diagram. Text must be supplied from authored product data. */
export function HamburgerLayer({layers,focusId,locale='en'}:HamburgerLayerProps){
  return <figure className="hamburger-layer" data-component="BA-WR-004" lang={locale==='zh'?'zh-CN':'en-US'}>
    {layers.map((layer,index)=><div key={layer.id} className="hamburger-layer__tier" data-active={layer.id===focusId?'true':undefined} data-position={index===0?'top':index===layers.length-1?'bottom':'middle'}>
      <strong className="hamburger-layer__title">{layer.title}</strong>
      {layer.supporting?<span className="hamburger-layer__support">{layer.supporting}</span>:null}
    </div>)}
  </figure>;
}
