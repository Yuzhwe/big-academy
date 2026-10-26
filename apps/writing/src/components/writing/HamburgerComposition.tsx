import { HamburgerLayer, type HamburgerLayerProps } from './HamburgerLayer';
import './HamburgerComposition.css';

export interface HamburgerCompositionProps {
  layers: readonly HamburgerLayerProps[];
  className?: string;
}

/** BA-WR-004 composite candidate. Three existing layers, one reusable layout.
 * It is preview-only until its visual alignment is approved by the designer.
 */
export function HamburgerComposition({ layers, className }: HamburgerCompositionProps) {
  return <div data-component="BA-WR-004-COMPOSITE"
    className={['hamburger-composition',className].filter(Boolean).join(' ')}>
    {layers.map(layer=><HamburgerLayer key={layer.layerId} {...layer}/>)}
  </div>;
}
