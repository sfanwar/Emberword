// Interactive hex board, ported from ember-design-mockup.jsx.
// Renders committed tiles (with burn pips), ash wildcards, the forge hex,
// staged pending tiles, and empty cells; taps flow up via callbacks.
//
// Player-tile colors are constant across themes on purpose — player identity
// (orange gradient, ink glyphs) never shifts when the theme does.

import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Polygon, Stop, Text as SvgText } from 'react-native-svg';

import { axialToPixel, cellsInRadius, hexPoints, keyOf } from '../game/hex';
import { BOARD_RADIUS, GameState } from '../game/engine';
import { useTheme } from '../theme/ThemeContext';

const TILE_GRADIENT = ['#FF6B2C', '#FFB347'] as const;
const PENDING_GRADIENT = ['#FFB347', '#FFD98F'] as const;
const TILE_STROKE = '#FFD9A0';
const TILE_INK = '#1A0F05';
const TILE_INK_SOFT = 'rgba(26,15,5,0.7)';
const PIP_OFF = 'rgba(26,15,5,0.25)';

interface Props {
  state: GameState;
  onCellPress: (key: string) => void;
}

export function HexBoard({ state, onCellPress }: Props) {
  const { t } = useTheme();
  return (
    <Svg viewBox="-160 -132 320 268" width="100%" height="100%">
      <Defs>
        <LinearGradient id="tile-p" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={TILE_GRADIENT[0]} />
          <Stop offset="1" stopColor={TILE_GRADIENT[1]} />
        </LinearGradient>
        <LinearGradient id="tile-pending" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={PENDING_GRADIENT[0]} />
          <Stop offset="1" stopColor={PENDING_GRADIENT[1]} />
        </LinearGradient>
      </Defs>
      {cellsInRadius(BOARD_RADIUS).map(({ q, r }) => {
        const key = keyOf(q, r);
        const { x, y } = axialToPixel(q, r);
        const cell = state.board.get(key);
        const pending = state.pending.get(key);

        if (pending) {
          return (
            <G key={key} onPress={() => onCellPress(key)}>
              <Polygon
                points={hexPoints(x, y)}
                fill="url(#tile-pending)"
                stroke={t.pendingStroke}
                strokeWidth={2}
                strokeDasharray="4 2"
              />
              <SvgText x={x} y={y + 6} textAnchor="middle" fontSize={17} fontWeight="800" fill={TILE_INK}>
                {pending.letter}
              </SvgText>
              <SvgText x={x + 12} y={y - 6} textAnchor="middle" fontSize={7} fontWeight="700" fill={TILE_INK_SOFT}>
                {pending.value || ''}
              </SvgText>
            </G>
          );
        }

        if (cell?.kind === 'tile') {
          const { tile } = cell;
          return (
            <G key={key}>
              <Polygon
                points={hexPoints(x, y)}
                fill="url(#tile-p)"
                stroke={TILE_STROKE}
                strokeWidth={1.4}
              />
              <SvgText x={x} y={y + 6} textAnchor="middle" fontSize={17} fontWeight="800" fill={TILE_INK}>
                {tile.letter}
              </SvgText>
              <SvgText x={x + 12} y={y - 6} textAnchor="middle" fontSize={7} fontWeight="700" fill={TILE_INK_SOFT}>
                {tile.value || ''}
              </SvgText>
              {Array.from({ length: state.config.burnLifetime }, (_, i) => {
                const n = state.config.burnLifetime;
                const gap = n > 3 ? 6 : 8;
                return (
                  <Circle
                    key={i}
                    cx={x - ((n - 1) * gap) / 2 + i * gap}
                    cy={y + 13}
                    r={n > 3 ? 1.9 : 2.2}
                    fill={i < tile.burn ? TILE_INK : PIP_OFF}
                  />
                );
              })}
            </G>
          );
        }

        if (cell?.kind === 'ash') {
          return (
            <G key={key}>
              <Polygon points={hexPoints(x, y)} fill={t.ashDeep} stroke={t.ash} strokeWidth={1} />
              <SvgText x={x} y={y + 4} textAnchor="middle" fontSize={12} fill={t.ashGlyph}>
                ✦
              </SvgText>
            </G>
          );
        }

        if (state.forge === key) {
          return (
            <G key={key} onPress={() => onCellPress(key)}>
              <Polygon
                points={hexPoints(x, y)}
                fill={t.surface2}
                stroke={t.ember}
                strokeWidth={1.6}
                strokeDasharray="3 2"
              />
              <SvgText x={x} y={y + 3} textAnchor="middle" fontSize={7} fontWeight="700" fill={t.ember}>
                ×3
              </SvgText>
            </G>
          );
        }

        return (
          <Polygon
            key={key}
            points={hexPoints(x, y)}
            fill={t.emptyHex}
            stroke={t.emptyHexLine}
            strokeWidth={1}
            onPress={() => onCellPress(key)}
          />
        );
      })}
    </Svg>
  );
}
