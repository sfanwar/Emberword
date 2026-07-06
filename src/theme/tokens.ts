// EMBER design tokens — Charred palette, locked in CLAUDE.md.
// Daylight and Bluecoal variants (see design/ember-mockups.html) can be added
// as sibling objects when theming ships; components read from `theme` only.

export const theme = {
  charred: '#14100C',
  pit: '#0B0906',
  screenTop: '#191410',
  surface: '#1D1812',
  surface2: '#221C15',
  surface3: '#2B241C',
  card: '#1B1611',
  line: '#2A231B',
  line2: '#322A20',
  ash: '#4A443D',
  ashDeep: '#3A342D',
  ashGlyph: '#8B8378',
  ember: '#FF6B2C',
  amber: '#FFB347',
  coal: '#5E93A6',
  coalLight: '#8FC3D4',
  bone: '#E8DDCE',
  dim: '#9C9284',
  faint: '#6E6862',
  mid: '#C9BEAE',
  ink: '#1A0F05',
  tileStroke: '#FFD9A0',
  pendingStroke: '#FFF3DC',
  emptyHex: '#1D1812',
  emptyHexLine: '#2E271F',
} as const;

export const fonts = {
  // System fallbacks for the pilot; Bricolage Grotesque / Space Grotesk load
  // via expo-font in the full build.
  display: undefined as string | undefined,
  ui: undefined as string | undefined,
};
