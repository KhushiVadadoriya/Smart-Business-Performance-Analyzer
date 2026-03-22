import type { PropsWithChildren } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Card({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-2xl border border-[var(--sbpa-dark)]/10 dark:border-white/10 bg-[var(--sbpa-card)]/70 dark:bg-[var(--sbpa-card)]/70 p-5 shadow-sm backdrop-blur",
          className,
        ),
      )}
    >
      {children}
    </div>
  );
}

