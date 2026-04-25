import React, { createContext, useContext, useEffect, useMemo } from "react";

export type ThemeColors = {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgDark: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textLight: string;
  border: string;
  borderDark: string;
  primary: string;
  primaryHover: string;
  success: string;
  successLight: string;
  warning: string;
  danger: string;
  infoBg: string;
  infoText: string;
  iconPrimary: string;
  iconSecondary: string;
  iconMuted: string;
  iconCoral: string;
  iconSuccess: string;
  iconDanger: string;
  heroGradientStart: string;
  heroGradientEnd: string;
  darkGradientStart: string;
  darkGradientEnd: string;
  accent: string;
  accentGreen: string;
  accentMint: string;
  accentLightGreen: string;
  coral: string;
  coralHover: string;
  coralLight: string;
  darkNavy: string;
  sidebarBorder: string;
  filterLabel: string;
  filterBg: string;
  filterBorder: string;
  scrollbarTrack: string;
  cardBg: string;
  cardBgSecondary: string;
  cardBgTertiary: string;
  cardBorder: string;
  cardBorderSecondary: string;
  eyebrow: string;
  heroText: string;
  heroBorder: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonBorder: string;
  filterActive: string;
  filterActiveText: string;
  seasonBg: string;
  seasonText: string;
  seasonBorder: string;
  seasonIcon: string;
  seasonButton: string;
  progressBg: string;
  progressFill: string;
  verifiedBg: string;
  verifiedText: string;
  mintBg: string;
  blueBg: string;
  pinkBg: string;
  creamBg: string;
  badgeBg: string;
  badgeText: string;
  footerBg: string;
  footerText: string;
  footerLink: string;
  mapBg: string;
  mapGradient1: string;
  mapGradient2: string;
  mapBorder: string;
  // New colors
  surface: string;
  onSurface: string;
  onPrimary: string;
  onSecondary: string;
  shadow: string;
};

export type Theme = {
  colors: ThemeColors;
};

const lightTheme: Theme = {
  colors: {
    // Primary colors
    bgPrimary: "#f8f9fb",
    bgSecondary: "#ffffff",
    bgTertiary: "#f3f4f6",
    bgDark: "#f8f9fb",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    textMuted: "#9ea5ad",
    textLight: "#1f2937",
    border: "#d1d5db",
    borderDark: "#e5e7eb",
    primary: "#ea580c",
    primaryHover: "#c2410c",
    success: "#2e7d32",
    successLight: "#34b879",
    warning: "#f59e0b",
    danger: "#dc2626",
    infoBg: "#ffedd5",
    infoText: "#9a3412",
    iconPrimary: "#1f2937",
    iconSecondary: "#6b7280",
    iconMuted: "#9ea5ad",
    iconCoral: "#ff6b35",
    iconSuccess: "#2e7d32",
    iconDanger: "#dc2626",
    
    // Gradient colors
    heroGradientStart: "#ea580c",
    heroGradientEnd: "#c2410c",
    darkGradientStart: "#f8f9fb",
    darkGradientEnd: "#ffffff",
    
    // Accent colors
    accent: "#ea580c",
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
    buttonBorder: "#ea580c",
    filterActive: "#ea580c",
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

    // New colors
    surface: "#ffffff",
    onSurface: "#1f2937",
    onPrimary: "#ffffff",
    onSecondary: "#1f2937",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
};

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
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
