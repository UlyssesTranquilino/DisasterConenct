import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Always return 'dark' - dark mode only
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Always add dark class
    root.classList.add("dark");
    localStorage.setItem("dc-theme", "dark");
  }, []);

  const setTheme = (t: Theme) => {
    // Force dark mode only
    setThemeState("dark");
  };
  const toggleTheme = () => {
    // No-op - always dark
  };

  const value = useMemo(
    () => ({ theme: "dark" as Theme, setTheme, toggleTheme }),
    []
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
