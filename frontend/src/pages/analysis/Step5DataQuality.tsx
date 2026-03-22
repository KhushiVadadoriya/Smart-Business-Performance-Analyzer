import { useEffect, useMemo, useState } from "react";

import { assessQuality } from "../../api/analysis";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useAnalysisStore } from "../../store/analysisStore";

function pct(v: number): string {
  if (!Number.isFinite(v)) return "-";
  return `${Math.round(v * 100)}%`;
}

export function Step5DataQuality() {
  const dataSource = useAnalysisStore((s) => s.dataSource);
  const csvFile = useAnalysisStore((s) => s.csvFile);
  const quality = useAnalysisStore((s) => s.quality);
  const setQuality = useAnalysisStore((s) => s.setQuality);
  const goNext = useAnalysisStore((s) => s.goNext);

  const [loading, setLoading] = useState(false);

  const canRun = dataSource === "csv" && !!csvFile;

  if (dataSource !== "csv") {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-lg font-black text-[var(--sbpa-dark)]">Step 5 — Data Quality</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">Identify missing values and potential issues before analysis.</div>
        </div>
        <Card>
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Not required for external pipelines</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
            The explicit UX Data Assessment Engine focuses strictly on static tabular data. For dynamic APIs and SQL databases, the V3 Engine natively handles schema mapping, null mitigation, and drops faulty vectors autonomously before running the ML models.
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="rounded-2xl bg-[var(--sbpa-card)]/60 p-3 text-sm text-[var(--sbpa-dark)]/70 grow mr-3">
              <span className="font-bold">Ready</span>: You are clear to proceed to Step 6.
            </div>
            <Button type="button" onClick={goNext}>Go to Step 6</Button>
          </div>
        </Card>
      </div>
    );
  }

  async function run() {
    if (!csvFile) return;
    setLoading(true);
    try {
      const res = await assessQuality(csvFile);
      setQuality({
        totalRows: res.total_rows,
        nullCounts: res.null_counts,
        duplicateRows: res.duplicate_rows,
        rowsWithAnyNull: res.rows_with_any_null,
        usableRows: res.usable_rows,
        completenessRatio: res.completeness_ratio,
      });
    } catch {
      // handled by global toast
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canRun) return;
    if (quality) return;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRun]);

  const worstNulls = useMemo(() => {
    const entries = Object.entries(quality?.nullCounts ?? {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 8);
  }, [quality?.nullCounts]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">
          Step 5 — Data Quality
        </div>
        <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
          Identify missing values and potential issues before analysis.
        </div>
      </div>

      {!canRun ? (
        <Card>
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Not ready</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
            Step 5 is currently implemented for CSV uploads. Complete Step 2 for CSV.
          </div>
        </Card>
      ) : (
        <Card className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black text-[var(--sbpa-dark)]">Quality report</div>
              <div className="text-xs text-[var(--sbpa-dark)]/55">
                {loading ? "Assessing..." : quality ? "Generated." : "Not generated yet."}
              </div>
            </div>
            <Button type="button" variant="secondary" onClick={run} disabled={loading}>
              {loading ? "Running..." : quality ? "Re-run" : "Run quality check"}
            </Button>
          </div>

          {quality ? (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-[var(--sbpa-card)]/80 p-4">
                  <div className="text-xs font-semibold text-[var(--sbpa-dark)]/55">Completeness</div>
                  <div className="mt-1 text-xl font-black text-[var(--sbpa-dark)]">
                    {pct(quality.completenessRatio)}
                  </div>
                  <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
                    Usable rows: {quality.usableRows} / {quality.totalRows}
                  </div>
                </div>
                <div className="rounded-2xl bg-[var(--sbpa-card)]/80 p-4">
                  <div className="text-xs font-semibold text-[var(--sbpa-dark)]/55">Rows with any null</div>
                  <div className="mt-1 text-xl font-black text-[var(--sbpa-dark)]">
                    {quality.rowsWithAnyNull}
                  </div>
                  <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">May affect trends and metrics.</div>
                </div>
                <div className="rounded-2xl bg-[var(--sbpa-card)]/80 p-4">
                  <div className="text-xs font-semibold text-[var(--sbpa-dark)]/55">Duplicate rows</div>
                  <div className="mt-1 text-xl font-black text-[var(--sbpa-dark)]">
                    {quality.duplicateRows}
                  </div>
                  <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">Consider de-duplication if high.</div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-3">
                <div className="text-sm font-black text-[var(--sbpa-dark)]">
                  Missing values by column (top {worstNulls.length})
                </div>
                <div className="mt-3 space-y-2">
                  {worstNulls.length === 0 ? (
                    <div className="text-sm text-[var(--sbpa-dark)]/60">No null counts available.</div>
                  ) : (
                    worstNulls.map(([col, count]) => (
                      <div key={col} className="flex items-center justify-between gap-3">
                        <div className="min-w-0 truncate text-sm font-semibold text-[var(--sbpa-dark)]/75">{col}</div>
                        <div className="text-sm font-black text-[var(--sbpa-dark)]">{count}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="rounded-2xl bg-[var(--sbpa-card)]/60 p-3 text-sm text-[var(--sbpa-dark)]/70 grow">
                  <span className="font-bold">Ready</span>: Quality check complete. You can proceed to Step 6.
                </div>
                <Button type="button" onClick={goNext}>
                  Go to Step 6
                </Button>
              </div>
            </>
          ) : (
            <div className="text-sm text-[var(--sbpa-dark)]/60">Run the quality check to continue.</div>
          )}
        </Card>
      )}
    </div>
  );
}

