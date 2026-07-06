// Dictionary lookup over the bundled ENABLE list (2–7 letter words), with
// wildcard support: '?' in a pattern matches any letter (ash cells and ★ tiles).

import { WORD_LIST } from './words';

let words: Set<string> | null = null;

function dict(): Set<string> {
  if (!words) words = new Set(WORD_LIST.split(' '));
  return words;
}

export const isWord = (w: string): boolean => dict().has(w.toLowerCase());

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

/**
 * True if `pattern` (lowercase, '?' = wildcard) matches any dictionary word,
 * or any word in `extra` (session words accepted by the plead judge).
 * Wildcard fan-out is bounded: patterns are at most 7 chars on a radius-3
 * board and rarely contain more than two '?'.
 */
export function matchesWord(pattern: string, extra?: ReadonlySet<string>): boolean {
  const p = pattern.toLowerCase();
  const qm = p.indexOf('?');
  if (qm === -1) return dict().has(p) || (extra?.has(p) ?? false);
  for (const c of LETTERS) {
    if (matchesWord(p.slice(0, qm) + c + p.slice(qm + 1), extra)) return true;
  }
  return false;
}
