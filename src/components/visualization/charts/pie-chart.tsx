"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCompactNumber, formatPercentage } from "@/lib/utils/format";

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  height?: number;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#06b6d4",
  "#84cc16",
  "#6366f1",
  "#14b8a6",
];

export function PieChart({
  data,
  height = 300,
  showLegend = false,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-zinc-400"
        style={{ height }}
      >
        Aucune donnée disponible
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value, name) => [
            `${formatCompactNumber(value as number)} (${formatPercentage(((value as number) / total) * 100, false)})`,
            name as string,
          ]}
        />
        {showLegend && (
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value, entry) => {
              const item = data.find((d) => d.name === value);
              const percentage = item
                ? formatPercentage((item.value / total) * 100, false)
                : "";
              return (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {value} ({percentage})
                </span>
              );
            }}
            wrapperStyle={{ fontSize: "12px" }}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
