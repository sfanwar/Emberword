// Interactive hex board, ported from ember-design-mockup.jsx.
// Renders committed tiles (with burn pips), ash wildcards, the forge hex,
// staged pending tiles, and empty cells; taps flow up via callbacks.

import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Polygon, Stop, Text as SvgText } from 'react-native-svg';

import { axialToPixel, cellsInRadius, hexPoints, keyOf } from '../game/hex';
import { BOARD_RADIUS, BURN_LIFETIME, GameState } from '../game/engine';
import { theme } from '../theme/tokens';

interface Props {
  state: GameState;
  onCellPress: (key: string) => void;
}

export function HexBoard({ state, onCellPress }: Props) {
  return (
    <Svg viewBox="-160 -132 320 268" width="100%" height="100%">
      <Defs>
        <LinearGradient id="tile-p" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={theme.ember} />
          <Stop offset="1" stopColor={theme.amber} />
        </LinearGradient>
        <LinearGradient id="tile-pending" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={theme.amber} />
          <Stop offset="1" stopColor="#FFD98F" />
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
                stroke={theme.pendingStroke}
                strokeWidth={2}
                strokeDasharray="4 2"
              />
              <SvgText x={x} y={y + 6} textAnchor="middle" fontSize={17} fontWeight="800" fill={theme.ink}>
                {pending.letter}
              </SvgText>
              <SvgText x={x + 12} y={y - 6} textAnchor="middle" fontSize={7} fontWeight="700" fill="rgba(26,15,5,0.7)">
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
                stroke={theme.tileStroke}
                strokeWidth={1.4}
              />
              <SvgText x={x} y={y + 6} textAnchor="middle" fontSize={17} fontWeight="800" fill={theme.ink}>
                {tile.letter}
              </SvgText>
              <SvgText x={x + 12} y={y - 6} textAnchor="middle" fontSize={7} fontWeight="700" fill="rgba(26,15,5,0.7)">
                {tile.value || ''}
              </SvgText>
              {Array.from({ length: BURN_LIFETIME }, (_, i) => (
                <Circle
                  key={i}
                  cx={x - 8 + i * 8}
                  cy={y + 13}
                  r={2.2}
                  fill={i < tile.burn ? theme.ink : 'rgba(26,15,5,0.25)'}
                />
              ))}
            </G>
          );
        }

        if (cell?.kind === 'ash') {
          return (
            <G key={key}>
              <Polygon points={hexPoints(x, y)} fill={theme.ashDeep} stroke={theme.ash} strokeWidth={1} />
              <SvgText x={x} y={y + 4} textAnchor="middle" fontSize={12} fill={theme.ashGlyph}>
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
                fill={theme.surface2}
                stroke={theme.ember}
                strokeWidth={1.6}
                strokeDasharray="3 2"
              />
              <SvgText x={x} y={y + 3} textAnchor="middle" fontSize={7} fontWeight="700" fill={theme.ember}>
                ×3
              </SvgText>
            </G>
          );
        }

        return (
          <Polygon
            key={key}
            points={hexPoints(x, y)}
            fill={theme.emptyHex}
            stroke={theme.emptyHexLine}
            strokeWidth={1}
            onPress={() => onCellPress(key)}
          />
        );
      })}
    </Svg>
  );
}
