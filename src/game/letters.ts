// Letter bag: distribution and values tuned down from Scrabble's 100 tiles to
// a 60-tile bag suited to the smaller radius-3 board and 12-round match.

export interface RackTile {
  id: string;
  letter: string; // 'A'–'Z', or '★' for the wild tile
  value: number;
  wild: boolean;
}

const DISTRIBUTION: Array<[letter: string, count: number, value: number]> = [
  ['A', 4, 1], ['B', 1, 3], ['C', 2, 3], ['D', 2, 2], ['E', 6, 1],
  ['F', 1, 4], ['G', 2, 2], ['H', 2, 4], ['I', 4, 1], ['J', 1, 8],
  ['K', 1, 5], ['L', 3, 1], ['M', 2, 3], ['N', 3, 1], ['O', 3, 1],
  ['P', 2, 3], ['Q', 1, 10], ['R', 4, 1], ['S', 3, 1], ['T', 4, 1],
  ['U', 2, 1], ['V', 1, 4], ['W', 1, 4], ['X', 1, 8], ['Y', 1, 4],
  ['Z', 1, 10], ['★', 2, 0],
];

// Deterministic PRNG so a match can be replayed from its seed (mulberry32).
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildBag(seed: number): RackTile[] {
  const bag: RackTile[] = [];
  let n = 0;
  for (const [letter, count, value] of DISTRIBUTION)
    for (let i = 0; i < count; i++)
      bag.push({ id: `t${n++}`, letter, value, wild: letter === '★' });
  const random = rng(seed);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}
