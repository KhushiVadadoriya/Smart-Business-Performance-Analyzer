import type { MetricBarDatum } from "./charts/MetricBars";
import { formatPercent } from "../utils/formatters";

export function TopMoversTable({ data }: { data: MetricBarDatum[] | null }) {
  if (!data || data.length === 0) return null;
  
  // Sort by absolute magnitude of change to find the top movers
  const sorted = [...data].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 5);
  
  return (
    <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-4 h-full">
      <div className="text-sm font-black text-[var(--sbpa-dark)]">Top Movers</div>
      <div className="mt-1 text-xs text-[var(--sbpa-dark)]/60">Metrics with the largest percentage shifts.</div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--sbpa-dark)]/5 text-[var(--sbpa-dark)]/50">
              <th className="pb-2 font-semibold">Metric</th>
              <th className="pb-2 font-semibold text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {sorted.map((item) => {
              const parsed = formatPercent(item.value, true);
              const isPositive = item.value > 0;
              const isNegative = item.value < 0;
              
              return (
                <tr key={item.metric} className="group hover:bg-[var(--sbpa-dark)]/[0.02]">
                  <td className="py-3 text-[var(--sbpa-dark)]/80 font-medium group-hover:text-[var(--sbpa-dark)] transition-colors">{item.metric}</td>
                  <td className={`py-3 text-right font-bold transition-colors ${isPositive ? "text-emerald-600" : isNegative ? "text-rose-600" : "text-[var(--sbpa-dark)]/60"}`}>
                    {parsed}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
