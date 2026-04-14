import React, { createContext, useContext, useEffect, useMemo } from "react";

const lightTheme = {
  colors: {
    bgPrimary: "#f8f9fb",
    bgSecondary: "#ffffff",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    border: "#d1d5db",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    success: "#2e7d32",
    warning: "#f59e0b",
    danger: "#dc2626",
    infoBg: "#e8f1ff",
    infoText: "#1e40af",
  },
};

const ThemeContext = createContext(lightTheme);

export function ThemeProvider({ children }) {
  const theme = useMemo(() => lightTheme, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([token, value]) => {
      root.style.setProperty(`--${token}`, value);
    });
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
