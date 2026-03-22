import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMetricValue, formatPercent } from "../../utils/formatters";

export type MetricBarDatum = {
  metric: string;
  value: number;
};

export function MetricBars(props: {
  title: string;
  data: MetricBarDatum[];
  valueLabel?: string;
  valueType?: "percent" | "number";
}) {
  return (
    <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-4">
      <div className="text-sm font-black text-[var(--sbpa-dark)]">{props.title}</div>
      <div className="mt-3 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={props.data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={(val: any) => props.valueType === "percent" ? formatPercent(val as number, true) : formatMetricValue(val as number)}
            />
            <Tooltip 
              formatter={(val: any) => {
                const numVal = val as number;
                const formatted = props.valueType === "percent" ? formatPercent(numVal, true) : formatMetricValue(numVal);
                return [formatted, props.valueLabel ?? "Value"];
              }}
            />
            <Legend />
            <Bar dataKey="value" name={props.valueLabel ?? "Value"} fill="var(--sbpa-primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

