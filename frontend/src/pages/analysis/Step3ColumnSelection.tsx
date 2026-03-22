import { useEffect, useMemo, useState } from "react";

import { discoverColumns } from "../../api/analysis";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useAnalysisStore } from "../../store/analysisStore";

export function Step3ColumnSelection() {
  const dataSource = useAnalysisStore((s) => s.dataSource);
  const csvFile = useAnalysisStore((s) => s.csvFile);

  const dateColumn = useAnalysisStore((s) => s.dateColumn);
  const entityColumn = useAnalysisStore((s) => s.entityColumn);
  const metricColumns = useAnalysisStore((s) => s.metricColumns);

  const setDateColumn = useAnalysisStore((s) => s.setDateColumn);
  const setEntityColumn = useAnalysisStore((s) => s.setEntityColumn);
  const toggleMetricColumn = useAnalysisStore((s) => s.toggleMetricColumn);
  const setMetricColumns = useAnalysisStore((s) => s.setMetricColumns);
  const columnDiscovery = useAnalysisStore((s) => s.columnDiscovery);
  const setColumnDiscovery = useAnalysisStore((s) => s.setColumnDiscovery);
  const goNext = useAnalysisStore((s) => s.goNext);

  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const ready = !!dateColumn.trim() && metricColumns.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!dataSource || (dataSource === "csv" && !csvFile)) {
        setColumnDiscovery({ dateCandidates: [], metricCandidates: [], categoricalCandidates: [] });
        return;
      }
      setInlineError(null);
      setLoading(true);
      try {
        let res;
        if (dataSource === "csv") {
          res = await discoverColumns(csvFile!);
        } else {
          // Send API/SQL config dynamically 
          const source_config: Record<string, unknown> = {};
          if (dataSource === "api") source_config.url = useAnalysisStore.getState().apiUrl;
          if (dataSource === "sql") {
             const sqlConfig = useAnalysisStore.getState().sql;
             let scheme = "postgresql";
             if (sqlConfig.engine === "mysql") scheme = "mysql+pymysql";
             if (sqlConfig.engine === "mssql") scheme = "mssql+pyodbc";
             
             let portPart = "";
             if (sqlConfig.port.trim()) {
               if (isNaN(Number(sqlConfig.port.trim()))) {
                 portPart = `\\${sqlConfig.port.trim()}`;
               } else {
                 portPart = `:${sqlConfig.port.trim()}`;
               }
             }
             const authPart = sqlConfig.username ? `${encodeURIComponent(sqlConfig.username)}:${encodeURIComponent(sqlConfig.password)}@` : "";
             const driverParams = sqlConfig.engine === "mssql" ? "?driver=SQL+Server&Trusted_Connection=yes" : "";
             source_config.connection_url = `${scheme}://${authPart}${sqlConfig.host}${portPart}/${sqlConfig.database}${driverParams}`;
             source_config.query = sqlConfig.query;
          }
          if (dataSource === "nosql") {
             source_config.connection_url = useAnalysisStore.getState().nosql.connectionString;
             source_config.database = useAnalysisStore.getState().nosql.database;
             source_config.collection = useAnalysisStore.getState().nosql.collection;
             source_config.limit = parseInt(useAnalysisStore.getState().nosql.limit, 10) || 1000;
             try {
               source_config.query = JSON.parse(useAnalysisStore.getState().nosql.queryJson);
             } catch {
               source_config.query = {};
             }
          }
          
          const { discoverColumnsV3 } = await import("../../api/analysis");
          res = await discoverColumnsV3({
            source_type: dataSource,
            source_config
          });
        }
        
        if (cancelled) return;
        setColumnDiscovery({
          dateCandidates: res.date_candidates,
          metricCandidates: res.metric_candidates,
          categoricalCandidates: res.categorical_candidates,
        });
      } catch (err: unknown) {
        // Soft fallback if backend doesn't support discovery for this source yet
        if (!cancelled) {
          setColumnDiscovery({ dateCandidates: [], metricCandidates: [], categoricalCandidates: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [csvFile, dataSource, setColumnDiscovery]);

  const dateCandidates = columnDiscovery?.dateCandidates ?? [];
  const metricCandidates = columnDiscovery?.metricCandidates ?? [];
  const entityCandidates = columnDiscovery?.categoricalCandidates ?? [];

  const canSelect = useAnalysisStore((s) => s.canGoToStep(3));

  const allMetricsSelected = metricColumns.length > 0 && metricColumns.length === metricCandidates.length;

  const metricCountLabel = useMemo(() => {
    if (metricColumns.length === 0) return "No metrics selected";
    if (metricColumns.length === 1) return "1 metric selected";
    return `${metricColumns.length} metrics selected`;
  }, [metricColumns.length]);

  function validateNow() {
    if (!dateColumn.trim() && !entityColumn.trim()) return "Select EITHER a Date column (for trends) OR an Entity column (for snapshots).";
    if (dateColumn.trim() && entityColumn.trim()) return "Select ONLY ONE primary dimension (Date OR Entity).";
    if (metricColumns.length === 0) return "Select at least one metric column.";
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">
          Step 3 — Column Selection
        </div>
        <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
          Select <span className="font-bold">ONE</span> date column and{" "}
          <span className="font-bold">MULTIPLE</span> metric columns.
        </div>
      </div>

      {!canSelect ? (
        <Card>
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Not ready</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
            For CSV, verify your upload. For API/SQL/NoSQL, configure your connection in Step 2.
          </div>
        </Card>
      ) : !columnDiscovery ? (
        <Card>
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Loading metadata...</div>
        </Card>
      ) : (
        <Card className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-black text-[var(--sbpa-dark)]">Auto-detected candidates</div>
              <div className="text-xs text-[var(--sbpa-dark)]/55">
                {loading ? "Scanning columns..." : "Pick from the suggestions below."}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMetricColumns(metricCandidates)}
                disabled={metricCandidates.length === 0 || allMetricsSelected}
              >
                Select all metrics
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMetricColumns([])}
                disabled={metricColumns.length === 0}
              >
                Clear metrics
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-bold text-[var(--sbpa-dark)] text-center pb-2 border-b border-[var(--sbpa-dark)]/5">Choose your primary dimension:</div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
                  <div className={`p-3 rounded-2xl transition border ${dateColumn.trim() ? "border-[var(--sbpa-primary)] bg-[var(--sbpa-primary)]/5" : "border-[var(--sbpa-dark)]/5"}`}>
                    <div className="text-sm font-bold text-[var(--sbpa-dark)]">Option A: Date column</div>
                    <div className="text-xs text-[var(--sbpa-dark)]/50 mb-3">Time-series trend analysis</div>
                    {dateCandidates.length === 0 ? (
                      <div>
                        <input
                          value={dateColumn}
                          onChange={(e) => setDateColumn(e.target.value)}
                          className="w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                          placeholder="E.g. date, timestamp, created_at"
                        />
                      </div>
                    ) : (
                      <select
                        value={dateColumn}
                        onChange={(e) => setDateColumn(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                      >
                        <option value="">-- No date column --</option>
                        {dateCandidates.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className={`p-3 rounded-2xl transition border ${entityColumn.trim() ? "border-[var(--sbpa-primary)] bg-[var(--sbpa-primary)]/5" : "border-[var(--sbpa-dark)]/5"}`}>
                    <div className="text-sm font-bold text-[var(--sbpa-dark)]">Option B: Entity column</div>
                    <div className="text-xs text-[var(--sbpa-dark)]/50 mb-3">Static snapshot analysis</div>
                    {entityCandidates.length === 0 ? (
                      <div>
                        <input
                          value={entityColumn}
                          onChange={(e) => setEntityColumn(e.target.value)}
                          className="w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                          placeholder="E.g. customer_id, region, store"
                        />
                      </div>
                    ) : (
                      <select
                        value={entityColumn}
                        onChange={(e) => setEntityColumn(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                      >
                        <option value="">-- No entity column --</option>
                        {entityCandidates.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-[var(--sbpa-dark)]">Metric columns</div>
                <div className="text-xs font-semibold text-[var(--sbpa-dark)]/55">{metricCountLabel}</div>
              </div>
              <div className="mt-2 max-h-[280px] space-y-1 overflow-auto rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-2">
                {metricCandidates.length === 0 ? (
                  <div className="p-2 text-sm">
                    <input
                      value={metricColumns.join(", ")}
                      onChange={(e) => {
                        const vals = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                        setMetricColumns(vals);
                      }}
                      className="w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm text-[var(--sbpa-dark)] outline-none transition focus:border-[var(--sbpa-primary)]"
                      placeholder="E.g. revenue, clicks, sales"
                    />
                    <div className="mt-2 text-xs text-[var(--sbpa-dark)]/50">Enter a comma-separated list of column names.</div>
                  </div>
                ) : (
                  metricCandidates.map((c) => {
                    const checked = metricColumns.includes(c);
                    return (
                      <label
                        key={c}
                        className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-[var(--sbpa-dark)]/5"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMetricColumn(c)}
                        />
                        <span className="text-[var(--sbpa-dark)]/80">{c}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--sbpa-card)]/60 p-3 text-sm text-[var(--sbpa-dark)]/70">
            <span className="font-bold">Rule</span>: You must select either 1 Date column or 1 Entity column, plus at least 1 Metric.
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[var(--sbpa-dark)]/60">
              {ready ? "Ready for Step 4." : "Complete the required selections."}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const err = validateNow();
                setInlineError(err);
                if (!err) goNext();
              }}
            >
              Validate
            </Button>
          </div>

          {inlineError ? <div className="text-sm font-bold text-red-700">{inlineError}</div> : null}
        </Card>
      )}
    </div>
  );
}

