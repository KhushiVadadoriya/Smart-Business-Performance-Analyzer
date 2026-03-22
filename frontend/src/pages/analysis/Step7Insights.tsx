import { useEffect, useMemo } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useAnalysisStore } from "../../store/analysisStore";
import { normalizeInsightsAndSummary } from "../../utils/analysisResult";

export function Step7Insights() {
  const analysisResult = useAnalysisStore((s) => s.analysisResult);
  const insights = useAnalysisStore((s) => s.insights);
  const setInsights = useAnalysisStore((s) => s.setInsights);
  const setSummary = useAnalysisStore((s) => s.setSummary);

  const normalized = useMemo(() => normalizeInsightsAndSummary(analysisResult), [analysisResult]);

  useEffect(() => {
    if (!analysisResult) return;
    if (insights.length > 0) return;
    setInsights(normalized.insights);
    setSummary({ title: normalized.summaryTitle, bullets: normalized.summaryBullets });
  }, [analysisResult, insights.length, normalized.insights, normalized.summaryBullets, normalized.summaryTitle, setInsights, setSummary]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">Step 7 — Insights</div>
        <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">Key findings in business-ready bullets.</div>
      </div>

      {!analysisResult ? (
        <Card>
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Not ready</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">Run Step 6 to generate analysis first.</div>
        </Card>
      ) : (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-[var(--sbpa-dark)]">Insights</div>
              <div className="text-xs text-[var(--sbpa-dark)]/55">{insights.length ? `${insights.length} items` : "No insights parsed yet."}</div>
            </div>
            <Button type="button" variant="secondary" onClick={() => setInsights(normalized.insights)}>
              Refresh from result
            </Button>
          </div>

          {insights.length ? (
            <ul className="space-y-2">
              {insights.map((t, i) => (
                <li key={i} className="rounded-2xl bg-[var(--sbpa-card)]/80 p-3 text-sm text-[var(--sbpa-dark)]/75">
                  <span className="font-black text-[var(--sbpa-dark)]">•</span> {t}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[var(--sbpa-dark)]/60">No insights were found in the response.</div>
          )}
        </Card>
      )}
    </div>
  );
}

