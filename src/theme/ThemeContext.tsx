import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

import { Palette, palettes, THEME_ORDER, ThemeName } from './tokens';

interface ThemeValue {
  t: Palette;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Charred is the locked default; a light-mode device starts on Daylight.
  const [name, setName] = useState<ThemeName>(() =>
    Appearance.getColorScheme() === 'light' ? 'daylight' : 'charred',
  );

  const cycleTheme = useCallback(() => {
    setName((cur) => THEME_ORDER[(THEME_ORDER.indexOf(cur) + 1) % THEME_ORDER.length]);
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({ t: palettes[name], setTheme: setName, cycleTheme }),
    [name, cycleTheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
