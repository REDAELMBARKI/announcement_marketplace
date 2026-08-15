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
  primaryContrast: string;
  success: string;
  successHover: string;
  successContrast: string;
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
  coralContrast: string;
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
  buttonPrimaryHover: string;
  buttonPrimaryContrast: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  buttonSecondaryContrast: string;
  buttonBorder: string;
  focusRing: string;
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
  surface: string;
  onSurface: string;
  onPrimary: string;
  onSecondary: string;
  shadow: string;
  shadowSoft: string;
  // Card hover pastel palette (per project conventions)
  cardPastelPeach: string;
  cardPastelMint: string;
  cardPastelBlue: string;
  cardPastelCream: string;
  // Content image fallback
  imageFallback1: string;
  imageFallback2: string;
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

    // Primary = sage green from volunteer shirts
    primary: "#5F7A5C",
    primaryHover: "#4A6048",
    primaryContrast: "#FFFFFF",

    // Success = darker forest green
    success: "#3F6B50",
    successHover: "#2F5340",
    successContrast: "#FFFFFF",
    successLight: "#8BB89A",

    warning: "#D8986B",
    danger: "#C94040",
    infoBg: "#E8F3EC",
    infoText: "#2A4F38",

    iconPrimary: "#2E2018",
    iconSecondary: "#7A6558",
    iconMuted: "#BEB0A5",
    iconCoral: "#5F7A5C",
    iconSuccess: "#3F6B50",
    iconDanger: "#C94040",

    heroGradientStart: "#5F7A5C",
    heroGradientEnd: "#3F6B50",
    darkGradientStart: "#F5EFE8",
    darkGradientEnd: "#FDFAF7",

    accent: "#5F7A5C",
    accentGreen: "#3F6B50",
    accentMint: "#5C8C6B",
    accentLightGreen: "#8BB89A",

    // Coral now matches the sage green theme
    coral: "#5F7A5C",
    coralHover: "#4A6048",
    coralContrast: "#FFFFFF",
    coralLight: "#E8F3EC",

    darkNavy: "#2B1F1A",
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
    heroBorder: "rgba(95, 122, 92, 0.18)",

    buttonPrimary: "#5F7A5C",            // Sage green primary button
    buttonPrimaryHover: "#4A6048",
    buttonPrimaryContrast: "#FFFFFF",
    buttonSecondary: "#FFFFFF",
    buttonSecondaryHover: "#F5EFE8",
    buttonSecondaryContrast: "#2E2018",
    buttonBorder: "#5F7A5C",
    focusRing: "rgba(95, 122, 92, 0.45)",

    filterActive: "#5F7A5C",
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
    shadow: "rgba(46, 32, 24, 0.08)",
    shadowSoft: "rgba(46, 32, 24, 0.04)",

    // Project convention: interactive card pastel palette (#F4DED3, #DCE9DE, #D9E4EC, #F5E4D3)
    cardPastelPeach: "#F4DED3",
    cardPastelMint: "#DCE9DE",
    cardPastelBlue: "#D9E4EC",
    cardPastelCream: "#F5E4D3",

    // Content area image placeholder gradient
    imageFallback1: "#F4DAE2",
    imageFallback2: "#EDE5DB",
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
