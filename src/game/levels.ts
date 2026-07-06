// Level ladder for the solo pilot. Level 1 is forgiving; each cleared level
// tightens time, burn, and target. Past the table, targets keep climbing on
// the hardest config so the run is endless.

export interface LevelConfig {
  roundSeconds: number;
  burnLifetime: number; // rounds a tile lives before collapsing to ash
  maxRounds: number;
  targetScore: number; // reach this to clear the level
  pleas: number;
}

const LEVELS: LevelConfig[] = [
  { roundSeconds: 90, burnLifetime: 5, maxRounds: 10, targetScore: 25, pleas: 2 },
  { roundSeconds: 80, burnLifetime: 4, maxRounds: 10, targetScore: 40, pleas: 2 },
  { roundSeconds: 70, burnLifetime: 4, maxRounds: 11, targetScore: 60, pleas: 1 },
  { roundSeconds: 60, burnLifetime: 3, maxRounds: 12, targetScore: 85, pleas: 1 },
  { roundSeconds: 50, burnLifetime: 3, maxRounds: 12, targetScore: 110, pleas: 1 },
  { roundSeconds: 45, burnLifetime: 2, maxRounds: 12, targetScore: 140, pleas: 1 },
];

export function levelConfig(levelIndex: number): LevelConfig {
  if (levelIndex < LEVELS.length) return LEVELS[levelIndex];
  // Endless tail: hardest config, target keeps climbing.
  const last = LEVELS[LEVELS.length - 1];
  const beyond = levelIndex - LEVELS.length + 1;
  return { ...last, targetScore: last.targetScore + beyond * 40 };
}
