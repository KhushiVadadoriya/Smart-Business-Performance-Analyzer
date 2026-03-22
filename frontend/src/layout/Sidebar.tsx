import { NavLink } from "react-router-dom";
import { clsx } from "clsx";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/analysis", label: "Analysis" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
];

export function Sidebar() {
  return (
    <aside className="flex flex-col rounded-3xl border border-[var(--sbpa-dark)]/10 dark:border-white/10 bg-[var(--sbpa-card)]/60 p-4 shadow-sm backdrop-blur">
      <div className="mb-5 flex items-center gap-3 px-2">
        <div className="grid size-10 place-items-center rounded-2xl bg-[var(--sbpa-primary)] font-black text-white">
          SB
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-[var(--sbpa-dark)]">
            Smart Business
          </div>
          <div className="truncate text-xs text-[var(--sbpa-dark)] opacity-60">Performance Analyzer</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "rounded-2xl px-3 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-[var(--sbpa-primary)] text-white"
                  : "text-[var(--sbpa-dark)] opacity-70 hover:bg-[var(--sbpa-dark)]/5 dark:hover:bg-[var(--sbpa-card)]/5",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-[var(--sbpa-dark)]/5 dark:bg-[var(--sbpa-card)]/5 p-3 text-xs text-[var(--sbpa-dark)] opacity-70">
        Secure pipeline via FastAPI
      </div>
    </aside>
  );
}
