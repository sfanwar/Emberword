// Plead-a-Word: once per match, argue a rejected word before the judge.

import React, { useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { pleadWord, Verdict } from '../game/judge';
import { theme } from '../theme/tokens';

interface Props {
  word: string; // the rejected word being argued
  visible: boolean;
  onResolved: (verdict: Verdict) => void;
  onDismiss: () => void;
}

export function PleadModal({ word, visible, onResolved, onDismiss }: Props) {
  const [argument, setArgument] = useState('');
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const submitPlea = async () => {
    setBusy(true);
    const v = await pleadWord(word, argument);
    setBusy(false);
    setVerdict(v);
  };

  const close = () => {
    const v = verdict;
    setArgument('');
    setVerdict(null);
    if (v) onResolved(v);
    else onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.eyebrow}>⚖ PLEAD A WORD · 1 PER MATCH</Text>
          <View style={styles.wordRow}>
            {[...word.toUpperCase()].map((l, i) => (
              <View key={i} style={styles.ptile}>
                <Text style={styles.ptileLetter}>{l}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.rejected}>NOT IN DICTIONARY — STATE YOUR CASE</Text>

          {!verdict ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="One sentence: what it means, who uses it…"
                placeholderTextColor={theme.faint}
                value={argument}
                onChangeText={setArgument}
                multiline
                editable={!busy}
              />
              <View style={styles.row}>
                <Pressable style={styles.ghostBtn} onPress={close} disabled={busy}>
                  <Text style={styles.ghostBtnText}>WITHDRAW</Text>
                </Pressable>
                <Pressable
                  style={[styles.forgeBtn, busy && styles.btnBusy]}
                  onPress={submitPlea}
                  disabled={busy || argument.trim().length === 0}
                >
                  {busy ? (
                    <ActivityIndicator color={theme.ink} />
                  ) : (
                    <Text style={styles.forgeBtnText}>PLEAD ▸</Text>
                  )}
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.verdictBox}>
                <Text style={styles.verdictLabel}>
                  {verdict.source === 'api' ? 'AI JUDGE · LIVE RULING' : 'PILOT JUDGE · STUB RULING'}
                </Text>
                <Text style={[styles.verdictWord, !verdict.accepted && styles.verdictRejected]}>
                  {verdict.accepted ? 'ACCEPTED' : 'REJECTED'}
                </Text>
                <Text style={styles.verdictWhy}>{verdict.reasoning}</Text>
              </View>
              <Pressable style={styles.forgeBtn} onPress={close}>
                <Text style={styles.forgeBtnText}>RETURN TO BOARD ▸</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11,9,6,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.line2,
    borderRadius: 18,
    padding: 18,
  },
  eyebrow: { fontSize: 10, letterSpacing: 2.5, color: theme.ember, textAlign: 'center' },
  wordRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginVertical: 14 },
  ptile: {
    width: 30,
    height: 34,
    borderRadius: 7,
    backgroundColor: theme.ember,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ptileLetter: { fontSize: 15, fontWeight: '800', color: theme.ink },
  rejected: { textAlign: 'center', fontSize: 10, letterSpacing: 1.5, color: theme.faint, marginBottom: 14 },
  input: {
    minHeight: 64,
    color: theme.mid,
    backgroundColor: theme.charred,
    borderWidth: 1,
    borderColor: theme.line2,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 14 },
  ghostBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.ash,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostBtnText: { color: theme.mid, fontSize: 12, letterSpacing: 1 },
  forgeBtn: {
    flex: 1,
    backgroundColor: theme.ember,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 0,
  },
  btnBusy: { opacity: 0.7 },
  forgeBtnText: { color: theme.ink, fontWeight: '800', fontSize: 13, letterSpacing: 1.5 },
  verdictBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,179,71,0.35)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  verdictLabel: { fontSize: 9, letterSpacing: 2.5, color: theme.dim },
  verdictWord: { fontSize: 23, fontWeight: '800', letterSpacing: 2, color: theme.amber, marginVertical: 6 },
  verdictRejected: { color: theme.coalLight },
  verdictWhy: { fontSize: 12, color: theme.dim, textAlign: 'center', lineHeight: 18 },
});
