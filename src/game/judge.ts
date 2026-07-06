// Plead-a-Word judge.
//
// PILOT: verdicts come from a local heuristic stub so the game is playable
// offline with zero setup. The real judge is a live Anthropic-API call, but it
// must live on a backend (an API key bundled into a mobile client is public) —
// the full-blown version will POST to a small server endpoint that calls the
// Messages API (model: claude-opus-4-8, structured JSON verdict schema) and
// returns this same Verdict shape. Set EXPO_PUBLIC_JUDGE_URL to use one.

export interface Verdict {
  accepted: boolean;
  reasoning: string;
  source: 'stub' | 'api';
}

const JUDGE_URL = process.env.EXPO_PUBLIC_JUDGE_URL;

export async function pleadWord(word: string, argument: string): Promise<Verdict> {
  if (JUDGE_URL) {
    try {
      const res = await fetch(JUDGE_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ word, argument }),
      });
      if (res.ok) {
        const v = (await res.json()) as { accepted: boolean; reasoning: string };
        return { accepted: v.accepted, reasoning: v.reasoning, source: 'api' };
      }
    } catch {
      // fall through to the stub — a plea should never hard-fail mid-match
    }
  }
  return stubVerdict(word, argument);
}

// Heuristic stand-in: rewards a real argument, rejects obvious junk.
// Deliberately lenient — the plea is a once-per-match moment of grace.
function stubVerdict(word: string, argument: string): Verdict {
  const w = word.trim().toLowerCase();
  const arg = argument.trim();
  if (!/^[a-z]{2,7}$/.test(w)) {
    return {
      accepted: false,
      reasoning: 'The word must be 2–7 plain letters. The plea is denied.',
      source: 'stub',
    };
  }
  if (arg.length < 12 || arg.split(/\s+/).length < 3) {
    return {
      accepted: false,
      reasoning: 'One real sentence, counsel. State what the word means and who uses it.',
      source: 'stub',
    };
  }
  if (!/[aeiouy]/.test(w)) {
    return {
      accepted: false,
      reasoning: 'No vowel, no mercy — that is a letter pile, not a word.',
      source: 'stub',
    };
  }
  return {
    accepted: true,
    reasoning: `A spirited defense. "${word.toUpperCase()}" stands — for this match only. (Pilot stub judge; the live AI judge arrives with the backend.)`,
    source: 'stub',
  };
}
