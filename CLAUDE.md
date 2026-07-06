# EMBER — Project Handoff Brief

> Drop this file (as `CLAUDE.md`) plus `ember-design-mockup.jsx` into your project folder,
> open Claude Code there, and it will have full context of the concept.

## What this is
A mobile word game concept — "Scrabble, but the board burns." Designed in a Claude.ai
session on 2026-07-06. Status: concept + visual mockup only. Nothing built yet.

## Core mechanics (locked in design)
1. **Hex board** (radius-3 to start) — words read along three axes, not two.
2. **Burn cycle** — every placed tile lives 3 rounds (shown as pips), then collapses to ash.
   The board continuously reshapes; prevents defensive camping.
3. **Ash cells** — burned-out hexes become wildcards (✦). Dead words create new openings.
4. **Forge hex (×3)** — bonus multiplier that migrates each round toward the coldest
   (least active) region of the board, pulling play around.
5. **Plead a Word** — once per match, a rejected slang/regional word can be argued in one
   sentence to an AI judge (Anthropic API, live inference) which rules on validity.
   This is the AI-native differentiator.
6. **Simultaneous 60s rounds** — both players place at once; no async waiting.

## Planned differentiators / roadmap ideas
- Bilingual Arabic–English mode (GCC market angle) — candidate brand: **Harf** (حرف).
- Monetization: cosmetics only (flame trails, tile skins, season pass). No pay-to-win.

## Naming
Working title: EMBER. Shortlist after collision discussion:
- **Emberword** (recommended for global launch — searchable, trademark-able)
- **Ashword** (darker; ash is the most unique mechanic)
- **Harf** (if bilingual identity leads)
Avoid: plain "Ember" (Ember.js + existing store apps), anything with "Kindle".

## Design system (from mockup)
- Palette: charred `#14100C`, surface `#1D1812`/`#221C15`, ember `#FF6B2C`,
  amber `#FFB347`, coal-blue (opponent) `#5E93A6`, ash `#4A443D`, bone text `#E8DDCE`.
- Type: Bricolage Grotesque (display/tiles), Space Grotesk (UI).
- Player tiles: orange gradient; opponent: coal-blue gradient; burn pips bottom of tile;
  point value top-right corner.
- Reference implementation of the board render (SVG pointy-top hexes, axial coords)
  is in `ember-design-mockup.jsx` — static mockup, not playable.

## Suggested first prompts for Claude Code
- "Scaffold a React Native (Expo) project for EMBER using the design tokens in CLAUDE.md;
  port the hex board from ember-design-mockup.jsx into a reusable component."
- "Implement the burn-cycle game state machine (XState) per the mechanics above, with tests."
- "Build the Plead-a-Word flow calling the Anthropic API with a strict JSON verdict schema."

## Owner context
Fahad — Principal Solutions Architect, Dubai. Strong in .NET/Azure/TypeScript,
hands-on with Anthropic SDK (see his `recon-agent` project for agent patterns).
Prefers concise output and full execution over clarifying questions.
