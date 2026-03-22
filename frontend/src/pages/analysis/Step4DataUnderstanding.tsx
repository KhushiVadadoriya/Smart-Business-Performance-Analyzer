import { useEffect, useMemo, useState } from "react";

import { previewAnalysis } from "../../api/analysis";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { useAnalysisStore } from "../../store/analysisStore";

function inferType(values: unknown[]): string {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNull.length === 0) return "unknown";

  const isNumber = nonNull.every((v) => typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))));
  if (isNumber) return "number";

  const isDateLike = nonNull.every((v) => {
    if (v instanceof Date) return true;
    if (typeof v !== "string") return false;
    const t = Date.parse(v);
    return Number.isFinite(t);
  });
  if (isDateLike) return "date";

  return "string";
}

export function Step4DataUnderstanding() {
  const dataSource = useAnalysisStore((s) => s.dataSource);
  const csvFile = useAnalysisStore((s) => s.csvFile);
  const dateColumn = useAnalysisStore((s) => s.dateColumn);
  const entityColumn = useAnalysisStore((s) => s.entityColumn);
  const metricColumns = useAnalysisStore((s) => s.metricColumns);

  const preview = useAnalysisStore((s) => s.preview);
  const setPreview = useAnalysisStore((s) => s.setPreview);

  const [loading, setLoading] = useState(false);

  const canRun = dataSource === "csv" && !!csvFile && (!!dateColumn.trim() || !!entityColumn.trim()) && metricColumns.length > 0;
  const goNext = useAnalysisStore((s) => s.goNext);

  if (dataSource !== "csv") {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-lg font-black text-[var(--sbpa-dark)]">Step 4 — Data Understanding</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">Preview the dataset and inferred column types.</div>
        </div>
        <Card>
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Not required for external pipelines</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
            Data preview renders are currently optimized for local CSV uploads to save memory bandwidth. The V3 pipeline will securely ingest your remote data and process typing natively inside the backend engine during the Analysis phase. Please proceed.
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={goNext}>Go to Step 5</Button>
          </div>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!canRun || !csvFile) return;
      setLoading(true);
      try {
        const res = await previewAnalysis({
          file: csvFile,
          dateColumn,
          metricColumn: metricColumns[0]!,
        });
        if (cancelled) return;
        setPreview({ rows: res.preview, totalRows: res.total_rows });
      } catch {
        // handled by global toast
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [canRun, csvFile, dateColumn, metricColumns, setPreview]);

  const columns = useMemo(() => {
    const rows = preview?.rows ?? [];
    const keys = new Set<string>();
    for (const r of rows) Object.keys(r).forEach((k) => keys.add(k));
    return Array.from(keys);
  }, [preview?.rows]);

  const columnTypes = useMemo(() => {
    const rows = preview?.rows ?? [];
    const map: Record<string, string> = {};
    for (const col of columns) {
      map[col] = inferType(rows.map((r) => r[col]));
    }
    return map;
  }, [columns, preview?.rows]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">
          Step 4 — Data Understanding
        </div>
        <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
          Preview the dataset and inferred column types.
        </div>
      </div>

      {!canRun ? (
        <Card>
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Not ready</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
            Complete Step 3 (select 1 dimension + 1+ metrics) first.
          </div>
        </Card>
      ) : (
        <Card className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black text-[var(--sbpa-dark)]">Dataset preview</div>
              <div className="text-xs text-[var(--sbpa-dark)]/55">
                {loading
                  ? "Loading preview..."
                  : preview
                    ? `Showing first ${preview.rows.length} rows • Total rows: ${preview.totalRows}`
                    : "No preview loaded yet."}
              </div>
            </div>
            <div className="text-xs font-semibold text-[var(--sbpa-dark)]/55">
              Preview uses metric: <span className="font-black text-[var(--sbpa-dark)]">{metricColumns[0]}</span>
            </div>
          </div>

          {preview?.rows?.length ? (
            <div className="overflow-auto rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]">
              <table className="min-w-[900px] text-left text-sm">
                <thead className="sticky top-0 bg-[var(--sbpa-card)]">
                  <tr>
                    {columns.map((c) => (
                      <th key={c} className="border-b border-[var(--sbpa-dark)]/10 px-3 py-2">
                        <div className="font-black text-[var(--sbpa-dark)]">{c}</div>
                        <div className="text-xs font-semibold text-[var(--sbpa-dark)]/50">{columnTypes[c]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r, idx) => (
                    <tr key={idx} className="odd:bg-[var(--sbpa-dark)]/[0.02]">
                      {columns.map((c) => (
                        <td key={c} className="border-b border-[var(--sbpa-dark)]/5 px-3 py-2 text-[var(--sbpa-dark)]/70">
                          {r[c] === null || r[c] === undefined ? "" : String(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-[var(--sbpa-dark)]/60">No preview data yet.</div>
          )}
        </Card>
      )}
    </div>
  );
}

