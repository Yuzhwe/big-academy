import './landscape-staircase.css';

/**
 * Viewport-fixed illustration behind the existing diagonal staircase.
 * Shapes are CSS and SVG. Nothing here receives pointer events or course state.
 */
export function LandscapeBackdrop() {
  return (
    <div className="landscape-stage" data-testid="landscape-stage" aria-hidden="true">
      <div className="landscape-sky" />
      <div className="landscape-sun" />
      <div className="landscape-layer landscape-layer--far">
        <svg className="landscape-peaks" viewBox="0 0 1600 460" preserveAspectRatio="xMidYMax meet">
          <g fill="#d9d6e6">
            <ellipse cx="160" cy="340" rx="250" ry="180" />
            <ellipse cx="470" cy="370" rx="280" ry="170" />
            <ellipse cx="820" cy="330" rx="300" ry="200" />
            <ellipse cx="1160" cy="360" rx="270" ry="180" />
            <ellipse cx="1460" cy="390" rx="240" ry="160" />
          </g>
          <g fill="#c5cbe0">
            <ellipse cx="280" cy="300" rx="160" ry="130" />
            <ellipse cx="620" cy="270" rx="190" ry="150" />
            <ellipse cx="980" cy="290" rx="170" ry="140" />
            <ellipse cx="1300" cy="310" rx="160" ry="120" />
          </g>
          <g fill="#f7f4ef">
            <ellipse cx="280" cy="214" rx="74" ry="28" />
            <ellipse cx="620" cy="168" rx="88" ry="32" />
            <ellipse cx="980" cy="196" rx="76" ry="28" />
            <ellipse cx="1300" cy="230" rx="66" ry="24" />
          </g>
        </svg>
      </div>
      <div className="landscape-haze" />
      <svg className="landscape-clouds" viewBox="0 0 1440 280" preserveAspectRatio="xMidYMin meet">
        <g className="landscape-cloud-drift">
          <Cloud x={180} y={70} scale={1.05} />
          <Cloud x={520} y={36} scale={0.72} />
          <Cloud x={980} y={84} scale={1.15} />
          <Cloud x={1280} y={40} scale={0.66} />
        </g>
      </svg>
      <div className="landscape-layer landscape-layer--mid">
        <svg className="landscape-hills" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax meet">
          <g>
            <ellipse cx="120" cy="300" rx="280" ry="190" fill="#c5d98a" />
            <ellipse cx="430" cy="280" rx="300" ry="200" fill="#9dc56e" />
            <ellipse cx="760" cy="310" rx="320" ry="180" fill="#b7d36a" />
            <ellipse cx="1100" cy="290" rx="300" ry="200" fill="#8fb86a" />
            <ellipse cx="1420" cy="320" rx="280" ry="180" fill="#a9c97a" />
          </g>
          <Tree x={210} y={210} scale={1.1} kind={0} />
          <Tree x={390} y={230} scale={0.85} kind={2} />
          <Tree x={690} y={200} scale={1.2} kind={1} />
          <Tree x={960} y={220} scale={0.9} kind={3} />
          <Tree x={1240} y={200} scale={1.05} kind={0} />
        </svg>
      </div>
      <div className="landscape-layer landscape-layer--near">
        <svg className="landscape-foreground" viewBox="0 0 1600 280" preserveAspectRatio="xMidYMax meet">
          <ellipse cx="80" cy="180" rx="260" ry="140" fill="#7eaf4e" />
          <ellipse cx="360" cy="200" rx="280" ry="130" fill="#d7e86e" />
          <ellipse cx="680" cy="170" rx="300" ry="150" fill="#5f9844" />
          <ellipse cx="1020" cy="190" rx="280" ry="140" fill="#8fbf58" />
          <ellipse cx="1360" cy="180" rx="300" ry="150" fill="#4f863c" />
          <Tree x={140} y={90} scale={0.8} kind={1} />
          <Tree x={520} y={80} scale={1} kind={2} />
          <Tree x={860} y={70} scale={0.75} kind={0} />
          <Tree x={1180} y={85} scale={0.95} kind={3} />
        </svg>
      </div>
      <div className="landscape-plane-slot">
        <div className="landscape-plane">
          <svg viewBox="-210 -40 280 120" aria-hidden="true">
            <path
              d="M-8 10 C -70 28, -120 62, -190 42"
              fill="none"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.8"
            />
            <circle cx="-150" cy="52" r="7" fill="#ffffff" opacity="0.72" />
            <circle cx="-188" cy="38" r="4.5" fill="#ffffff" opacity="0.5" />
            <ellipse cx="8" cy="-4" rx="56" ry="7" fill="#e39a4e" />
            <ellipse cx="4" cy="18" rx="46" ry="6" fill="#e7a45a" />
            <ellipse cx="18" cy="8" rx="40" ry="13" fill="#f6e7c2" />
            <path d="M-16 6 L-40 -10 L-30 10 Z" fill="#f3e0b4" />
            <ellipse cx="54" cy="8" rx="9" ry="8" fill="#f0b7a4" />
            <ellipse cx="64" cy="8" rx="2.5" ry="12" fill="#ffffff" opacity="0.7" />
          </svg>
        </div>
      </div>
      <div className="landscape-grain" />
    </div>
  );
}

function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#ffffff">
      <ellipse cx="0" cy="18" rx="52" ry="24" />
      <ellipse cx="-34" cy="24" rx="30" ry="18" />
      <ellipse cx="36" cy="22" rx="34" ry="20" />
      <ellipse cx="6" cy="4" rx="28" ry="22" />
    </g>
  );
}

function Tree({ x, y, scale, kind }: { x: number; y: number; scale: number; kind: number }) {
  const blobs = ['#7eaf45', '#d5e56a', '#3f7340', '#f0d15c'];
  const a = blobs[kind % 4];
  const b = blobs[(kind + 1) % 4];
  const c = blobs[(kind + 2) % 4];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-2.5" y="10" width="5" height="28" rx="2.5" fill="#8a6244" />
      <circle cx="-12" cy="8" r="14" fill={b} />
      <circle cx="12" cy="6" r="15" fill={c} />
      <circle cx="0" cy="-2" r="16" fill={a} />
    </g>
  );
}
