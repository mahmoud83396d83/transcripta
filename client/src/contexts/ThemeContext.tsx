import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

interface ThemeContextType {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

function getSystemTheme(): Theme {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getStoredPreference(defaultTheme: Theme): ThemePreference {
  if (typeof window === "undefined") return defaultTheme;
  const stored = localStorage.getItem("theme") as ThemePreference | null;
  return stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    switchable ? getStoredPreference(defaultTheme) : defaultTheme,
  );
  const [systemTheme, setSystemTheme] = useState<Theme>(() => getSystemTheme());
  const theme: Theme = preference === "system" ? systemTheme : preference;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => setSystemTheme(mediaQuery.matches ? "light" : "dark");
    handleChange();
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");
    root.dataset.themePreference = preference;
    if (switchable) localStorage.setItem("theme", preference);
  }, [preference, switchable, theme]);

  const setPreference = (nextPreference: ThemePreference) => {
    if (switchable) setPreferenceState(nextPreference);
  };

  const toggleTheme = () => {
    if (!switchable) return;
    setPreferenceState(current => current === "dark" ? "light" : current === "light" ? "system" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
