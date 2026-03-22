import { Card } from "../../components/Card";

export function AboutPage() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">About</div>
        <div className="mt-2 space-y-3 text-sm text-[var(--sbpa-dark)]/70">
          <p>
            <span className="font-bold">Smart Business Performance Analyzer</span>{" "}
            is a business-focused AI analytics platform that helps teams ingest
            data from multiple sources and produce charts, insights, and an
            executive-ready summary.
          </p>
          <p>
            <span className="font-bold">Problem it solves</span>: turning messy
            operational data into clear performance signals and decisions.
          </p>
          <p>
            <span className="font-bold">Tech stack</span>: React + TypeScript
            (Vite), Tailwind CSS v4, Zustand, Axios, Recharts, FastAPI backend.
          </p>
          <p>
            <span className="font-bold">Creator</span>: (Add your name/company
            here.)
          </p>
        </div>
      </Card>
    </div>
  );
}

