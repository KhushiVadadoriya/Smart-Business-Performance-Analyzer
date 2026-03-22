import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { loadHistory, type HistoryItem } from "../../utils/history";
import { useAnalysisStore } from "../../store/analysisStore";

export function DashboardPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const reset = useAnalysisStore((s) => s.reset);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-lg font-black text-[var(--sbpa-dark)]">
            Dashboard
          </div>
          <div className="text-sm text-[var(--sbpa-dark)]/60">
            Start a new analysis or review recent results.
          </div>
        </div>
        <Link to="/analysis" onClick={() => reset()}>
          <Button>Start New Analysis</Button>
        </Link>
      </Card>

      <Card>
        <div className="text-sm font-bold text-[var(--sbpa-dark)]">Recent analyses</div>
        {items.length ? (
          <div className="mt-3 space-y-2">
            {items.slice(0, 5).map((h, idx) => (
              <div key={`${h.date}-${idx}`} className="rounded-2xl bg-[var(--sbpa-card)]/80 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-black text-[var(--sbpa-dark)]">{h.fileName}</div>
                  <div className="text-xs font-semibold text-[var(--sbpa-dark)]/55">
                    {new Date(h.date).toLocaleString()}
                  </div>
                </div>
                <div className="mt-1 text-sm text-[var(--sbpa-dark)]/70 line-clamp-2">{h.summary}</div>
              </div>
            ))}
            <Link to="/history" className="inline-block text-sm font-semibold underline text-[var(--sbpa-dark)]">
              View full history
            </Link>
          </div>
        ) : (
          <div className="mt-2 text-sm text-[var(--sbpa-dark)]/60">No saved analyses yet.</div>
        )}
      </Card>
    </div>
  );
}

