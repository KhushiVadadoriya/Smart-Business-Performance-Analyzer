import { apiClient } from "./client";

export type ColumnDiscoveryResponse = {
  date_candidates: string[];
  metric_candidates: string[];
  categorical_candidates: string[];
};

export async function discoverColumns(file: File): Promise<ColumnDiscoveryResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await apiClient.post<{ data: ColumnDiscoveryResponse }>("/api/v1/columns/discover", form);
  return res.data.data ?? res.data;
}

export async function discoverColumnsV3(payload: {
  source_type: string;
  source_config: Record<string, unknown>;
}): Promise<ColumnDiscoveryResponse> {
  const res = await apiClient.post<any>("/api/v3/discover", payload);
  return (res.data?.data ?? res.data) as ColumnDiscoveryResponse;
}

export type PreviewAnalysisResponse = {
  preview: Array<Record<string, unknown>>;
  total_rows: number;
};

export async function previewAnalysis(params: {
  file: File;
  dateColumn: string;
  metricColumn: string;
}): Promise<PreviewAnalysisResponse> {
  const form = new FormData();
  form.append("file", params.file);
  form.append("date_column", params.dateColumn);
  form.append("metric_column", params.metricColumn);

  const res = await apiClient.post<{ data: PreviewAnalysisResponse }>("/api/v1/analyze/preview", form);
  return res.data.data ?? res.data;
}

export type DataQualityResponse = {
  total_rows: number;
  null_counts: Record<string, number>;
  duplicate_rows: number;
  rows_with_any_null: number;
  usable_rows: number;
  completeness_ratio: number;
};

export async function assessQuality(file: File): Promise<DataQualityResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await apiClient.post<{ data: DataQualityResponse }>("/api/v1/quality/assess", form);
  return res.data.data ?? res.data;
}

export type V3IngestAndAnalyzeRequest = {
  source_type: "api" | "sql" | "nosql" | "csv" | string;
  source_config: Record<string, unknown>;
  date_column?: string | null;
  metric_columns: string[];
  entity_column?: string | null;
};

export async function ingestAndAnalyzeV3(payload: V3IngestAndAnalyzeRequest): Promise<Record<string, unknown>> {
  const res = await apiClient.post<any>("/api/v3/ingest-and-analyze", payload);
  return (res.data?.data ?? res.data) as Record<string, unknown>;
}

export async function generateInsightsFromCsv(params: {
  file: File;
  dateColumn: string;
  metricColumns: string[];
}): Promise<Record<string, unknown>> {
  const form = new FormData();
  form.append("file", params.file);
  form.append("date_column", params.dateColumn);
  form.append("metric_columns", params.metricColumns.join(","));

  const res = await apiClient.post<{ data: Record<string, unknown> }>("/api/v1/insights/generate", form);
  return res.data.data ?? res.data;
}

export async function analyzeCsvV3(params: {
  file: File;
  dateColumn?: string | null;
  metricColumns: string[];
  entityColumn?: string | null;
}): Promise<Record<string, unknown>> {
  const form = new FormData();
  form.append("file", params.file);
  if (params.dateColumn) form.append("date_column", params.dateColumn);
  form.append("metric_columns", params.metricColumns.join(","));
  if (params.entityColumn) {
    form.append("entity_column", params.entityColumn);
  }

  const res = await apiClient.post<{ data: Record<string, unknown> }>("/api/v3/analyze-csv", form);
  return res.data.data ?? res.data;
}


