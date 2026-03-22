import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMetricValue } from "../../utils/formatters";

export type TrendDataPoint = {
  date: string;
  metric: number;
};

export function TimeSeriesLineChart(props: {
  title: string;
  data: TrendDataPoint[];
  metricName: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-4">
      <div className="text-sm font-black text-[var(--sbpa-dark)]">{props.title}</div>
      <div className="mt-3 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={props.data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={(val: any) => formatMetricValue(val as number)}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              formatter={(val: any) => [formatMetricValue(val as number), props.metricName]}
              labelClassName="font-bold text-[var(--sbpa-dark)]"
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="metric" 
              name={props.metricName} 
              stroke="var(--sbpa-primary)" 
              strokeWidth={3} 
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
