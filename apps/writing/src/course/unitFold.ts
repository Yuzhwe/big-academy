/**
 * Upper-right folded sheet for the Unit card.
 * Seam endpoints are the F×F square corners (0,0) and (F,F): card points (width-F, 0) and (width, F).
 * Body radius follows the card corner. Flap tips use the fold tip/seam radii. No cut-corner chamfer.
 */

export type Point = { x: number; y: number };

export function unitFoldPaths(fold = 32, bodyRadius = 16, tipRadius = 4, seamRadius = 4) {
  const under = [
    `M 0 0`,
    `L ${fold - bodyRadius} 0`,
    `A ${bodyRadius} ${bodyRadius} 0 0 1 ${fold} ${bodyRadius}`,
    `L ${fold} ${fold}`,
    `Z`,
  ].join(' ');
  const edge = `M 0 0 L ${fold - bodyRadius} 0 A ${bodyRadius} ${bodyRadius} 0 0 1 ${fold} ${bodyRadius} L ${fold} ${fold}`;
  const flap = roundedPolygon(
    [
      { x: 0, y: 0 },
      { x: fold, y: fold },
      { x: 0, y: fold },
    ],
    [seamRadius, seamRadius, tipRadius],
  );
  return { under, edge, flap };
}

function roundedPolygon(points: Point[], radii: number[]): string {
  const count = points.length;
  const corners = points.map((curr, index) => {
    const prev = points[(index - 1 + count) % count];
    const next = points[(index + 1) % count];
    return roundCorner(prev, curr, next, radii[index] ?? 0);
  });
  const start = corners[0];
  let path = `M ${num(start.p1.x)} ${num(start.p1.y)}`;
  for (let index = 0; index < count; index += 1) {
    const corner = corners[index];
    const next = corners[(index + 1) % count];
    path += ` A ${num(corner.radius)} ${num(corner.radius)} 0 0 ${corner.sweep} ${num(corner.p2.x)} ${num(corner.p2.y)}`;
    path += ` L ${num(next.p1.x)} ${num(next.p1.y)}`;
  }
  return path + ' Z';
}

function roundCorner(prev: Point, curr: Point, next: Point, radius: number) {
  const v1x = prev.x - curr.x;
  const v1y = prev.y - curr.y;
  const v2x = next.x - curr.x;
  const v2y = next.y - curr.y;
  const l1 = Math.hypot(v1x, v1y) || 1;
  const l2 = Math.hypot(v2x, v2y) || 1;
  const u1x = v1x / l1;
  const u1y = v1y / l1;
  const u2x = v2x / l2;
  const u2y = v2y / l2;
  const cos = Math.min(1, Math.max(-1, u1x * u2x + u1y * u2y));
  const angle = Math.acos(cos);
  const tan = Math.tan(angle / 2) || 1;
  const dist = Math.min(radius / tan, l1 / 2, l2 / 2);
  const used = dist * tan;
  const incomingX = -u1x;
  const incomingY = -u1y;
  const cross = incomingX * u2y - incomingY * u2x;
  return {
    p1: { x: curr.x + u1x * dist, y: curr.y + u1y * dist },
    p2: { x: curr.x + u2x * dist, y: curr.y + u2y * dist },
    radius: used,
    sweep: cross >= 0 ? 1 : 0,
  };
}

function num(value: number): string {
  return String(Math.round(value * 100) / 100);
}
