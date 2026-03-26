"use client";

import { useState, useEffect, createContext, useContext } from "react";

export type ThemeMode = "day" | "sunset";

interface ThemeColors {
  mode: ThemeMode;
  // Backgrounds
  bgPrimary: string;
  bgCard: string;
  bgHeader: string;
  bgInput: string;
  bgAccent: string;
  bgMuted: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnDark: string;
  // Buttons
  btnPrimary: string;
  btnPrimaryHover: string;
  // Borders
  borderLight: string;
  borderAccent: string;
  // Special
  gradient: string;
  gradientSubtle: string;
  heroImage: string;
  greeting: string;
}

const DAY_THEME: ThemeColors = {
  mode: "day",
  bgPrimary: "bg-[#F0F7FA]",
  bgCard: "bg-white/90 backdrop-blur-sm",
  bgHeader: "bg-gradient-to-l from-[#1a7fb5] via-[#2d9dd4] to-[#47b8e0]",
  bgInput: "bg-white/80",
  bgAccent: "bg-[#e8f4f8]",
  bgMuted: "bg-[#f5f9fb]",
  textPrimary: "text-[#1a3a4a]",
  textSecondary: "text-[#4a7a8a]",
  textMuted: "text-[#8ab0c0]",
  textOnDark: "text-white",
  btnPrimary: "bg-[#2196c8] hover:bg-[#1a7fb5]",
  btnPrimaryHover: "hover:bg-[#1a7fb5]",
  borderLight: "border-[#d8eef5]",
  borderAccent: "border-[#2196c8]",
  gradient: "from-[#87CEEB] via-[#4AA8D8] to-[#1a7fb5]",
  gradientSubtle: "from-[#e8f4f8] to-[#F0F7FA]",
  heroImage: "/api/hero?theme=day",
  greeting: "בוקר טוב, עינת",
};

const SUNSET_THEME: ThemeColors = {
  mode: "sunset",
  bgPrimary: "bg-[#1a1520]",
  bgCard: "bg-[#2a2035]/90 backdrop-blur-sm",
  bgHeader: "bg-gradient-to-l from-[#c2185b] via-[#e65100] to-[#ff8f00]",
  bgInput: "bg-[#2a2035]/80",
  bgAccent: "bg-[#3a2540]",
  bgMuted: "bg-[#231a2e]",
  textPrimary: "text-[#f5e6d8]",
  textSecondary: "text-[#c8a88a]",
  textMuted: "text-[#8a6a5a]",
  textOnDark: "text-white",
  btnPrimary: "bg-[#e65100] hover:bg-[#c2185b]",
  btnPrimaryHover: "hover:bg-[#c2185b]",
  borderLight: "border-[#3a2540]",
  borderAccent: "border-[#e65100]",
  gradient: "from-[#c2185b] via-[#e65100] to-[#ff8f00]",
  gradientSubtle: "from-[#231a2e] to-[#1a1520]",
  heroImage: "/api/hero?theme=sunset",
  greeting: "ערב טוב, עינת",
};

const ThemeContext = createContext<ThemeColors>(DAY_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

function getThemeForTime(): ThemeMode {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  // 16:30 = 990 minutes
  return totalMinutes >= 990 || totalMinutes < 300 ? "sunset" : "day";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("day");

  useEffect(() => {
    setMode(getThemeForTime());
    const interval = setInterval(() => {
      setMode(getThemeForTime());
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const theme = mode === "sunset" ? SUNSET_THEME : DAY_THEME;

  return (
    <ThemeContext.Provider value={theme}>
      <div className={mode === "sunset" ? "bg-[#1a1520] min-h-screen" : "bg-[#F0F7FA] min-h-screen"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
