import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameState } from '../game/engine';
import { theme } from '../theme/tokens';

interface Props {
  state: GameState;
  onRematch: () => void;
}

export function GameOverScreen({ state, onRematch }: Props) {
  const { stats } = state;
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>FINAL</Text>
      <Text style={styles.title}>MATCH FORGED</Text>
      <Text style={styles.score}>{state.score}</Text>
      <Text style={styles.scoreLbl}>POINTS</Text>

      <View style={styles.stats}>
        <StatRow label="Best word" value={stats.bestWord ? `${stats.bestWord.word} +${stats.bestWord.points}` : '—'} />
        <StatRow label="Tiles burned to ash" value={String(stats.tilesBurned)} />
        <StatRow label="Forge hexes claimed" value={String(stats.forgeClaims)} />
        <StatRow label="Pleas won" value={`${stats.pleasWon} / 1`} />
      </View>

      <Pressable style={styles.forgeBtn} onPress={onRematch}>
        <Text style={styles.forgeBtnText}>REMATCH ▸</Text>
      </Pressable>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.charred,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: { fontSize: 10, letterSpacing: 3, color: theme.faint },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: 2.5, color: theme.ember, marginVertical: 8 },
  score: { fontSize: 56, fontWeight: '800', color: theme.amber, lineHeight: 60 },
  scoreLbl: { fontSize: 10, letterSpacing: 3, color: theme.dim, marginBottom: 26 },
  stats: {
    width: '100%',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 26,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  statLabel: { fontSize: 12, color: theme.dim },
  statValue: { fontSize: 12, color: theme.bone, fontVariant: ['tabular-nums'] },
  forgeBtn: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: theme.ember,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  forgeBtnText: { color: theme.ink, fontWeight: '800', fontSize: 14, letterSpacing: 1.5 },
});
