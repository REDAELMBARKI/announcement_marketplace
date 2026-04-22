import React, { createContext, useContext, useEffect, useMemo } from "react";

const lightTheme = {
  colors: {
    // Primary colors
    bgPrimary: "#f8f9fb",
    bgSecondary: "#ffffff",
    bgDark: "#f8f9fb",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    textMuted: "#9ea5ad",
    textLight: "#1f2937",
    border: "#d1d5db",
    borderDark: "#e5e7eb",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    success: "#2e7d32",
    successLight: "#34b879",
    warning: "#f59e0b",
    danger: "#dc2626",
    infoBg: "#e8f1ff",
    infoText: "#1e40af",
    
    // Gradient colors
    heroGradientStart: "#2563eb",
    heroGradientEnd: "#1d4ed8",
    darkGradientStart: "#f8f9fb",
    darkGradientEnd: "#ffffff",
    
    // Accent colors
    accent: "#2563eb",
    accentGreen: "#2e7d32",
    accentMint: "#34b879",
    accentLightGreen: "#5ddca0",
    coral: "#ff6b35",
    coralHover: "#e85d25",
    coralLight: "#fff3ee",
    darkNavy: "#1a1a2e",
    sidebarBorder: "#e8e8e8",
    filterLabel: "#6b7280",
    filterBg: "#fafafa",
    filterBorder: "#eeeeee",
    scrollbarTrack: "#f0f0f0",
    
    // Card colors
    cardBg: "#ffffff",
    cardBgSecondary: "#f8f9fb",
    cardBgTertiary: "#f3f4f6",
    cardBorder: "#e5e7eb",
    cardBorderSecondary: "#d1d5db",
    
    // UI specific colors
    eyebrow: "#6b7280",
    heroText: "#1f2937",
    heroBorder: "rgba(209, 213, 219, 0.22)",
    buttonPrimary: "#1f2937",
    buttonSecondary: "#ffffff",
    buttonBorder: "#2563eb",
    filterActive: "#2563eb",
    filterActiveText: "#ffffff",
    seasonBg: "#fef3c7",
    seasonText: "#92400e",
    seasonBorder: "#f59e0b",
    seasonIcon: "#fbbf24",
    seasonButton: "#92400e",
    progressBg: "#e5e7eb",
    progressFill: "#2e7d32",
    verifiedBg: "#dcfce7",
    verifiedText: "#166534",
    
    // Product card colors
    mintBg: "#dcfce7",
    blueBg: "#dbeafe",
    pinkBg: "#fce7f3",
    creamBg: "#fef3c7",
    badgeBg: "#ffffff",
    badgeText: "#1f2937",
    
    // Footer colors
    footerBg: "#1f2937",
    footerText: "#ffffff",
    footerLink: "#93c5fd",
    
    // Map colors
    mapBg: "#f8f9fb",
    mapGradient1: "#e0e7ff",
    mapGradient2: "#dbeafe",
    mapBorder: "#93c5fd",
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
