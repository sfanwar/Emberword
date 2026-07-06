// EMBER pilot game engine — solo score-attack loop with a level ladder.
// Pure module (no React Native imports) so it runs under node:test.
//
// Pilot rules, per CLAUDE.md mechanics:
//  * radius-3 board; words read along the three hex axes
//  * every tile lives `config.burnLifetime` rounds (pips), then collapses to ash
//  * ash cells are wildcards: they join words as any letter, worth 0 points
//  * the ×3 forge hex migrates each round toward the coldest region
//  * pilot scoring: sum of letter values per formed word; ×3 if the word
//    crosses the forge on a freshly placed tile; ×2 "hex-line" for length ≥5
//  * reach the level's target score before rounds run out to clear the level;
//    each level is harder (see levels.ts)

import {
  Axial, AXES, CellKey, cellsInRadius, hexDistance, keyOf, lineThrough, neighbors, parseKey,
} from './hex';
import { buildBag, RackTile } from './letters';
import { matchesWord } from './dictionary';
import { LevelConfig, levelConfig } from './levels';

export const BOARD_RADIUS = 3;
export const RACK_SIZE = 7;

export interface PlacedTile {
  letter: string;
  value: number;
  burn: number; // pips remaining; fresh = config.burnLifetime
  wild: boolean;
}

export type Cell = { kind: 'tile'; tile: PlacedTile } | { kind: 'ash' };

export interface WordScore {
  word: string; // as displayed; wild → ★, ash → ✦
  points: number;
  multipliers: string[]; // e.g. ['forge ×3', 'hex-line ×2']
}

export interface Stats {
  bestWord: { word: string; points: number } | null;
  tilesBurned: number;
  forgeClaims: number;
  pleasWon: number;
}

export interface GameState {
  seed: number;
  levelIndex: number; // 0-based; shown to the player as level 1+
  config: LevelConfig;
  round: number;
  board: Map<CellKey, Cell>;
  forge: CellKey | null;
  rack: RackTile[];
  bag: RackTile[];
  pending: Map<CellKey, RackTile>; // staged this round, not yet forged
  score: number;
  pleasLeft: number;
  acceptedWords: Set<string>; // plead-approved words, valid for this match
  stats: Stats;
  over: boolean;
  won: boolean; // over && won → level cleared; over && !won → level failed
  lastResult: WordScore[] | null;
}

export type SubmitResult =
  | { ok: true; state: GameState; words: WordScore[] }
  | { ok: false; reason: 'no-tiles' | 'not-a-line' | 'gap' | 'first-move-center' | 'disconnected' | 'too-short' }
  | { ok: false; reason: 'invalid-word'; invalidWords: string[] };

export function newGame(seed: number, levelIndex = 0): GameState {
  const bag = buildBag(seed);
  const config = levelConfig(levelIndex);
  return {
    seed,
    levelIndex,
    config,
    round: 1,
    board: new Map(),
    forge: keyOf(0, 2), // starting forge, south of center as in the mockup
    rack: bag.slice(0, RACK_SIZE),
    bag: bag.slice(RACK_SIZE),
    pending: new Map(),
    score: 0,
    pleasLeft: config.pleas,
    acceptedWords: new Set(),
    stats: { bestWord: null, tilesBurned: 0, forgeClaims: 0, pleasWon: 0 },
    over: false,
    won: false,
    lastResult: null,
  };
}

const clone = (s: GameState): GameState => ({
  ...s,
  board: new Map(s.board),
  rack: [...s.rack],
  bag: [...s.bag],
  pending: new Map(s.pending),
  acceptedWords: new Set(s.acceptedWords),
  stats: { ...s.stats },
});

export function canPlaceAt(s: GameState, key: CellKey): boolean {
  const { q, r } = parseKey(key);
  if (Math.abs(q) > BOARD_RADIUS || Math.abs(r) > BOARD_RADIUS || Math.abs(q + r) > BOARD_RADIUS)
    return false;
  return !s.board.has(key) && !s.pending.has(key);
}

/** Stage a rack tile onto an empty cell. */
export function stage(s: GameState, rackTileId: string, key: CellKey): GameState {
  if (!canPlaceAt(s, key)) return s;
  const idx = s.rack.findIndex((t) => t.id === rackTileId);
  if (idx === -1) return s;
  const next = clone(s);
  const [tile] = next.rack.splice(idx, 1);
  next.pending.set(key, tile);
  return next;
}

/** Return a staged tile to the rack. */
export function unstage(s: GameState, key: CellKey): GameState {
  const tile = s.pending.get(key);
  if (!tile) return s;
  const next = clone(s);
  next.pending.delete(key);
  next.rack.push(tile);
  return next;
}

export function recallAll(s: GameState): GameState {
  const next = clone(s);
  for (const tile of next.pending.values()) next.rack.push(tile);
  next.pending.clear();
  return next;
}

// A cell participates in words if it holds a tile, ash, or a pending tile.
const occupied = (s: GameState) => (key: CellKey) =>
  s.board.has(key) || s.pending.has(key);

/** The letter a cell contributes to a word pattern ('?' for wildcards). */
function letterAt(s: GameState, key: CellKey): string {
  const pend = s.pending.get(key);
  if (pend) return pend.wild ? '?' : pend.letter.toLowerCase();
  const cell = s.board.get(key);
  if (!cell) return '?';
  if (cell.kind === 'ash') return '?';
  return cell.tile.wild ? '?' : cell.tile.letter.toLowerCase();
}

/** The letter shown to the player (wild → ★, ash → ✦). */
function displayLetterAt(s: GameState, key: CellKey): string {
  const pend = s.pending.get(key);
  if (pend) return pend.wild ? '★' : pend.letter.toUpperCase();
  const cell = s.board.get(key);
  if (!cell) return '✦';
  if (cell.kind === 'ash') return '✦';
  return cell.tile.wild ? '★' : cell.tile.letter.toUpperCase();
}

function valueAt(s: GameState, key: CellKey): number {
  const pend = s.pending.get(key);
  if (pend) return pend.value;
  const cell = s.board.get(key);
  return cell && cell.kind === 'tile' ? cell.tile.value : 0;
}

/** All maximal lines (length ≥2) through the pending tiles, deduped. */
function formedWords(s: GameState): CellKey[][] {
  const seen = new Set<string>();
  const lines: CellKey[][] = [];
  for (const key of s.pending.keys()) {
    const start = parseKey(key);
    for (const axis of AXES) {
      const line = lineThrough(start, axis, BOARD_RADIUS, occupied(s));
      if (line.length < 2) continue;
      const id = `${line[0]}|${axis.q},${axis.r}`;
      if (seen.has(id)) continue;
      seen.add(id);
      lines.push(line);
    }
  }
  return lines;
}

export function submit(s: GameState): SubmitResult {
  if (s.pending.size === 0) return { ok: false, reason: 'no-tiles' };

  const cells = [...s.pending.keys()].map(parseKey);

  // All pending tiles must lie on a single line along one axis…
  let lineAxis: Axial | null = null;
  if (cells.length === 1) {
    lineAxis = AXES[0];
  } else {
    for (const axis of AXES) {
      // cross(axis, delta) === 0 for every pair → collinear along axis
      const colinear = cells.every(
        (c) => (c.q - cells[0].q) * axis.r === (c.r - cells[0].r) * axis.q,
      );
      if (colinear) {
        lineAxis = axis;
        break;
      }
    }
    if (!lineAxis) return { ok: false, reason: 'not-a-line' };
    // …with no gaps: the maximal line through the first pending cell must
    // contain every pending cell.
    const span = lineThrough(cells[0], lineAxis, BOARD_RADIUS, occupied(s));
    for (const c of cells) if (!span.includes(keyOf(c.q, c.r))) return { ok: false, reason: 'gap' };
  }

  // First word must cover the center hex; later words must touch the board.
  if (s.board.size === 0) {
    if (!s.pending.has(keyOf(0, 0))) return { ok: false, reason: 'first-move-center' };
  } else {
    const touches = cells.some((c) =>
      neighbors(c).some((n) => s.board.has(keyOf(n.q, n.r))),
    );
    if (!touches) return { ok: false, reason: 'disconnected' };
  }

  const lines = formedWords(s);
  if (lines.length === 0) return { ok: false, reason: 'too-short' };

  // Validate every formed word (ash + wilds are '?' wildcards).
  const invalid: string[] = [];
  for (const line of lines) {
    const pattern = line.map((k) => letterAt(s, k)).join('');
    if (!matchesWord(pattern, s.acceptedWords)) invalid.push(pattern.toUpperCase());
  }
  if (invalid.length > 0) return { ok: false, reason: 'invalid-word', invalidWords: invalid };

  // Score.
  const words: WordScore[] = lines.map((line) => {
    let pts = line.reduce((sum, k) => sum + valueAt(s, k), 0);
    const multipliers: string[] = [];
    if (s.forge && s.pending.has(s.forge) && line.includes(s.forge)) {
      pts *= 3;
      multipliers.push('forge ×3');
    }
    if (line.length >= 5) {
      pts *= 2;
      multipliers.push('hex-line ×2');
    }
    return { word: line.map((k) => displayLetterAt(s, k)).join(''), points: pts, multipliers };
  });
  const gained = words.reduce((a, w) => a + w.points, 0);

  // Commit: pending → board, then advance the round.
  let next = clone(s);
  const claimedForge = next.forge !== null && next.pending.has(next.forge);
  for (const [key, tile] of next.pending) {
    next.board.set(key, {
      kind: 'tile',
      tile: { letter: tile.letter, value: tile.value, burn: next.config.burnLifetime, wild: tile.wild },
    });
  }
  next.pending.clear();
  next.score += gained;
  if (claimedForge) next.stats.forgeClaims += 1;
  const best = words.reduce((a, b) => (b.points > a.points ? b : a));
  if (!next.stats.bestWord || best.points > next.stats.bestWord.points)
    next.stats.bestWord = { word: best.word, points: best.points };
  next.lastResult = words;

  // Level cleared the moment the target falls.
  if (next.score >= next.config.targetScore) {
    next.won = true;
    next.over = true;
    return { ok: true, state: next, words };
  }

  next = endRound(next);
  return { ok: true, state: next, words };
}

/** Advance the round without a submission (timer expiry / pass). */
export function skipRound(s: GameState): GameState {
  return endRound(recallAll(s));
}

function endRound(s: GameState): GameState {
  const next = clone(s);

  // Burn tick: every tile loses a pip; 0 → collapse to ash.
  for (const [key, cell] of next.board) {
    if (cell.kind !== 'tile') continue;
    const burn = cell.tile.burn - 1;
    if (burn <= 0) {
      next.board.set(key, { kind: 'ash' });
      next.stats.tilesBurned += 1;
    } else {
      next.board.set(key, { kind: 'tile', tile: { ...cell.tile, burn } });
    }
  }

  // Forge migrates toward the coldest region: the empty cell that maximizes
  // distance to the nearest tile (deterministic tie-break: farthest from
  // center, then key order). With an empty board it heads for the rim.
  next.forge = migrateForge(next);

  // Refill the rack.
  while (next.rack.length < RACK_SIZE && next.bag.length > 0) {
    next.rack.push(next.bag.shift()!);
  }

  next.round += 1;
  if (next.round > next.config.maxRounds || (next.rack.length === 0 && next.bag.length === 0)) {
    next.over = true; // won stays false → level failed
  }
  return next;
}

function migrateForge(s: GameState): CellKey | null {
  const tiles: Axial[] = [];
  for (const [key, cell] of s.board) if (cell.kind === 'tile') tiles.push(parseKey(key));

  let bestKey: CellKey | null = null;
  let bestHeat = -Infinity;
  let bestRim = -Infinity;
  for (const c of cellsInRadius(BOARD_RADIUS)) {
    const key = keyOf(c.q, c.r);
    if (s.board.has(key)) continue;
    const cold = tiles.length === 0
      ? hexDistance(c, { q: 0, r: 0 })
      : Math.min(...tiles.map((t) => hexDistance(c, t)));
    const rim = hexDistance(c, { q: 0, r: 0 });
    if (cold > bestHeat || (cold === bestHeat && rim > bestRim)) {
      bestHeat = cold;
      bestRim = rim;
      bestKey = key;
    }
  }
  return bestKey;
}

/** Record a plead verdict. Accepted words become valid for this match. */
export function applyPleaVerdict(s: GameState, word: string, accepted: boolean): GameState {
  const next = clone(s);
  next.pleasLeft = Math.max(0, next.pleasLeft - 1);
  if (accepted) {
    next.acceptedWords.add(word.toLowerCase());
    next.stats.pleasWon += 1;
  }
  return next;
}
