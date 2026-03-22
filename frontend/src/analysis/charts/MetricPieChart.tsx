import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatMetricValue } from "../../utils/formatters";

export type PieDatum = {
  name: string;
  value: number;
};

export function MetricPieChart(props: {
  title: string;
  data: PieDatum[];
  isDonut?: boolean;
}) {
  const COLORS = [
    "var(--sbpa-primary)", "#f43f5e", "#f59e0b", "#10b981", "#8b5cf6", 
    "#ec4899", "#0ea5e9", "#f97316", "#84cc16", "#14b8a6"
  ];

  return (
    <div className="rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] p-4">
      <div className="text-sm font-black text-[var(--sbpa-dark)]">{props.title}</div>
      <div className="mt-3 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={props.data}
              cx="50%"
              cy="50%"
              innerRadius={props.isDonut ? 50 : 0}
              outerRadius={75}
              fill="#8884d8"
              paddingAngle={props.isDonut ? 2 : 0}
              dataKey="value"
              nameKey="name"
            >
              {props.data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.name === "Other" ? "#cbd5e1" : COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [formatMetricValue(Number(value)), "Amount"]} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
