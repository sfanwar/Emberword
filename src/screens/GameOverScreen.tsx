import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameState } from '../game/engine';
import { useTheme } from '../theme/ThemeContext';
import { Palette } from '../theme/tokens';

interface Props {
  state: GameState;
  onNextLevel: () => void;
  onRetry: () => void;
}

export function GameOverScreen({ state, onNextLevel, onRetry }: Props) {
  const { t } = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { stats, won, config } = state;
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>LEVEL {state.levelIndex + 1}</Text>
      <Text style={[styles.title, !won && styles.titleFailed]}>
        {won ? 'LEVEL FORGED' : 'THE FIRE DIES'}
      </Text>
      <Text style={styles.score}>{state.score}</Text>
      <Text style={styles.scoreLbl}>
        {won ? `TARGET ${config.targetScore} — CLEARED` : `OF ${config.targetScore} NEEDED`}
      </Text>

      <View style={styles.stats}>
        <StatRow styles={styles} label="Best word" value={stats.bestWord ? `${stats.bestWord.word} +${stats.bestWord.points}` : '—'} />
        <StatRow styles={styles} label="Tiles burned to ash" value={String(stats.tilesBurned)} />
        <StatRow styles={styles} label="Forge hexes claimed" value={String(stats.forgeClaims)} />
        <StatRow styles={styles} label="Pleas won" value={`${stats.pleasWon} / ${config.pleas}`} />
      </View>

      {won ? (
        <Pressable style={styles.forgeBtn} onPress={onNextLevel}>
          <Text style={styles.forgeBtnText}>LEVEL {state.levelIndex + 2} ▸</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.forgeBtn} onPress={onRetry}>
          <Text style={styles.forgeBtnText}>RETRY LEVEL {state.levelIndex + 1} ▸</Text>
        </Pressable>
      )}
    </View>
  );
}

function StatRow({
  styles, label, value,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.charred,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    eyebrow: { fontSize: 10, letterSpacing: 3, color: t.faint },
    title: { fontSize: 30, fontWeight: '800', letterSpacing: 2.5, color: t.ember, marginVertical: 8 },
    titleFailed: { color: t.coalLight },
    score: { fontSize: 56, fontWeight: '800', color: t.amber, lineHeight: 60 },
    scoreLbl: { fontSize: 10, letterSpacing: 3, color: t.dim, marginBottom: 26 },
    stats: {
      width: '100%',
      maxWidth: 280,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 26,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: t.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.line,
    },
    statLabel: { fontSize: 12, color: t.dim },
    statValue: { fontSize: 12, color: t.bone, fontVariant: ['tabular-nums'] },
    forgeBtn: {
      width: '100%',
      maxWidth: 280,
      backgroundColor: t.ember,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    forgeBtnText: { color: t.ink, fontWeight: '800', fontSize: 14, letterSpacing: 1.5 },
  });
