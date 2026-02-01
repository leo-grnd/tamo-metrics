"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCompactNumber } from "@/lib/utils/format";

interface BarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  showGradient?: boolean;
}

export function BarChart({
  data,
  xKey,
  yKey,
  color = "#f59e0b",
  height = 300,
  showGradient = true,
}: BarChartProps) {
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

  const colors = showGradient
    ? [
        "#f59e0b",
        "#f97316",
        "#fb923c",
        "#fdba74",
        "#fed7aa",
        "#ffedd5",
      ]
    : [color];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "#71717a" }}
          stroke="#e4e4e7"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#71717a" }}
          stroke="#e4e4e7"
          width={50}
          tickFormatter={(value) => formatCompactNumber(value)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#a1a1aa" }}
          formatter={(value) => [
            formatCompactNumber(value as number),
            "Documents",
          ]}
        />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
