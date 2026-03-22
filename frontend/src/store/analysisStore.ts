import { create } from "zustand";

export type DataSourceType = "csv" | "api" | "sql" | "nosql";

export type SqlConfig = {
  engine: "postgresql" | "mysql" | "mssql";
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  query: string;
};

export type NoSqlConfig = {
  connectionString: string;
  database: string;
  collection: string;
  queryJson: string;
  limit: string;
};

export type AnalysisStepId =
  | 1 // Data Source Selection
  | 2 // Upload / Connect
  | 3 // Column Selection
  | 4 // Data Understanding
  | 5 // Data Quality
  | 6 // Analysis
  | 7 // Insights
  | 8; // Final Summary

type AnalysisState = {
  currentStep: AnalysisStepId;
  dataSource: DataSourceType | null;

  csvFile: File | null;
  apiUrl: string;
  sql: SqlConfig;
  nosql: NoSqlConfig;

  dateColumn: string;
  entityColumn: string;
  metricColumns: string[];
  columnDiscovery: {
    dateCandidates: string[];
    metricCandidates: string[];
    categoricalCandidates: string[];
  } | null;
  preview: {
    rows: Array<Record<string, unknown>>;
    totalRows: number;
  } | null;
  quality: {
    totalRows: number;
    nullCounts: Record<string, number>;
    duplicateRows: number;
    rowsWithAnyNull: number;
    usableRows: number;
    completenessRatio: number;
  } | null;
  insights: string[];
  summary: {
    title: string;
    bullets: string[];
  } | null;

  setDataSource: (t: DataSourceType) => void;
  setCurrentStep: (step: AnalysisStepId) => void;
  goNext: () => void;
  goBack: () => void;

  setCsvFile: (f: File | null) => void;
  setApiUrl: (url: string) => void;
  setSql: (patch: Partial<SqlConfig>) => void;
  setNoSql: (patch: Partial<NoSqlConfig>) => void;

  setDateColumn: (col: string) => void;
  setEntityColumn: (col: string) => void;
  toggleMetricColumn: (col: string) => void;
  setMetricColumns: (cols: string[]) => void;
  setColumnDiscovery: (payload: AnalysisState["columnDiscovery"]) => void;
  setPreview: (payload: AnalysisState["preview"]) => void;
  setQuality: (payload: AnalysisState["quality"]) => void;
  analysisResult: Record<string, unknown> | null;
  setAnalysisResult: (payload: Record<string, unknown> | null) => void;
  setInsights: (items: string[]) => void;
  setSummary: (payload: AnalysisState["summary"]) => void;

  canGoToStep: (step: AnalysisStepId) => boolean;
  reset: () => void;
};

const defaultSql: SqlConfig = {
  engine: "postgresql",
  host: "localhost",
  port: "",
  database: "",
  username: "",
  password: "",
  query: "SELECT * FROM your_table LIMIT 1000",
};

const defaultNoSql: NoSqlConfig = {
  connectionString: "",
  database: "",
  collection: "",
  queryJson: "{}",
  limit: "1000",
};

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  currentStep: 1,
  dataSource: null,

  csvFile: null,
  apiUrl: "",
  sql: defaultSql,
  nosql: defaultNoSql,

  dateColumn: "",
  entityColumn: "",
  metricColumns: [],
  columnDiscovery: null,
  preview: null,
  quality: null,
  analysisResult: null,
  insights: [],
  summary: null,

  setDataSource: (t) =>
    set((s) => ({
      dataSource: t,
      currentStep: 2,
      csvFile: t === "csv" ? s.csvFile : null,
      apiUrl: t === "api" ? s.apiUrl : "",
      sql: t === "sql" ? s.sql : defaultSql,
      nosql: t === "nosql" ? s.nosql : defaultNoSql,
      dateColumn: "",
      entityColumn: "",
      metricColumns: [],
      columnDiscovery: null,
      preview: null,
      quality: null,
      analysisResult: null,
      insights: [],
      summary: null,
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  goNext: () =>
    set((s) => {
      let next = Math.min(8, s.currentStep + 1) as AnalysisStepId;
      if (s.dataSource !== "csv" && next === 4) {
        next = 6;
      }
      return { currentStep: next };
    }),

  goBack: () =>
    set((s) => {
      let prev = Math.max(1, s.currentStep - 1) as AnalysisStepId;
      if (s.dataSource !== "csv" && prev === 5) {
        prev = 3;
      }
      return { currentStep: prev };
    }),

  setCsvFile: (f) =>
    set({
      csvFile: f,
      currentStep: f ? 3 : 2,
      dateColumn: "",
      metricColumns: [],
      columnDiscovery: null,
      preview: null,
      quality: null,
      analysisResult: null,
      insights: [],
      summary: null,
    }),
  setApiUrl: (url) => set({ apiUrl: url }),
  setSql: (patch) => set((s) => ({ sql: { ...s.sql, ...patch } })),
  setNoSql: (patch) => set((s) => ({ nosql: { ...s.nosql, ...patch } })),

  setDateColumn: (col) => set({ dateColumn: col, entityColumn: "", preview: null, quality: null }),
  setEntityColumn: (col) => set({ entityColumn: col, dateColumn: "", preview: null, quality: null }),
  toggleMetricColumn: (col) =>
    set((s) => {
      const has = s.metricColumns.includes(col);
      const metricColumns = has ? s.metricColumns.filter((c) => c !== col) : [...s.metricColumns, col];
      return { metricColumns, preview: null, quality: null };
    }),
  setMetricColumns: (cols) => set({ metricColumns: cols, preview: null, quality: null }),
  setColumnDiscovery: (payload) => set({ columnDiscovery: payload }),
  setPreview: (payload) => set({ preview: payload }),
  setQuality: (payload) => set({ quality: payload }),
  setAnalysisResult: (payload) => set({ analysisResult: payload }),
  setInsights: (items) => set({ insights: items }),
  setSummary: (payload) => set({ summary: payload }),

  canGoToStep: (step) => {
    const { dataSource, csvFile, apiUrl, sql, nosql, dateColumn, entityColumn, metricColumns, quality, analysisResult, insights, summary } = get();
    if (step === 1) return true;
    if (!dataSource) return false;
    if (step === 2) return true;

    let step3Valid = false;
    if (dataSource === "csv") step3Valid = !!csvFile;
    if (dataSource === "api") step3Valid = !!apiUrl.trim();
    if (dataSource === "sql") step3Valid = !!sql.host.trim() && !!sql.database.trim() && !!sql.query.trim();
    if (dataSource === "nosql") step3Valid = !!nosql.connectionString.trim() && !!nosql.database.trim() && !!nosql.collection.trim() && !!nosql.limit.trim();

    if (step === 3) return step3Valid;
    if (!step3Valid) return false;

    const step4Valid = (!!dateColumn.trim() || !!entityColumn.trim()) && metricColumns.length > 0;
    if (step === 4) return step4Valid;
    if (!step4Valid) return false;

    if (step === 5) return true;

    const step6Valid = dataSource === "csv" ? !!quality : true;
    if (step === 6) return step6Valid;
    if (!step6Valid) return false;

    const step7Valid = !!analysisResult;
    if (step === 7) return step7Valid;
    if (!step7Valid) return false;

    if (step === 8) return insights.length > 0 && !!summary;

    return true;
  },

  reset: () =>
    set({
      currentStep: 1,
      dataSource: null,
      csvFile: null,
      apiUrl: "",
      sql: defaultSql,
      nosql: defaultNoSql,
      dateColumn: "",
      entityColumn: "",
      metricColumns: [],
      columnDiscovery: null,
      preview: null,
      quality: null,
      analysisResult: null,
      insights: [],
      summary: null,
    }),
}));

