import type { CSSProperties } from 'react';

/** Decorative E-01 scenery. It does not receive pointer events or change lesson state. */
export function LandscapeBackdrop({ cameraX }: { cameraX: number }) {
  const style = { '--camera-x': cameraX + 'px' } as CSSProperties;
  return (
    <div className="staircase-landscape" style={style} aria-hidden="true">
      <div className="landscape-sky" />
      <div className="landscape-glow" />
      <svg className="landscape-peaks" viewBox="0 0 1600 460" preserveAspectRatio="xMidYMax meet">
        <path fill="#D9D6E6" d="M0 460V300l160-150 180 110 160-190 170 150 180-170 180 140 200-120 190 120 180-90V460Z" />
        <path fill="#C5CBE0" d="M0 460V360l150-110 180 90 170-160 180 130 190-140 200 120 210-100 180 90 140-70V460Z" />
        <path fill="#F7F4EF" d="m500 70 42 58h-84Zm340-28 48 66h-96Zm360 48 46 58h-92Z" />
      </svg>
      <div className="landscape-haze" />
      <div className="landscape-clouds">
        <svg className="landscape-clouds__drift" viewBox="0 0 1440 280" preserveAspectRatio="xMidYMid meet">
          <g fill="#fff">
            <ellipse cx="180" cy="150" rx="90" ry="36" opacity="0.92" />
            <ellipse cx="240" cy="138" rx="64" ry="28" opacity="0.9" />
            <ellipse cx="520" cy="96" rx="110" ry="40" opacity="0.88" />
            <ellipse cx="600" cy="84" rx="70" ry="30" />
            <ellipse cx="940" cy="160" rx="100" ry="34" opacity="0.9" />
            <ellipse cx="1020" cy="148" rx="72" ry="28" opacity="0.85" />
            <ellipse cx="1280" cy="110" rx="86" ry="32" opacity="0.92" />
          </g>
        </svg>
      </div>
      <svg className="landscape-hills" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax meet">
        <path fill="#C5D98A" d="M0 420V250c120-80 220-40 340-70 140-36 200 40 340 10 150-32 220-90 360-70 120 16 200 60 320 30 80-20 140 10 240 20v250Z" />
        <path fill="#9DC56E" d="M0 420V310c160-50 260-10 400-40 160-34 240 30 400 8 170-24 250-60 420-30 90 16 160 20 380 16v156Z" />
        <path fill="#B7D36A" d="M80 420V280c80-30 140 10 210-8 90-24 120 20 210 6 100-16 140-40 230-24v166Z" />
        <path fill="#8FB86A" d="M900 420V300c90-36 150 8 240-10 80-16 130-40 220-18v148Z" />
        <path fill="#A9C97A" d="M1280 420V320c70-20 120 12 200-6 40-8 80-16 120-8v114Z" />
        <Tree x={240} y={250} />
        <Tree x={460} y={268} scale={0.85} />
        <Tree x={760} y={246} scale={1.05} />
        <Tree x={1120} y={270} scale={0.9} />
        <Tree x={1420} y={286} scale={0.8} />
      </svg>
      <svg className="landscape-near" viewBox="0 0 1600 280" preserveAspectRatio="xMidYMax meet">
        <path fill="#7EAF4E" d="M0 280V150c140-70 240-20 380-48 160-32 230 36 390 10 180-30 260-80 460-46 110 18 180 36 370 28v186Z" />
        <path fill="#D7E86E" d="M0 280V200c120-28 200 8 320-16 130-26 190 18 320 4 150-16 220-36 340-12 90 16 180 8 300 6 80-2 160 8 320 4v94Z" />
        <path fill="#5F9844" d="M40 280V210c90-24 150 10 250-8 110-20 160 16 270 4v74Z" />
        <path fill="#8FBF58" d="M720 280V214c100-30 160 12 270-6 90-14 150-28 250-10v82Z" />
        <path fill="#4F863C" d="M1180 280V220c80-18 140 14 220-4 60-10 120-8 200 2v62Z" />
        <Tree x={180} y={168} scale={1.15} />
        <Tree x={520} y={176} />
        <Tree x={980} y={160} scale={1.2} />
        <Tree x={1360} y={184} scale={0.95} />
      </svg>
      <div className="landscape-plane">
        <svg className="landscape-plane__flight" viewBox="0 0 168 78" width="168" height="78">
          <ellipse cx="28" cy="50" rx="22" ry="7" fill="#fff" opacity="0.75" />
          <ellipse cx="48" cy="46" rx="12" ry="4" fill="#fff" opacity="0.55" />
          <path fill="#E39A4E" d="M62 36 28 16h40Z" />
          <path fill="#F6E7C2" d="M48 40h74l16-8h18l-16 14H120l-18 14H70Z" />
          <path fill="#E7A45A" d="m78 48-30 18h42Z" />
          <circle cx="128" cy="36" r="3" fill="#133547" />
        </svg>
      </div>
      <svg className="landscape-grain">
        <filter id="e01-landscape-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#e01-landscape-grain)" />
      </svg>
    </div>
  );
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g className="landscape-tree" transform={'translate(' + x + ' ' + y + ') scale(' + scale + ')'}>
      <rect x="-4" y="0" width="8" height="26" rx="2" fill="#8A6244" />
      <circle cx="0" cy="-8" r="16" fill="#5F9844" />
      <circle cx="-12" cy="0" r="12" fill="#7EAF4E" />
      <circle cx="12" cy="0" r="12" fill="#4F863C" />
    </g>
  );
}
