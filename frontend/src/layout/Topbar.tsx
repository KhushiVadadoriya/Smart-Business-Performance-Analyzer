import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { ProfileDropdown } from "./ProfileDropdown";

export function Topbar() {
  const isDark = useThemeStore((s) => s.isDark);
  const toggleDark = useThemeStore((s) => s.toggleDark);

  return (
    <header className="relative z-50 flex items-center justify-between gap-4 rounded-3xl border border-[var(--sbpa-dark)]/10 dark:border-white/10 bg-[var(--sbpa-card)]/60 px-4 py-3 shadow-sm backdrop-blur">
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-[var(--sbpa-dark)]">
          Smart Business Performance Analyzer
        </div>
        <div className="truncate text-xs text-[var(--sbpa-dark)] opacity-60">
          Business-focused AI analytics pipeline
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleDark}
          className="grid size-9 place-items-center rounded-xl bg-[var(--sbpa-dark)]/5 dark:bg-[var(--sbpa-card)]/10 text-[var(--sbpa-dark)] transition hover:bg-[var(--sbpa-dark)]/10 dark:hover:bg-[var(--sbpa-card)]/20"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="h-6 w-px bg-[var(--sbpa-dark)]/10 dark:bg-[var(--sbpa-card)]/10" />
        <ProfileDropdown />
      </div>
    </header>
  );
}
