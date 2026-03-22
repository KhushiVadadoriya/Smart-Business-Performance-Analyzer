import { clsx } from "clsx";

import type { AnalysisStepId } from "../../store/analysisStore";
import { useAnalysisStore } from "../../store/analysisStore";
import { ANALYSIS_STEPS } from "./steps";

export function AnalysisStepper() {
  const currentStep = useAnalysisStore((s) => s.currentStep);
  const setCurrentStep = useAnalysisStore((s) => s.setCurrentStep);
  const canGoToStep = useAnalysisStore((s) => s.canGoToStep);

  function onClickStep(id: AnalysisStepId) {
    if (!canGoToStep(id)) return;
    setCurrentStep(id);
  }

  return (
    <aside className="rounded-3xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/60 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 text-sm font-black text-[var(--sbpa-dark)]">Pipeline</div>
      <div className="space-y-1">
        {ANALYSIS_STEPS.map((s) => {
          if (useAnalysisStore.getState().dataSource !== "csv" && (s.id === 4 || s.id === 5)) {
            return (
              <div key={s.id} className="w-full rounded-2xl border border-transparent px-3 py-2 text-left opacity-40">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-[var(--sbpa-dark)] mix-blend-luminosity">
                    {s.id}. {s.title}
                  </div>
                  <span className="rounded-full bg-[var(--sbpa-dark)]/5 px-2 py-0.5 text-[11px] font-bold text-[var(--sbpa-dark)]/60">
                    Auto-bypassed
                  </span>
                </div>
              </div>
            );
          }

          const enabled = canGoToStep(s.id);
          const active = s.id === currentStep;
          const done = s.id < currentStep;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onClickStep(s.id)}
              disabled={!enabled}
              className={clsx(
                "w-full rounded-2xl border px-3 py-2 text-left transition",
                active
                  ? "border-[var(--sbpa-primary)] bg-[var(--sbpa-card)]/70"
                  : done
                    ? "border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] hover:bg-[var(--sbpa-dark)]/5"
                    : "border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/60 hover:bg-[var(--sbpa-dark)]/5",
                !enabled && "cursor-not-allowed opacity-50",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-[var(--sbpa-dark)]">
                  {s.id}. {s.title}
                </div>
                {done ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    Done
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 text-xs text-[var(--sbpa-dark)]/55">{s.subtitle}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

