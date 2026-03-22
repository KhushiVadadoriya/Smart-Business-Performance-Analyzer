import { useEffect, useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { clearHistory, loadHistory, type HistoryItem } from "../../utils/history";

export function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  function onClear() {
    clearHistory();
    setItems([]);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black text-[var(--sbpa-dark)]">History</div>
            <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
              Past analyses saved locally in this browser.
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={onClear} disabled={!items.length}>
            Clear history
          </Button>
        </div>
      </Card>

      {items.length ? (
        <div className="space-y-3">
          {items.map((h, idx) => (
            <Card key={`${h.date}-${idx}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-black text-[var(--sbpa-dark)]">{h.fileName}</div>
                <div className="text-xs font-semibold text-[var(--sbpa-dark)]/55">
                  {new Date(h.date).toLocaleString()}
                </div>
              </div>
              <div className="mt-2 text-sm text-[var(--sbpa-dark)]/70">{h.summary}</div>
              {h.insights?.length ? (
                <div className="mt-3">
                  <div className="text-xs font-black text-[var(--sbpa-dark)]">Insights</div>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--sbpa-dark)]/70">
                    {h.insights.slice(0, 6).map((t, i) => (
                      <li key={i}>
                        <span className="font-black text-[var(--sbpa-dark)]">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-sm text-[var(--sbpa-dark)]/60">No history yet. Save a run from Step 8.</div>
        </Card>
      )}
    </div>
  );
}

