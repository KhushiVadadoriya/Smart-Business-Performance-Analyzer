import type { MetricBarDatum } from "../analysis/charts/MetricBars";
import type { TrendDataPoint } from "../analysis/charts/TimeSeriesLineChart";
import type { PieDatum } from "../analysis/charts/MetricPieChart";

type AnyObj = Record<string, unknown>;

function getNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}

export type DerivedCharts = {
  datasetType: string | null;
  metrics: string[];
  changePercentBars: MetricBarDatum[] | null;
  volatilityBars: MetricBarDatum[] | null;
  anomalyBars: MetricBarDatum[] | null;
  timeSeriesData: Record<string, TrendDataPoint[]> | null;
  distributionData: Record<string, PieDatum[]> | null;
  multiMetricDataTS: any[] | null;
  multiMetricDataSnap: any[] | null;
};

export function deriveCharts(result: AnyObj | null): DerivedCharts {
  if (!result) {
    return {
      datasetType: null,
      metrics: [],
      changePercentBars: null,
      volatilityBars: null,
      anomalyBars: null,
      timeSeriesData: null,
      distributionData: null,
      multiMetricDataTS: null,
      multiMetricDataSnap: null,
    };
  }

  const datasetType = (result.dataset_type as string | undefined) ?? null;
  const metrics = Array.isArray(result.metrics_analyzed)
    ? (result.metrics_analyzed as unknown[]).filter((m) => typeof m === "string") as string[]
    : [];

  const meta = (result.analysis_metadata as AnyObj | undefined) ?? undefined;
  const changePercentBars: MetricBarDatum[] = [];
  const volatilityBars: MetricBarDatum[] = [];
  const anomalyBars: MetricBarDatum[] = [];

  const timeSeriesData: Record<string, TrendDataPoint[]> = {};
  const distributionData: Record<string, PieDatum[]> = {};
  const multiMetricDataTS: any[] = [];
  const multiMetricDataSnap: any[] = [];

  if (meta && typeof meta === "object") {
    for (const [metric, v] of Object.entries(meta)) {
      if (!v || typeof v !== "object") continue;
      const row = v as AnyObj;

      const change = getNumber(row.change_percent);
      if (change !== null) changePercentBars.push({ metric, value: change });

      const vol = getNumber(row.volatility_score);
      if (vol !== null) volatilityBars.push({ metric, value: vol });

      const anom = getNumber(row.anomaly_count);
      if (anom !== null) anomalyBars.push({ metric, value: anom });

      if (Array.isArray(row.trend_data) && row.trend_data.length > 0) {
        timeSeriesData[metric] = row.trend_data as TrendDataPoint[];
      }
      
      if (Array.isArray(row.distribution_data) && row.distribution_data.length > 0) {
        distributionData[metric] = row.distribution_data as PieDatum[];
      }

      if (datasetType === "event_time_series") {
        multiMetricDataTS.push({
          name: metric,
          "Change %": change ?? 0,
          "Volatility": vol ?? 0,
          "Anomalies": anom ?? 0,
        });
      } else if (datasetType === "snapshot_entity") {
        multiMetricDataSnap.push({
          name: metric,
          "Concentration": getNumber(row.concentration_ratio) ?? 0,
          "Dominance": getNumber(row.dominance_index) ?? 0,
          "Spread": getNumber(row.spread_score) ?? 0,
        });
      }
    }
  }

  function sortDesc(a: { value: number }, b: { value: number }) {
    return Math.abs(b.value) - Math.abs(a.value);
  }

  changePercentBars.sort(sortDesc);
  volatilityBars.sort(sortDesc);
  anomalyBars.sort(sortDesc);

  return {
    datasetType,
    metrics,
    changePercentBars: changePercentBars.length ? changePercentBars : null,
    volatilityBars: volatilityBars.length ? volatilityBars : null,
    anomalyBars: anomalyBars.length ? anomalyBars : null,
    timeSeriesData: Object.keys(timeSeriesData).length ? timeSeriesData : null,
    distributionData: Object.keys(distributionData).length ? distributionData : null,
    multiMetricDataTS: multiMetricDataTS.length > 1 ? multiMetricDataTS : null,
    multiMetricDataSnap: multiMetricDataSnap.length > 1 ? multiMetricDataSnap : null,
  };
}
