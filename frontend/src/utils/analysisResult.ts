export type NormalizedInsightsSummary = {
  insights: string[];
  summaryTitle: string;
  summaryBullets: string[];
  rawExecutiveSummary?: Record<string, unknown> | null;
};

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  return [];
}

function toBulletsFromObject(v: unknown): string[] {
  if (!v || typeof v !== "object") return [];
  const obj = v as Record<string, unknown>;
  return Object.entries(obj).map(([k, val]) => {
    const key = k.replace(/_/g, " ");
    if (val && typeof val === "object") {
      const vObj = val as Record<string, unknown>;
      if (typeof vObj.summary === "string" && typeof vObj.explanation === "string") {
        return `${key.toUpperCase()}: ${vObj.summary} ${vObj.explanation}`;
      }
      if (typeof vObj.summary === "string") {
        return `${key.toUpperCase()}: ${vObj.summary}`;
      }
      if (typeof vObj.explanation === "string") {
        return `${key.toUpperCase()}: ${vObj.explanation}`;
      }
      return `${key.toUpperCase()}: ${JSON.stringify(val)}`;
    }
    return `${key}: ${String(val)}`;
  });
}

export function normalizeInsightsAndSummary(result: Record<string, unknown> | null): NormalizedInsightsSummary {
  if (!result) {
    return { insights: [], summaryTitle: "Executive summary", summaryBullets: [] };
  }

  // v1 helper response shape (CSV): { version:"v1", dataset_type, metrics_analyzed, insights }
  const insightsV1 = result.insights;
  const v1Insights = asStringArray(insightsV1).length
    ? asStringArray(insightsV1)
    : toBulletsFromObject(insightsV1);

  // v3 response shape: { dataset_type, analysis_metadata, executive_summary }
  const exec = (result.executive_summary as Record<string, unknown> | undefined) ?? undefined;
  const summaryBullets =
    exec && typeof exec === "object"
      ? [
          `Overall health: ${String(exec.overall_health ?? "-")}`,
          `Health score: ${String(exec.health_score ?? "-")}`,
          `Risk level: ${String(exec.risk_level ?? "-")}`,
          `Stability: ${String(exec.stability ?? "-")}`,
          `Confidence: ${String(exec.confidence_score ?? "-")}`,
          ...toBulletsFromObject(exec.drivers),
        ]
      : [];

  const insights =
    v1Insights.length > 0
      ? v1Insights
      : toBulletsFromObject(result.analysis_metadata);

  return {
    insights,
    summaryTitle: "Executive summary",
    summaryBullets,
    rawExecutiveSummary: exec ?? null,
  };
}

