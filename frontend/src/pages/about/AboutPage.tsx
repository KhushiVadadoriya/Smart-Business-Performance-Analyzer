import { Card } from "../../components/Card";

export function AboutPage() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="inline-flex rounded-full bg-[var(--sbpa-primary)]/12 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--sbpa-dark)]">
          About SBPA
        </div>
        <div className="mt-3 text-2xl font-black text-[var(--sbpa-dark)]">
          Smart Business Performance Analyzer
        </div>
        <div className="mt-2 max-w-3xl text-sm text-[var(--sbpa-dark)]/70">
          A business analytics platform that converts scattered operational data into clear, executive-ready insights.
          SBPA helps teams move from data collection to confident decisions with a guided, repeatable workflow.
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/80 p-3">
            <div className="text-xs font-bold uppercase text-[var(--sbpa-dark)]/50">Focus</div>
            <div className="mt-1 text-sm font-semibold text-[var(--sbpa-dark)]">Business performance intelligence</div>
          </div>
          <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/80 p-3">
            <div className="text-xs font-bold uppercase text-[var(--sbpa-dark)]/50">Output</div>
            <div className="mt-1 text-sm font-semibold text-[var(--sbpa-dark)]">Charts, insights, and executive summary</div>
          </div>
          <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/80 p-3">
            <div className="text-xs font-bold uppercase text-[var(--sbpa-dark)]/50">Users</div>
            <div className="mt-1 text-sm font-semibold text-[var(--sbpa-dark)]">Operations, analysts, founders, managers</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="text-lg font-black text-[var(--sbpa-dark)]">What is SBPA?</div>
          <div className="mt-3 space-y-3 text-sm text-[var(--sbpa-dark)]/70">
            <p>
              <span className="font-bold text-[var(--sbpa-dark)]">SBPA</span> is a decision-support system that standardizes the way business data is ingested,
              analyzed, and explained.
            </p>
            <p>
              It combines ingestion, quality checks, metrics analysis, and AI-generated narrative insights in one
              workspace so teams can avoid fragmented reporting.
            </p>
            <p>
              The goal is simple: reduce time spent preparing data and increase time spent making strategic decisions.
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-lg font-black text-[var(--sbpa-dark)]">Why was it built?</div>
          <div className="mt-3 space-y-3 text-sm text-[var(--sbpa-dark)]/70">
            <p>
              Many teams operate with spreadsheets, disconnected tools, and inconsistent KPI definitions.
            </p>
            <p>
              SBPA was built to create a single, reliable analytics flow that improves trust in numbers and shortens
              decision cycles.
            </p>
            <p>
              It supports both technical and non-technical stakeholders by delivering insights in business language,
              not just raw metrics.
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">How does it work?</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/80 p-3">
            <div className="text-xs font-bold uppercase text-[var(--sbpa-primary)]">Step 1</div>
            <div className="mt-1 text-sm font-semibold text-[var(--sbpa-dark)]">Ingest Data</div>
            <div className="mt-1 text-sm text-[var(--sbpa-dark)]/65">Upload or connect data sources and select the working dataset.</div>
          </div>
          <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/80 p-3">
            <div className="text-xs font-bold uppercase text-[var(--sbpa-primary)]">Step 2</div>
            <div className="mt-1 text-sm font-semibold text-[var(--sbpa-dark)]">Validate Quality</div>
            <div className="mt-1 text-sm text-[var(--sbpa-dark)]/65">Assess structure, completeness, and consistency before analysis.</div>
          </div>
          <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/80 p-3">
            <div className="text-xs font-bold uppercase text-[var(--sbpa-primary)]">Step 3</div>
            <div className="mt-1 text-sm font-semibold text-[var(--sbpa-dark)]">Generate Insights</div>
            <div className="mt-1 text-sm text-[var(--sbpa-dark)]/65">Run analytics to identify trends, anomalies, and business drivers.</div>
          </div>
          <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/80 p-3">
            <div className="text-xs font-bold uppercase text-[var(--sbpa-primary)]">Step 4</div>
            <div className="mt-1 text-sm font-semibold text-[var(--sbpa-dark)]">Act with Confidence</div>
            <div className="mt-1 text-sm text-[var(--sbpa-dark)]/65">Review visual summaries and convert findings into decisions.</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">Platform Snapshot</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/80 p-3">
            <div className="text-xs font-bold uppercase text-[var(--sbpa-dark)]/50">Business Value</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--sbpa-dark)]/70">
              <li>Faster reporting cycles with guided analysis.</li>
              <li>Standardized insight generation across teams.</li>
              <li>Clear communication for executive stakeholders.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)]/80 p-3">
            <div className="text-xs font-bold uppercase text-[var(--sbpa-dark)]/50">Technology</div>
            <div className="mt-2 text-sm text-[var(--sbpa-dark)]/70">
              React + TypeScript (Vite), Tailwind CSS v4, Zustand, Axios, Recharts, FastAPI backend.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

