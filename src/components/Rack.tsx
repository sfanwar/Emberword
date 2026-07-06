import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RackTile } from '../game/letters';
import { theme } from '../theme/tokens';

interface Props {
  tiles: RackTile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function Rack({ tiles, selectedId, onSelect }: Props) {
  return (
    <View style={styles.rack}>
      {tiles.map((t) => {
        const selected = t.id === selectedId;
        return (
          <Pressable
            key={t.id}
            onPress={() => onSelect(t.id)}
            style={[styles.tile, selected && styles.tileSelected]}
            accessibilityRole="button"
            accessibilityLabel={`Rack tile ${t.letter}${selected ? ', selected' : ''}`}
          >
            <Text style={[styles.letter, selected && styles.letterSelected]}>{t.letter}</Text>
            {t.value > 0 && <Text style={styles.value}>{t.value}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rack: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  tile: {
    width: 40,
    height: 46,
    borderRadius: 8,
    backgroundColor: theme.surface3,
    borderWidth: 1,
    borderColor: '#3B3226',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSelected: { backgroundColor: theme.ember, borderColor: theme.amber },
  letter: { fontSize: 18, fontWeight: '800', color: theme.bone },
  letterSelected: { color: theme.ink },
  value: { position: 'absolute', top: 3, right: 5, fontSize: 9, color: theme.ashGlyph },
});
