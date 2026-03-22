import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggleDark: () => void;
  setDark: (val: boolean) => void;
}

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sbpa-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: getInitialTheme(),
  toggleDark: () => set((state) => {
    const newTheme = !state.isDark;
    localStorage.setItem("sbpa-theme", newTheme ? "dark" : "light");
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return { isDark: newTheme };
  }),
  setDark: (val) => set(() => {
    localStorage.setItem("sbpa-theme", val ? "dark" : "light");
    if (val) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return { isDark: val };
  })
}));
