import { useMemo } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useAnalysisStore } from "../../store/analysisStore";
import { normalizeInsightsAndSummary } from "../../utils/analysisResult";
import { downloadJson } from "../../utils/download";
import { addToHistory } from "../../utils/history";
import { TopMoversTable } from "../../analysis/TopMoversTable";
import { MetricBars } from "../../analysis/charts/MetricBars";
import { TimeSeriesLineChart } from "../../analysis/charts/TimeSeriesLineChart";
import { MultiMetricBarChart } from "../../analysis/charts/MultiMetricBarChart";
import { MetricPieChart } from "../../analysis/charts/MetricPieChart";
import { deriveCharts } from "../../utils/chartLogic";

export function Step8FinalSummary() {
  const analysisResult = useAnalysisStore((s) => s.analysisResult);
  const summary = useAnalysisStore((s) => s.summary);
  const insights = useAnalysisStore((s) => s.insights);
  const setSummary = useAnalysisStore((s) => s.setSummary);
  const dataSource = useAnalysisStore((s) => s.dataSource);
  const csvFile = useAnalysisStore((s) => s.csvFile);

  const normalized = useMemo(() => normalizeInsightsAndSummary(analysisResult), [analysisResult]);
  const takeaways = summary?.bullets?.length ? summary.bullets : normalized.summaryBullets;
  const charts = useMemo(() => deriveCharts(analysisResult), [analysisResult]);

  const fileName = useMemo(() => {
    if (dataSource === "csv") return csvFile?.name ?? "csv_upload.csv";
    if (dataSource === "api") return "api_source";
    if (dataSource === "sql") return "sql_source";
    if (dataSource === "nosql") return "nosql_source";
    return "analysis";
  }, [csvFile?.name, dataSource]);

  function onSaveToHistory() {
    const summaryText = takeaways.slice(0, 5).join(" ");
    addToHistory({
      fileName,
      date: new Date().toISOString(),
      summary: summaryText || "Analysis completed.",
      insights,
    });
  }

  function onDownloadJson() {
    downloadJson(`sbpa-report-${new Date().toISOString().slice(0, 10)}.json`, {
      analysisResult,
      insights,
      summary: { title: summary?.title ?? normalized.summaryTitle, bullets: takeaways },
      createdAt: new Date().toISOString(),
    });
  }

  function onDownloadPdf() {
    window.print();
  }

  return (
    <div className="space-y-4 print:space-y-6">
      <div className="print:hidden">
        <div className="text-lg font-black text-[var(--sbpa-dark)]">Step 8 — Final Summary</div>
        <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
          Executive-ready summary and key takeaways.
        </div>
      </div>

      {!analysisResult ? (
        <Card className="print:hidden">
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Not ready</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">Run Step 6 first.</div>
        </Card>
      ) : insights.length === 0 ? (
        <Card className="print:hidden">
          <div className="text-sm font-bold text-[var(--sbpa-dark)]">Not ready</div>
          <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">Complete Step 7 (Insights) first.</div>
        </Card>
      ) : (
        <Card className="space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--sbpa-dark)]/10 pb-4">
            <div>
              <div className="text-2xl font-black text-[var(--sbpa-dark)]">Performance Report</div>
              <div className="text-sm text-[var(--sbpa-dark)]/55 mt-1">Source: {fileName} | Generated: {new Date().toLocaleDateString()}</div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
              <Button type="button" variant="secondary" onClick={onSaveToHistory}>Save to History</Button>
              <Button type="button" variant="ghost" onClick={onDownloadJson}>Download JSON</Button>
              <Button type="button" onClick={onDownloadPdf}>Save as PDF</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-[var(--sbpa-card)] p-5 break-inside-avoid">
              <div className="text-sm font-black text-[var(--sbpa-dark)] uppercase tracking-wider mb-3">Executive Summary</div>
              <ul className="space-y-2 text-sm text-[var(--sbpa-dark)]/75">
                {takeaways.map((b, i) => (
                  <li key={i}><span className="font-black text-[var(--sbpa-dark)] mr-2">•</span>{b}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-[var(--sbpa-primary)]/10 p-5 break-inside-avoid">
              <div className="text-sm font-black text-[var(--sbpa-dark)] uppercase tracking-wider mb-3">Actionable Steps</div>
              <ul className="space-y-2 text-sm text-[var(--sbpa-dark)]/75">
                <li><span className="font-black text-[var(--sbpa-primary)] mr-2">1.</span>Prioritize stabilizing metrics with high volatility scores flagged in the analysis.</li>
                <li><span className="font-black text-[var(--sbpa-primary)] mr-2">2.</span>Investigate the Top Movers to capitalize on recent performance growth trends.</li>
                <li><span className="font-black text-[var(--sbpa-primary)] mr-2">3.</span>Share this comprehensive report with stakeholders for alignment on strategy.</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="text-lg font-black text-[var(--sbpa-dark)] border-b border-[var(--sbpa-dark)]/10 pb-2 mb-4 mt-4 break-inside-avoid">Detailed Insights</div>
            <div className="grid grid-cols-1 gap-3">
              {insights.map((t, i) => (
                <div key={i} className="rounded-xl border border-[var(--sbpa-dark)]/5 bg-[var(--sbpa-card)] p-4 text-sm text-[var(--sbpa-dark)]/80 shadow-sm break-inside-avoid">
                  <span className="font-black text-[var(--sbpa-dark)] mr-2">→</span> {t}
                </div>
              ))}
            </div>
          </div>

          <div>
             <div className="text-lg font-black text-[var(--sbpa-dark)] border-b border-[var(--sbpa-dark)]/10 pb-2 mb-4 mt-8 break-inside-avoid">Analysis Charts</div>
             <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {charts.changePercentBars ? (
                  <div className="lg:col-span-2 break-inside-avoid">
                    <TopMoversTable data={charts.changePercentBars} />
                  </div>
                ) : null}

                {charts.timeSeriesData
                  ? Object.entries(charts.timeSeriesData).map(([metric, data]) => (
                      <div key={`ts-${metric}`} className="lg:col-span-2 break-inside-avoid">
                        <TimeSeriesLineChart 
                          title={`Trend: ${metric}`} 
                          metricName={metric}
                          data={data} 
                        />
                      </div>
                    ))
                  : null}

                {charts.multiMetricDataTS ? (
                  <div className="lg:col-span-2 break-inside-avoid">
                    <MultiMetricBarChart 
                      title="Cross-Metric Analysis (Trends)" 
                      data={charts.multiMetricDataTS} 
                      dataKeys={["Change %", "Volatility", "Anomalies"]} 
                    />
                  </div>
                ) : null}

                {charts.multiMetricDataSnap ? (
                  <div className="lg:col-span-2 break-inside-avoid">
                    <MultiMetricBarChart 
                      title="Cross-Metric Analysis (Profiles)" 
                      data={charts.multiMetricDataSnap} 
                      dataKeys={["Concentration", "Dominance", "Spread"]} 
                    />
                  </div>
                ) : null}

                {charts.changePercentBars ? (
                  <div className="break-inside-avoid"><MetricBars title="Change % by metric" data={charts.changePercentBars} valueLabel="Change %" valueType="percent" /></div>
                ) : null}

                {charts.volatilityBars ? (
                  <div className="break-inside-avoid"><MetricBars title="Volatility score by metric" data={charts.volatilityBars} valueLabel="Volatility" valueType="number" /></div>
                ) : null}

                {charts.anomalyBars ? (
                  <div className="break-inside-avoid"><MetricBars title="Anomaly count by metric" data={charts.anomalyBars} valueLabel="Anomalies" valueType="number" /></div>
                ) : null}

                {charts.distributionData
                  ? Object.entries(charts.distributionData).map(([metric, data]) => (
                      <div key={`pie-${metric}`} className="break-inside-avoid">
                        <MetricPieChart 
                          title={`Entity Distribution: ${metric}`} 
                          data={data} 
                          isDonut={true} 
                        />
                      </div>
                    ))
                  : null}
             </div>
          </div>
        </Card>
      )}
    </div>
  );
}

