import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

export function ProfileDropdown() {
  const navigate = useNavigate();
  const { userEmail, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function onLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-2xl border border-[var(--sbpa-dark)]/10 dark:border-white/10 bg-[var(--sbpa-card)]/70 px-3 py-2 text-left text-sm shadow-sm transition hover:bg-[var(--sbpa-card)]"
      >
        <div className="grid size-9 place-items-center rounded-2xl bg-[var(--sbpa-primary)] text-xs font-black text-white">
          {userEmail?.slice(0, 2).toUpperCase() ?? "U"}
        </div>
        <div className="hidden sm:block">
          <div className="max-w-[220px] truncate font-semibold text-[var(--sbpa-dark)]">
            {userEmail ?? "User"}
          </div>
          <div className="text-xs text-[var(--sbpa-dark)] opacity-60">Signed in</div>
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-52 z-50 rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--sbpa-card)] p-2 shadow-lg">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--sbpa-dark)] opacity-80 hover:bg-[var(--sbpa-dark)]/5 dark:hover:bg-[var(--sbpa-card)]/5"
          >
            My Profile
          </Link>
          <Link
            to="/about"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--sbpa-dark)] opacity-80 hover:bg-[var(--sbpa-dark)]/5 dark:hover:bg-[var(--sbpa-card)]/5"
          >
            About
          </Link>
          <Link
            to="/history"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--sbpa-dark)] opacity-80 hover:bg-[var(--sbpa-dark)]/5 dark:hover:bg-[var(--sbpa-card)]/5"
          >
            History
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
