import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RackTile } from '../game/letters';
import { useTheme } from '../theme/ThemeContext';
import { Palette } from '../theme/tokens';

interface Props {
  tiles: RackTile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function Rack({ tiles, selectedId, onSelect }: Props) {
  const { t } = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  return (
    <View style={styles.rack}>
      {tiles.map((tile) => {
        const selected = tile.id === selectedId;
        return (
          <Pressable
            key={tile.id}
            onPress={() => onSelect(tile.id)}
            style={[styles.tile, selected && styles.tileSelected]}
            accessibilityRole="button"
            accessibilityLabel={`Rack tile ${tile.letter}${selected ? ', selected' : ''}`}
          >
            <Text style={[styles.letter, selected && styles.letterSelected]}>{tile.letter}</Text>
            {tile.value > 0 && <Text style={styles.value}>{tile.value}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    rack: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
    tile: {
      width: 40,
      height: 46,
      borderRadius: 8,
      backgroundColor: t.surface3,
      borderWidth: 1,
      borderColor: t.line2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileSelected: { backgroundColor: t.ember, borderColor: t.amber },
    letter: { fontSize: 18, fontWeight: '800', color: t.bone },
    letterSelected: { color: t.ink },
    value: { position: 'absolute', top: 3, right: 5, fontSize: 9, color: t.ashGlyph },
  });
