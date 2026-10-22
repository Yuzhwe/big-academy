import './HamburgerLayer.css';

export interface HamburgerLayerProps {
  layerId: string;
  label: string;
  value: string;
  emphasis?: boolean;
}

/** BA-WR-004 one hamburger tier. Emphasis is teaching, not a graded check. Candidate geometry. */
export function HamburgerLayer({ layerId, label, value, emphasis = false }: HamburgerLayerProps) {
  return (
    <section className="hamburger-layer" data-component="BA-WR-004" data-layer={layerId} data-emphasis={emphasis ? 'true' : 'false'} data-visual="candidate">
      <h2 className="hamburger-layer__title">{label}</h2>
      <p className="hamburger-layer__support">{value}</p>
    </section>
  );
}
