// EMBER pilot — solo score attack. Place a word each 60s round; tiles burn,
// ash opens wildcards, the forge migrates. 12 rounds; beat your best score.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HexBoard } from '../components/HexBoard';
import { PleadModal } from '../components/PleadModal';
import { Rack } from '../components/Rack';
import {
  GameState, applyPleaVerdict, newGame, recallAll, skipRound, stage,
  submit, unstage,
} from '../game/engine';
import { Verdict } from '../game/judge';
import { useTheme } from '../theme/ThemeContext';
import { Palette } from '../theme/tokens';
import { GameOverScreen } from './GameOverScreen';

export function GameScreen() {
  const { t, cycleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [state, setState] = useState<GameState>(() => newGame(Date.now() & 0xffffffff));
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string>(
    `Level 1 — score ${state.config.targetScore} to clear. First word covers the center hex`,
  );
  const [secondsLeft, setSecondsLeft] = useState(state.config.roundSeconds);
  const [pleading, setPleading] = useState<string | null>(null);
  const roundRef = useRef(state.round);

  // Round timer: reset when the round advances, skip the round at zero.
  useEffect(() => {
    if (state.round !== roundRef.current) {
      roundRef.current = state.round;
      setSecondsLeft(state.config.roundSeconds);
    }
  }, [state.round, state.config.roundSeconds]);

  useEffect(() => {
    if (state.over || pleading) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [state.over, pleading]);

  useEffect(() => {
    if (secondsLeft <= 0 && !state.over) {
      setState((s) => skipRound(s));
      setToast('Out of time — the board burns on');
    }
  }, [secondsLeft, state.over]);

  const onCellPress = useCallback(
    (key: string) => {
      setState((s) => {
        if (s.pending.has(key)) return unstage(s, key);
        if (selected) {
          const next = stage(s, selected, key);
          if (next !== s) setSelected(null);
          return next;
        }
        return s;
      });
    },
    [selected],
  );

  const onForge = () => {
    const res = submit(state);
    if (res.ok) {
      setState(res.state);
      const line = res.words
        .map((w) => `${w.word} +${w.points}${w.multipliers.length ? ' · ' + w.multipliers.join(' · ') : ''}`)
        .join('   ');
      setToast(`${line ? line + ' forged' : 'Forged'}`);
      return;
    }
    switch (res.reason) {
      case 'no-tiles':
        setToast('Place tiles first, then forge');
        break;
      case 'not-a-line':
        setToast('Tiles must sit on one line along a single axis');
        break;
      case 'gap':
        setToast('No gaps — the word must be contiguous');
        break;
      case 'first-move-center':
        setToast('Your first word must cover the center hex');
        break;
      case 'disconnected':
        setToast('New words must touch the board');
        break;
      case 'too-short':
        setToast('Words need at least two letters');
        break;
      case 'invalid-word': {
        const word = res.invalidWords[0];
        if (state.pleasLeft > 0 && !word.includes('?')) {
          setPleading(word);
        } else {
          setToast(`${res.invalidWords.join(', ')} — not in the dictionary`);
        }
        break;
      }
    }
  };

  const onPleaResolved = (verdict: Verdict) => {
    const word = pleading!;
    setPleading(null);
    setState((s) => {
      const pled = applyPleaVerdict(s, word, verdict.accepted);
      if (!verdict.accepted) return pled;
      const res = submit(pled);
      if (res.ok) {
        setToast(`${word} stands — plea won`);
        return res.state;
      }
      setToast(res.reason === 'invalid-word' ? `${res.invalidWords.join(', ')} still invalid` : 'Still invalid');
      return pled;
    });
    if (!verdict.accepted) setToast('The judge is unmoved — plea spent');
  };

  const startLevel = (levelIndex: number) => {
    const fresh = newGame(Date.now() & 0xffffffff, levelIndex);
    roundRef.current = fresh.round;
    setState(fresh);
    setSelected(null);
    setSecondsLeft(fresh.config.roundSeconds);
    setToast(
      `Level ${levelIndex + 1} — score ${fresh.config.targetScore} to clear. First word covers the center hex`,
    );
  };

  if (state.over) {
    return (
      <GameOverScreen
        state={state}
        onNextLevel={() => startLevel(state.levelIndex + 1)}
        onRetry={() => startLevel(state.levelIndex)}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topbar}>
        <View>
          <Text style={styles.pname}>SCORE</Text>
          <Text style={styles.pscore}>{state.score}</Text>
          <Text style={styles.target}>TARGET {state.config.targetScore}</Text>
        </View>
        <View style={styles.timer}>
          <View style={[styles.timerRing, secondsLeft <= 10 && styles.timerUrgent]}>
            <Text style={styles.timerNum}>
              {Math.floor(Math.max(0, secondsLeft) / 60)}:
              {String(Math.max(0, secondsLeft) % 60).padStart(2, '0')}
            </Text>
          </View>
          <Text style={styles.roundLbl}>
            LVL {state.levelIndex + 1} · ROUND {state.round} / {state.config.maxRounds}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.pname}>BAG</Text>
          <Text style={[styles.pscore, { color: t.coalLight }]}>{state.bag.length}</Text>
        </View>
      </View>

      <View style={styles.toast}>
        <Text style={styles.toastText} numberOfLines={2}>
          {toast}
        </Text>
      </View>

      <View style={styles.board}>
        <HexBoard state={state} onCellPress={onCellPress} />
      </View>

      <Rack tiles={state.rack} selectedId={selected} onSelect={(id) => setSelected((cur) => (cur === id ? null : id))} />

      <View style={styles.actions}>
        <Pressable
          style={styles.ghostBtn}
          onPress={() => {
            setState((s) => recallAll(s));
            setSelected(null);
          }}
        >
          <Text style={styles.ghostBtnText}>RECALL</Text>
        </Pressable>
        <Pressable style={styles.forgeBtn} onPress={onForge}>
          <Text style={styles.forgeBtnText}>FORGE ▸</Text>
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Text style={styles.pleaNote}>⚖ Plead a word: {state.pleasLeft} remaining</Text>
        <Pressable
          style={styles.themeChip}
          onPress={cycleTheme}
          accessibilityRole="button"
          accessibilityLabel={`Theme: ${t.name} — tap to switch`}
        >
          <View style={[styles.themeDot, { backgroundColor: t.ember }]} />
          <Text style={styles.themeChipText}>{t.name.toUpperCase()}</Text>
        </Pressable>
      </View>

      <PleadModal
        word={pleading ?? ''}
        visible={pleading !== null}
        onResolved={onPleaResolved}
        onDismiss={() => setPleading(null)}
      />
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.charred, paddingHorizontal: 14, paddingTop: 8 },
    topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pname: { fontSize: 11, color: t.dim, letterSpacing: 1.5 },
    pscore: { fontSize: 22, fontWeight: '800', color: t.amber },
    target: { fontSize: 9, letterSpacing: 1, color: t.faint, marginTop: 1 },
    timer: { alignItems: 'center' },
    timerRing: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: t.ember,
      borderTopColor: t.ashDeep,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerUrgent: { borderColor: '#FF3B30', borderTopColor: '#FF3B30' },
    timerNum: { fontSize: 13, fontWeight: '700', color: t.bone },
    roundLbl: { fontSize: 9, letterSpacing: 2, color: t.faint, marginTop: 4 },
    toast: {
      alignSelf: 'center',
      backgroundColor: t.surface2,
      borderWidth: 1,
      borderColor: t.line2,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 5,
      marginTop: 10,
      maxWidth: '95%',
    },
    toastText: { fontSize: 12, color: t.mid, textAlign: 'center' },
    board: { flex: 1, marginVertical: 6 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    ghostBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: t.ash,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    ghostBtnText: { color: t.mid, fontSize: 12, letterSpacing: 1 },
    forgeBtn: {
      flex: 2,
      backgroundColor: t.ember,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    forgeBtnText: { color: t.ink, fontWeight: '800', fontSize: 14, letterSpacing: 1.5 },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 8,
    },
    pleaNote: { fontSize: 10, color: t.faint },
    themeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: t.line2,
      backgroundColor: t.surface2,
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    themeDot: { width: 8, height: 8, borderRadius: 4 },
    themeChipText: { fontSize: 9, letterSpacing: 1.5, color: t.dim },
  });
