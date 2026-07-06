import { test } from 'node:test';
import assert from 'node:assert/strict';

import { AXES, cellsInRadius, hexDistance, keyOf, lineThrough } from '../hex';
import { buildBag, RackTile } from '../letters';
import { matchesWord } from '../dictionary';
import {
  BOARD_RADIUS, BURN_LIFETIME, GameState, MAX_ROUNDS, applyPleaVerdict, newGame,
  skipRound, stage, submit, unstage,
} from '../engine';

// ─── hex math ───

test('radius-3 board has 37 cells', () => {
  assert.equal(cellsInRadius(3).length, 37);
});

test('hex distance is symmetric and correct on an axis', () => {
  assert.equal(hexDistance({ q: -3, r: 0 }, { q: 3, r: 0 }), 6);
  assert.equal(hexDistance({ q: 0, r: 0 }, { q: 1, r: -1 }), 1);
});

test('lineThrough collects a contiguous run and stops at gaps', () => {
  const occ = new Set(['0,0', '1,0', '2,0', '-2,0']); // gap at -1,0
  const line = lineThrough({ q: 1, r: 0 }, AXES[0], 3, (k) => occ.has(k));
  assert.deepEqual(line, ['0,0', '1,0', '2,0']);
});

// ─── bag & dictionary ───

test('bag is deterministic per seed and has 60 tiles', () => {
  const a = buildBag(42);
  const b = buildBag(42);
  assert.equal(a.length, 60);
  assert.deepEqual(a.map((t) => t.letter), b.map((t) => t.letter));
});

test('dictionary matches plain words and wildcards', () => {
  assert.ok(matchesWord('ember'));
  assert.ok(matchesWord('e?ber')); // ash cell as M
  assert.ok(!matchesWord('zzzzq'));
  assert.ok(matchesWord('yalla', new Set(['yalla']))); // plead-accepted word
});

// ─── engine helpers ───

/** Force known tiles into the rack so tests are deterministic. */
function withRack(s: GameState, letters: string): GameState {
  const rack: RackTile[] = [...letters].map((l, i) => ({
    id: `fixed${i}`,
    letter: l,
    value: 1,
    wild: l === '★',
  }));
  return { ...s, rack };
}

function place(s: GameState, spec: Array<[rackIndex: number, key: string]>): GameState {
  let cur = s;
  for (const [i, key] of spec) cur = stage(cur, `fixed${i}`, key);
  return cur;
}

// ─── placement & validation ───

test('first word must cover the center hex', () => {
  const s = place(withRack(newGame(1), 'EMBER'), [
    [0, '0,-2'], [1, '1,-2'], [2, '2,-2'],
  ]);
  const res = submit(s);
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.reason, 'first-move-center');
});

test('a valid first word scores and commits with full burn', () => {
  // ASH along the E–W axis through center
  const s = place(withRack(newGame(1), 'ASH'), [
    [0, '-1,0'], [1, '0,0'], [2, '1,0'],
  ]);
  const res = submit(s);
  assert.ok(res.ok);
  if (res.ok) {
    assert.equal(res.words[0].word, 'ASH');
    assert.equal(res.words[0].points, 3);
    assert.equal(res.state.score, 3);
    assert.equal(res.state.round, 2);
    // burn ticks at round end: fresh tiles show lifetime-1 on the next round
    const cell = res.state.board.get('0,0');
    assert.ok(cell && cell.kind === 'tile' && cell.tile.burn === BURN_LIFETIME - 1);
  }
});

test('non-collinear placements are rejected', () => {
  const s = place(withRack(newGame(1), 'AB'), [
    [0, '0,0'], [1, '1,-1'],
  ]);
  // 0,0 and 1,-1 ARE collinear on the NE axis — use a genuinely bent pair
  const bent = place(withRack(newGame(1), 'ABC'), [
    [0, '0,0'], [1, '1,0'], [2, '0,1'],
  ]);
  const res = submit(bent);
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.reason, 'not-a-line');
  void s;
});

test('gapped placements are rejected', () => {
  const s = place(withRack(newGame(1), 'AB'), [
    [0, '0,0'], [1, '2,0'],
  ]);
  const res = submit(s);
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.reason, 'gap');
});

test('nonsense words are rejected with the offending word listed', () => {
  const s = place(withRack(newGame(1), 'ZQJXK'), [
    [0, '-1,0'], [1, '0,0'], [2, '1,0'],
  ]);
  const res = submit(s);
  assert.equal(res.ok, false);
  if (!res.ok && res.reason === 'invalid-word') {
    assert.deepEqual(res.invalidWords, ['ZQJ']);
  } else {
    assert.fail('expected invalid-word');
  }
});

test('second word must connect to the board', () => {
  const first = place(withRack(newGame(1), 'ASH'), [
    [0, '-1,0'], [1, '0,0'], [2, '1,0'],
  ]);
  const r1 = submit(first);
  assert.ok(r1.ok);
  if (!r1.ok) return;
  const far = place(withRack(r1.state, 'AT'), [
    [0, '-3,3'], [1, '-2,3'],
  ]);
  const res = submit(far);
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.reason, 'disconnected');
});

test('unstage returns the tile to the rack', () => {
  let s = withRack(newGame(1), 'A');
  s = stage(s, 'fixed0', '0,0');
  assert.equal(s.rack.length, 0);
  assert.equal(s.pending.size, 1);
  s = unstage(s, '0,0');
  assert.equal(s.rack.length, 1);
  assert.equal(s.pending.size, 0);
});

// ─── burn cycle & ash ───

test('tiles collapse to ash after their burn lifetime', () => {
  const first = place(withRack(newGame(1), 'ASH'), [
    [0, '-1,0'], [1, '0,0'], [2, '1,0'],
  ]);
  const r1 = submit(first);
  assert.ok(r1.ok);
  if (!r1.ok) return;
  let s = r1.state; // burn now 2
  s = skipRound(s); // burn 1
  s = skipRound(s); // burn 0 → ash
  const cell = s.board.get('0,0');
  assert.ok(cell && cell.kind === 'ash');
  assert.equal(s.stats.tilesBurned, 3);
});

test('ash cells act as wildcards in new words', () => {
  const first = place(withRack(newGame(1), 'ASH'), [
    [0, '-1,0'], [1, '0,0'], [2, '1,0'],
  ]);
  const r1 = submit(first);
  assert.ok(r1.ok);
  if (!r1.ok) return;
  let s = skipRound(skipRound(r1.state)); // all three are ash now
  // Place B,E adjacent so the line reads B E ? ? ? along E–W: 'be???'
  // matches e.g. 'beano'? Use a tighter word: place 'T' at -2,0 → T ? ? ?
  // Simplest deterministic case: place A at 2,0 → line '???a' must match
  // some word (ash wildcards) — e.g. 'idea'. Just assert submit succeeds.
  s = withRack(s, 'A');
  s = stage(s, 'fixed0', '2,0');
  const res = submit(s);
  assert.ok(res.ok, `expected ash-wildcard word to validate, got ${JSON.stringify(res)}`);
});

// ─── forge ───

test('forge migrates to an empty cell away from live tiles', () => {
  const first = place(withRack(newGame(1), 'ASH'), [
    [0, '-1,0'], [1, '0,0'], [2, '1,0'],
  ]);
  const r1 = submit(first);
  assert.ok(r1.ok);
  if (!r1.ok) return;
  const forge = r1.state.forge;
  assert.ok(forge);
  assert.ok(!r1.state.board.has(forge!));
  // coldest cells from a word on the E–W center line are the far north/south rim
  const { q, r } = { q: Number(forge!.split(',')[0]), r: Number(forge!.split(',')[1]) };
  assert.ok(Math.abs(r) >= 2, `forge should flee the hot center row, got ${q},${r}`);
});

test('forge tile triples the word it joins', () => {
  const g = newGame(1);
  // Move forge onto the center row for the test
  const s0: GameState = { ...g, forge: keyOf(0, 0) };
  const s = place(withRack(s0, 'ASH'), [
    [0, '-1,0'], [1, '0,0'], [2, '1,0'],
  ]);
  const res = submit(s);
  assert.ok(res.ok);
  if (res.ok) {
    assert.equal(res.words[0].points, 9); // 3 × 3
    assert.deepEqual(res.words[0].multipliers, ['forge ×3']);
    assert.equal(res.state.stats.forgeClaims, 1);
  }
});

// ─── plead ───

test('plead-accepted words validate on resubmit and consume the plea', () => {
  const s0 = withRack(newGame(1), 'ZQJXK');
  const s = place(s0, [[0, '-1,0'], [1, '0,0'], [2, '1,0']]);
  const rejected = submit(s);
  assert.equal(rejected.ok, false);
  const pled = applyPleaVerdict(s, 'zqj', true);
  assert.equal(pled.pleasLeft, 0);
  const res = submit(pled);
  assert.ok(res.ok, 'plead-accepted word should now validate');
  assert.equal(pled.stats.pleasWon, 1);
});

// ─── game over ───

test('the match ends after MAX_ROUNDS', () => {
  let s = newGame(7);
  for (let i = 0; i < MAX_ROUNDS; i++) s = skipRound(s);
  assert.ok(s.over);
});

test('board never exceeds bounds via stage', () => {
  const s = withRack(newGame(1), 'A');
  assert.equal(stage(s, 'fixed0', keyOf(4, 0)), s); // out of bounds → unchanged
  assert.equal(BOARD_RADIUS, 3);
});
