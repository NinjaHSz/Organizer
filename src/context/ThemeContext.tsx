import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export const ACCENT_COLORS = [
  { name: 'Google Blue', value: '#4285F4' },
  { name: 'Coral Red', value: '#EA4335' },
  { name: 'Amber Yellow', value: '#FBBC05' },
  { name: 'Emerald Green', value: '#34A853' },
  { name: 'Vibrant Purple', value: '#8B5CF6' },
  { name: 'Rose Pink', value: '#EC4899' },
  { name: 'Cyan Teal', value: '#06B6D4' },
];

interface ThemeContextType {
  theme: ThemeMode;
  accentColor: string;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme') as ThemeMode) || 'dark';
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem('accent-color') || '#4285F4';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--action-primary', accentColor);
    localStorage.setItem('accent-color', accentColor);

    // Update <meta name="theme-color"> for mobile browser status bar and header tint
    const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]');
    if (metaThemeColors.length > 0) {
      metaThemeColors.forEach((meta) => meta.setAttribute('content', accentColor));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = accentColor;
      document.head.appendChild(meta);
    }

    // Update msapplication-navbutton-color & TileColor fallback
    let metaMsNav = document.querySelector('meta[name="msapplication-navbutton-color"]');
    if (!metaMsNav) {
      metaMsNav = document.createElement('meta');
      metaMsNav.setAttribute('name', 'msapplication-navbutton-color');
      document.head.appendChild(metaMsNav);
    }
    metaMsNav.setAttribute('content', accentColor);

    let metaTile = document.querySelector('meta[name="msapplication-TileColor"]');
    if (!metaTile) {
      metaTile = document.createElement('meta');
      metaTile.setAttribute('name', 'msapplication-TileColor');
      document.head.appendChild(metaTile);
    }
    metaTile.setAttribute('content', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentColor,
        toggleTheme,
        setTheme,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
