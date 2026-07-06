// EMBER design tokens — three palettes, per design/ember-mockups.html:
//   charred  — locked CLAUDE.md palette (default, dark warm)
//   daylight — parchment variant of the same system (light)
//   bluecoal — cool night variant, ember stays the only warm hue
//
// Player-tile gradients are deliberately constant across themes (player
// identity never shifts) — those literals live in HexBoard, not here.

export type ThemeName = 'charred' | 'daylight' | 'bluecoal';

export interface Palette {
  name: ThemeName;
  statusBar: 'light' | 'dark';
  charred: string; // page/screen ground
  surface: string;
  surface2: string;
  surface3: string;
  card: string;
  line: string;
  line2: string;
  ash: string;
  ashDeep: string;
  ashGlyph: string;
  ember: string;
  amber: string; // text-accent amber (darkened on light ground for contrast)
  coalLight: string;
  bone: string; // primary text
  dim: string;
  faint: string;
  mid: string;
  ink: string; // text on orange tiles — constant
  pendingStroke: string;
  emptyHex: string;
  emptyHexLine: string;
  overlay: string;
  verdictLine: string;
}

export const palettes: Record<ThemeName, Palette> = {
  charred: {
    name: 'charred',
    statusBar: 'light',
    charred: '#14100C',
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
    coalLight: '#8FC3D4',
    bone: '#E8DDCE',
    dim: '#9C9284',
    faint: '#6E6862',
    mid: '#C9BEAE',
    ink: '#1A0F05',
    pendingStroke: '#FFF3DC',
    emptyHex: '#1D1812',
    emptyHexLine: '#2E271F',
    overlay: 'rgba(11,9,6,0.82)',
    verdictLine: 'rgba(255,179,71,0.35)',
  },
  daylight: {
    name: 'daylight',
    statusBar: 'dark',
    charred: '#EFE6D4',
    surface: '#E4D8C2',
    surface2: '#F4EBDB',
    surface3: '#EAE0CB',
    card: '#F6EFDF',
    line: '#DCCEB4',
    line2: '#D3C4A8',
    ash: '#B5A78E',
    ashDeep: '#C9BCA6',
    ashGlyph: '#6E6250',
    ember: '#E85D1F',
    amber: '#B8720E',
    coalLight: '#2F6A82',
    bone: '#2A2118',
    dim: '#6B5F4E',
    faint: '#988A73',
    mid: '#4E4335',
    ink: '#1A0F05',
    pendingStroke: '#E85D1F',
    emptyHex: '#E4D8C2',
    emptyHexLine: '#D3C4A8',
    overlay: 'rgba(58,46,32,0.5)',
    verdictLine: 'rgba(184,114,14,0.45)',
  },
  bluecoal: {
    name: 'bluecoal',
    statusBar: 'light',
    charred: '#0C1218',
    surface: '#15202B',
    surface2: '#17222D',
    surface3: '#1D2A37',
    card: '#131D27',
    line: '#1E2C3A',
    line2: '#243545',
    ash: '#3D4A57',
    ashDeep: '#2E3944',
    ashGlyph: '#8494A1',
    ember: '#FF6B2C',
    amber: '#FFB347',
    coalLight: '#8FC3D4',
    bone: '#DCE6EC',
    dim: '#8A99A6',
    faint: '#5D6C79',
    mid: '#B7C4CE',
    ink: '#1A0F05',
    pendingStroke: '#FFF3DC',
    emptyHex: '#15202B',
    emptyHexLine: '#1E2C3A',
    overlay: 'rgba(6,10,14,0.82)',
    verdictLine: 'rgba(255,179,71,0.35)',
  },
};

export const THEME_ORDER: ThemeName[] = ['charred', 'daylight', 'bluecoal'];
