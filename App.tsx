import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';

import { GameScreen } from './src/screens/GameScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function Root() {
  const { t } = useTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.charred }]}>
      <StatusBar style={t.statusBar} />
      <GameScreen />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
