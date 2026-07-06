// Axial hex-grid math (pointy-top), shared by the engine and the board renderer.
// Pure module — no React Native imports, so it runs under node:test.

export interface Axial {
  q: number;
  r: number;
}

export type CellKey = string; // "q,r"

export const keyOf = (q: number, r: number): CellKey => `${q},${r}`;

export const parseKey = (key: CellKey): Axial => {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
};

// The three word axes of a pointy-top hex board: E–W, SE–NW, NE–SW.
export const AXES: readonly Axial[] = [
  { q: 1, r: 0 },
  { q: 0, r: 1 },
  { q: 1, r: -1 },
];

export const inBounds = (q: number, r: number, radius: number): boolean =>
  Math.abs(q) <= radius && Math.abs(r) <= radius && Math.abs(q + r) <= radius;

export function cellsInRadius(radius: number): Axial[] {
  const cells: Axial[] = [];
  for (let q = -radius; q <= radius; q++)
    for (let r = -radius; r <= radius; r++)
      if (Math.abs(q + r) <= radius) cells.push({ q, r });
  return cells;
}

export const hexDistance = (a: Axial, b: Axial): number => {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
};

export const neighbors = (c: Axial): Axial[] =>
  [
    { q: 1, r: 0 },
    { q: -1, r: 0 },
    { q: 0, r: 1 },
    { q: 0, r: -1 },
    { q: 1, r: -1 },
    { q: -1, r: 1 },
  ].map((d) => ({ q: c.q + d.q, r: c.r + d.r }));

/**
 * Walk from `start` in both directions along `axis`, collecting the maximal
 * contiguous run of occupied cells. `isOccupied` decides occupancy.
 * Returns keys ordered from the negative end to the positive end.
 */
export function lineThrough(
  start: Axial,
  axis: Axial,
  radius: number,
  isOccupied: (key: CellKey) => boolean,
): CellKey[] {
  let head = { ...start };
  while (true) {
    const prev = { q: head.q - axis.q, r: head.r - axis.r };
    if (!inBounds(prev.q, prev.r, radius) || !isOccupied(keyOf(prev.q, prev.r))) break;
    head = prev;
  }
  const line: CellKey[] = [];
  let cur = head;
  while (inBounds(cur.q, cur.r, radius) && isOccupied(keyOf(cur.q, cur.r))) {
    line.push(keyOf(cur.q, cur.r));
    cur = { q: cur.q + axis.q, r: cur.r + axis.r };
  }
  return line;
}

// Pixel positioning for rendering (pointy-top, matches ember-design-mockup.jsx).
export const HEX_SIZE = 24;
export const HEX_W = Math.sqrt(3) * HEX_SIZE;

export const axialToPixel = (q: number, r: number) => ({
  x: HEX_W * (q + r / 2),
  y: 1.5 * HEX_SIZE * r,
});

export function hexPoints(cx: number, cy: number, size = HEX_SIZE): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${(cx + size * Math.cos(a)).toFixed(1)},${(cy + size * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}
