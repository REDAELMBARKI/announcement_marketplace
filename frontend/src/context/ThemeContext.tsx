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
    bgPrimary: "#F5EFE8",
    bgSecondary: "#FDFAF7",
    bgTertiary: "#EDE5DB",
    bgDark: "#F5EFE8",
    textPrimary: "#2E2018",
    textSecondary: "#7A6558",
    textMuted: "#BEB0A5",
    textLight: "#2E2018",
    border: "#D5C9BE",
    borderDark: "#C4B5A8",
    primary: "#C45E7A",
    primaryHover: "#A84B65",
    success: "#3F6B50",
    successLight: "#5C8C6B",
    warning: "#D8986B",
    danger: "#C94040",
    infoBg: "#F4DAE2",
    infoText: "#7A2E44",
    iconPrimary: "#2E2018",
    iconSecondary: "#7A6558",
    iconMuted: "#BEB0A5",
    iconCoral: "#C45E7A",
    iconSuccess: "#3F6B50",
    iconDanger: "#C94040",

    heroGradientStart: "#C45E7A",
    heroGradientEnd: "#7A2E44",
    darkGradientStart: "#F5EFE8",
    darkGradientEnd: "#FDFAF7",

    accent: "#C45E7A",
    accentGreen: "#3F6B50",
    accentMint: "#5C8C6B",
    accentLightGreen: "#8BB89A",
    coral: "#5580A8",
    coralHover: "#A84B65",
    coralLight: "#F4DAE2",
    darkNavy: "#3D2B24",
    sidebarBorder: "#D5C9BE",
    filterLabel: "#7A6558",
    filterBg: "#FDFAF7",
    filterBorder: "#EDE5DB",
    scrollbarTrack: "#EDE5DB",

    cardBg: "#FFFFFF",
    cardBgSecondary: "#FDFAF7",
    cardBgTertiary: "#F5EFE8",
    cardBorder: "#D5C9BE",
    cardBorderSecondary: "#C4B5A8",

    eyebrow: "#7A6558",
    heroText: "#2E2018",
    heroBorder: "rgba(196, 94, 122, 0.18)",
    buttonPrimary: "#2E2018",
    buttonSecondary: "#FFFFFF",
    buttonBorder: "#C45E7A",
    filterActive: "#C45E7A",
    filterActiveText: "#FFFFFF",
    seasonBg: "#F5E4D3",
    seasonText: "#8A5230",
    seasonBorder: "#D8986B",
    seasonIcon: "#D8986B",
    seasonButton: "#8A5230",
    progressBg: "#EDE5DB",
    progressFill: "#3F6B50",
    verifiedBg: "#E8F3EC",
    verifiedText: "#2A4F38",

    mintBg: "#C8DFD0",
    blueBg: "#C8DAEA",
    pinkBg: "#F4DAE2",
    creamBg: "#F5E4D3",
    badgeBg: "#FFFFFF",
    badgeText: "#2E2018",

    footerBg: "#2B1F1A",
    footerText: "#F5EFE8",
    footerLink: "#C8A89B",

    mapBg: "#F5EFE8",
    mapGradient1: "#F4DAE2",
    mapGradient2: "#C8DAEA",
    mapBorder: "#C8A89B",

    surface: "#FFFFFF",
    onSurface: "#2E2018",
    onPrimary: "#FFFFFF",
    onSecondary: "#2E2018",
    shadow: "rgba(46, 32, 24, 0.1)",
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
