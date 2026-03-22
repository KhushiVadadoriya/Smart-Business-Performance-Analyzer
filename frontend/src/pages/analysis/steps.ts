import type { AnalysisStepId } from "../../store/analysisStore";

export const ANALYSIS_STEPS: Array<{ id: AnalysisStepId; title: string; subtitle: string }> = [
  { id: 1, title: "Data Source", subtitle: "Choose CSV, API, SQL, NoSQL" },
  { id: 2, title: "Upload / Connect", subtitle: "Provide the data source details" },
  { id: 3, title: "Column Selection", subtitle: "Pick date + metrics" },
  { id: 4, title: "Data Understanding", subtitle: "Preview & data types" },
  { id: 5, title: "Data Quality", subtitle: "Missing values & warnings" },
  { id: 6, title: "Analysis", subtitle: "Charts and tables" },
  { id: 7, title: "Insights", subtitle: "Key findings" },
  { id: 8, title: "Final Summary", subtitle: "Executive-ready narrative" },
];

