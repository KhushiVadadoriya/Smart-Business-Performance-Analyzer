import { clsx } from "clsx";

import { Card } from "../../components/Card";
import type { DataSourceType } from "../../store/analysisStore";
import { useAnalysisStore } from "../../store/analysisStore";

const sources: Array<{
  id: DataSourceType;
  title: string;
  desc: string;
}> = [
  { id: "csv", title: "CSV Upload", desc: "Upload a CSV file for analysis." },
  { id: "api", title: "API URL", desc: "Fetch data from a REST endpoint." },
  { id: "sql", title: "SQL Database", desc: "Connect using database credentials." },
  { id: "nosql", title: "NoSQL Database", desc: "Connect via connection string." },
];

export function Step1DataSource() {
  const dataSource = useAnalysisStore((s) => s.dataSource);
  const setDataSource = useAnalysisStore((s) => s.setDataSource);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">
          Step 1 — Data Source Selection
        </div>
        <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
          Choose how you want to provide data.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sources.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setDataSource(s.id)}
            className="text-left"
          >
            <Card
              className={clsx(
                "h-full transition hover:-translate-y-[1px] hover:shadow-md",
                dataSource === s.id && "ring-2 ring-[var(--sbpa-primary)]",
              )}
            >
              <div className="text-sm font-black text-[var(--sbpa-dark)]">{s.title}</div>
              <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">{s.desc}</div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

