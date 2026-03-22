import { type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

  const styles =
    variant === "primary"
      ? "bg-[var(--sbpa-primary)] text-white hover:brightness-95"
      : variant === "secondary"
        ? "bg-[var(--sbpa-card)] text-[var(--sbpa-dark)] hover:brightness-97"
        : "bg-transparent text-[var(--sbpa-dark)] hover:bg-[var(--sbpa-dark)]/5 dark:hover:bg-[var(--sbpa-card)]/10";

  return (
    <button className={twMerge(clsx(base, styles, className))} {...props} />
  );
}

