import { useMemo, useState } from "react";

import { analyzeCsvV3, ingestAndAnalyzeV3 } from "../../api/analysis";
import { TopMoversTable } from "../../analysis/TopMoversTable";
import { MetricBars } from "../../analysis/charts/MetricBars";
import { TimeSeriesLineChart } from "../../analysis/charts/TimeSeriesLineChart";
import { MultiMetricBarChart } from "../../analysis/charts/MultiMetricBarChart";
import { MetricPieChart } from "../../analysis/charts/MetricPieChart";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useAnalysisStore } from "../../store/analysisStore";
import { deriveCharts } from "../../utils/chartLogic";

function safeJsonParse(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

export function Step6Analysis() {
  const dataSource = useAnalysisStore((s) => s.dataSource);
  const csvFile = useAnalysisStore((s) => s.csvFile);
  const apiUrl = useAnalysisStore((s) => s.apiUrl);
  const sql = useAnalysisStore((s) => s.sql);
  const nosql = useAnalysisStore((s) => s.nosql);

  const dateColumn = useAnalysisStore((s) => s.dateColumn);
  const entityColumn = useAnalysisStore((s) => s.entityColumn);
  const metricColumns = useAnalysisStore((s) => s.metricColumns);
  const analysisResult = useAnalysisStore((s) => s.analysisResult);
  const setAnalysisResult = useAnalysisStore((s) => s.setAnalysisResult);
  const goNext = useAnalysisStore((s) => s.goNext);

  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const canRun = useMemo(() => {
    if (!dataSource) return false;
    if (!dateColumn.trim() && !entityColumn.trim()) return false;
    if (metricColumns.length === 0) return false;
    if (dataSource === "csv") return !!csvFile;
    if (dataSource === "api") return !!apiUrl.trim();
    if (dataSource === "sql") return !!sql.query.trim();
    if (dataSource === "nosql") return !!nosql.connectionString.trim();
    return false;
  }, [apiUrl, csvFile, dataSource, dateColumn, entityColumn, metricColumns.length, nosql.connectionString, sql.query]);

  const charts = useMemo(() => deriveCharts(analysisResult), [analysisResult]);

  async function run() {
    if (!dataSource) return;
    setLoading(true);
    try {
      if (dataSource === "csv") {
        if (!csvFile) return;
        // v3 pipeline now supports /api/v3/analyze-csv to bypass JSON limitations
        const res = await analyzeCsvV3({
          file: csvFile,
          dateColumn: dateColumn || null,
          metricColumns: metricColumns,
          entityColumn: entityColumn || null,
        });
        setAnalysisResult({ version: "v3", ...res });
        return;
      }

      if (dataSource === "api") {
        const res = await ingestAndAnalyzeV3({
          source_type: "api",
          source_config: { url: apiUrl.trim() },
          date_column: dateColumn || null,
          metric_columns: metricColumns,
          entity_column: entityColumn || null,
        });
        setAnalysisResult(res);
        return;
      }

      if (dataSource === "sql") {
        let scheme = "postgresql";
        if (sql.engine === "mysql") scheme = "mysql+pymysql";
        if (sql.engine === "mssql") scheme = "mssql+pyodbc";
        
        let portPart = "";
        if (sql.port.trim()) {
          if (isNaN(Number(sql.port.trim()))) {
            portPart = `\\${sql.port.trim()}`;
          } else {
            portPart = `:${sql.port.trim()}`;
          }
        }
        const authPart = sql.username ? `${encodeURIComponent(sql.username)}:${encodeURIComponent(sql.password)}@` : "";
        const driverParams = sql.engine === "mssql" ? "?driver=SQL+Server&Trusted_Connection=yes" : "";
        const connection_url = `${scheme}://${authPart}${sql.host}${portPart}/${sql.database}${driverParams}`;

        const res = await ingestAndAnalyzeV3({
          source_type: "sql",
          source_config: { connection_url, query: sql.query },
          date_column: dateColumn || null,
          metric_columns: metricColumns,
          entity_column: entityColumn || null,
        });
        setAnalysisResult(res);
        return;
      }

      if (dataSource === "nosql") {
        const query = safeJsonParse(nosql.queryJson);
        const limit = Number(nosql.limit);
        const res = await ingestAndAnalyzeV3({
          source_type: "nosql",
          source_config: {
            connection_url: nosql.connectionString,
            database: nosql.database,
            collection: nosql.collection,
            query: query && typeof query === "object" ? query : undefined,
            limit: Number.isFinite(limit) ? limit : 1000,
          },
          date_column: dateColumn || null,
          metric_columns: metricColumns,
          entity_column: entityColumn || null,
        });
        setAnalysisResult(res);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">Step 6 — Analysis</div>
        <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
          Run the intelligent analysis and review the outputs.
        </div>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-black text-[var(--sbpa-dark)]">Run pipeline</div>
            <div className="text-xs text-[var(--sbpa-dark)]/55">
              Uses the V3 Advanced Analysis Pipeline for all data sources.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => setAnalysisResult(null)} disabled={!analysisResult || loading}>
              Clear
            </Button>
            <Button type="button" onClick={run} disabled={!canRun || loading}>
              {loading ? "Running..." : analysisResult ? "Re-run analysis" : "Run analysis"}
            </Button>
          </div>
        </div>

        {analysisResult ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {charts.datasetType ? (
                <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-4">
                  <div className="text-sm font-black text-[var(--sbpa-dark)]">Dataset type</div>
                  <div className="mt-1 text-sm text-[var(--sbpa-dark)]/70">{charts.datasetType}</div>
                  <div className="mt-3 text-xs font-semibold text-[var(--sbpa-dark)]/55">
                    Metrics: {charts.metrics.length ? charts.metrics.join(", ") : "-"}
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-4">
                <div className="text-sm font-black text-[var(--sbpa-dark)]">Highlights</div>
                <div className="mt-2 text-sm text-[var(--sbpa-dark)]/70">
                  These charts are derived from backend analysis metadata (per-metric signals).
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {charts.changePercentBars ? (
                <div className="lg:col-span-2">
                  <TopMoversTable data={charts.changePercentBars} />
                </div>
              ) : null}

              {charts.timeSeriesData
                ? Object.entries(charts.timeSeriesData).map(([metric, data]) => (
                    <div key={`ts-${metric}`} className="lg:col-span-2">
                      <TimeSeriesLineChart 
                        title={`Trend: ${metric}`} 
                        metricName={metric}
                        data={data} 
                      />
                    </div>
                  ))
                : null}

              {charts.multiMetricDataTS ? (
                <div className="lg:col-span-2">
                  <MultiMetricBarChart 
                    title="Cross-Metric Analysis (Trends)" 
                    data={charts.multiMetricDataTS} 
                    dataKeys={["Change %", "Volatility", "Anomalies"]} 
                  />
                </div>
              ) : null}

              {charts.multiMetricDataSnap ? (
                <div className="lg:col-span-2">
                  <MultiMetricBarChart 
                    title="Cross-Metric Analysis (Profiles)" 
                    data={charts.multiMetricDataSnap} 
                    dataKeys={["Concentration", "Dominance", "Spread"]} 
                  />
                </div>
              ) : null}

              {charts.changePercentBars ? (
                <MetricBars title="Change % by metric" data={charts.changePercentBars} valueLabel="Change %" valueType="percent" />
              ) : null}

              {charts.volatilityBars ? (
                <MetricBars title="Volatility score by metric" data={charts.volatilityBars} valueLabel="Volatility" valueType="number" />
              ) : null}

              {charts.anomalyBars ? (
                <MetricBars title="Anomaly count by metric" data={charts.anomalyBars} valueLabel="Anomalies" valueType="number" />
              ) : null}

              {charts.distributionData
                ? Object.entries(charts.distributionData).map(([metric, data]) => (
                    <div key={`pie-${metric}`}>
                      <MetricPieChart 
                        title={`Entity Distribution: ${metric}`} 
                        data={data} 
                        isDonut={true} 
                      />
                    </div>
                  ))
                : null}
            </div>

            <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-black text-[var(--sbpa-dark)]">Raw result (debug)</div>
                <Button type="button" variant="ghost" onClick={() => setShowRaw((v) => !v)}>
                  {showRaw ? "Hide" : "Show"}
                </Button>
              </div>
              {showRaw ? (
                <pre className="mt-2 max-h-[380px] overflow-auto rounded-2xl bg-[var(--sbpa-dark)]/5 p-3 text-xs text-[var(--sbpa-dark)]/75">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 mt-4">
              <div className="rounded-2xl bg-[var(--sbpa-card)]/60 p-3 text-sm text-[var(--sbpa-dark)]/70 grow">
                <span className="font-bold">Ready</span>: Analysis is complete. Read the charts and proceed.
              </div>
              <Button type="button" onClick={goNext}>
                Go to Step 7
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[var(--sbpa-dark)]/60">Run Step 6 to generate analysis results.</div>
        )}
      </Card>
    </div>
  );
}

