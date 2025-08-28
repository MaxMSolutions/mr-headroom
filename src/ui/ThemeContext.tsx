import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available themes
export type ThemeName = 'neonCrt' | 'amber' | 'matrix' | 'sunset';

// Define theme properties
interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  crtEffect: boolean;
  toggleCrtEffect: () => void;
  accessibilityMode: boolean;
  toggleAccessibilityMode: () => void;
}

const defaultThemeContext: ThemeContextType = {
  currentTheme: 'neonCrt',
  setTheme: () => {},
  crtEffect: true,
  toggleCrtEffect: () => {},
  accessibilityMode: false,
  toggleAccessibilityMode: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('neonCrt');
  const [crtEffect, setCrtEffect] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  // Function to change theme
  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
    localStorage.setItem('mrheadroom-theme', theme);
  };

  // Toggle CRT effect
  const toggleCrtEffect = () => {
    const newValue = !crtEffect;
    setCrtEffect(newValue);
    localStorage.setItem('mrheadroom-crt-effect', JSON.stringify(newValue));
  };

  // Toggle accessibility mode
  const toggleAccessibilityMode = () => {
    const newValue = !accessibilityMode;
    setAccessibilityMode(newValue);
    localStorage.setItem('mrheadroom-accessibility', JSON.stringify(newValue));
    
    // Automatically disable CRT effect in accessibility mode
    if (newValue && crtEffect) {
      setCrtEffect(false);
      localStorage.setItem('mrheadroom-crt-effect', JSON.stringify(false));
    }
  };

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Set theme specific variables
    if (currentTheme === 'neonCrt') {
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-secondary', '#0a0a0a');
      root.style.setProperty('--text-primary', '#33ff33');
      root.style.setProperty('--text-secondary', '#00cc00');
      root.style.setProperty('--accent-primary', '#ff00ff');
      root.style.setProperty('--accent-secondary', '#00ffff');
    } else if (currentTheme === 'amber') {
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-secondary', '#1a1000');
      root.style.setProperty('--text-primary', '#ffb000');
      root.style.setProperty('--text-secondary', '#cc8800');
      root.style.setProperty('--accent-primary', '#ff6600');
      root.style.setProperty('--accent-secondary', '#ffcc00');
    } else if (currentTheme === 'matrix') {
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-secondary', '#001a00');
      root.style.setProperty('--text-primary', '#00ff00');
      root.style.setProperty('--text-secondary', '#008800');
      root.style.setProperty('--accent-primary', '#88ff88');
      root.style.setProperty('--accent-secondary', '#00aa00');
    }
    
    // Add/remove CRT effect class
    if (crtEffect && !accessibilityMode) {
      document.body.classList.add('crt-effect');
    } else {
      document.body.classList.remove('crt-effect');
    }
    
    // Add/remove accessibility class
    if (accessibilityMode) {
      document.body.classList.add('accessibility-mode');
    } else {
      document.body.classList.remove('accessibility-mode');
    }
  }, [currentTheme, crtEffect, accessibilityMode]);

  // Load preferences from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('mrheadroom-theme') as ThemeName;
    const savedCrtEffect = localStorage.getItem('mrheadroom-crt-effect');
    const savedAccessibility = localStorage.getItem('mrheadroom-accessibility');
    
    if (savedTheme) setCurrentTheme(savedTheme);
    if (savedCrtEffect) setCrtEffect(JSON.parse(savedCrtEffect));
    if (savedAccessibility) setAccessibilityMode(JSON.parse(savedAccessibility));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        crtEffect,
        toggleCrtEffect,
        accessibilityMode,
        toggleAccessibilityMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for using theme context
export const useTheme = () => useContext(ThemeContext);
