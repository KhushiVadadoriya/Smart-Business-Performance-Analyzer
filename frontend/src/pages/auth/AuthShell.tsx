import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh bg-[var(--sbpa-bg)]">
      <div className="mx-auto flex min-h-dvh max-w-[1100px] items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="hidden flex-col justify-center rounded-3xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/60 p-8 shadow-sm backdrop-blur lg:flex">
            <div className="mb-4 text-2xl font-black text-[var(--sbpa-dark)]">
              Smart Business Performance Analyzer
            </div>
            <div className="text-sm text-[var(--sbpa-dark)]/70">
              Securely ingest data, run an intelligent pipeline, and generate executive-ready insights.
            </div>
            <div className="mt-6 rounded-2xl bg-[var(--sbpa-card)]/70 p-4 text-sm text-[var(--sbpa-dark)]/70">
              Token auth is in-memory only. Refreshing the page logs you out (expected).
            </div>
            <div className="mt-6 text-xs text-[var(--sbpa-dark)]/55">
              Need context? Visit{" "}
              <Link className="font-semibold underline" to="/about">
                About
              </Link>{" "}
              after login.
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/70 p-6 shadow-sm backdrop-blur">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

