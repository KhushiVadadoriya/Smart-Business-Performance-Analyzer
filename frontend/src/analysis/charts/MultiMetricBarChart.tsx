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
import { formatMetricValue } from "../../utils/formatters";

export function MultiMetricBarChart(props: {
  title: string;
  data: any[];
  dataKeys: string[];
  colors?: string[];
}) {
  const defaultColors = ["var(--sbpa-primary)", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6"];
  
  return (
    <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-4">
      <div className="text-sm font-black text-[var(--sbpa-dark)]">{props.title}</div>
      <div className="mt-3 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={props.data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(val: any) => formatMetricValue(val as number)} />
            <Tooltip />
            <Legend />
            {props.dataKeys.map((key, i) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={props.colors?.[i] ?? defaultColors[i % defaultColors.length]} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
