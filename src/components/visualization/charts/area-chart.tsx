"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatShortDate, formatCompactNumber } from "@/lib/utils/format";

interface AreaChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  gradientId?: string;
}

export function AreaChart({
  data,
  xKey,
  yKey,
  color = "#f59e0b",
  height = 300,
  gradientId = "areaGradient",
}: AreaChartProps) {
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: "#71717a" }}
          tickFormatter={(value) => {
            if (typeof value === "string" && value.includes("-")) {
              return formatShortDate(new Date(value));
            }
            return value;
          }}
          stroke="#e4e4e7"
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
          itemStyle={{ color }}
          labelFormatter={(value) => {
            if (typeof value === "string" && value.includes("-")) {
              return new Date(value).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            }
            return value;
          }}
          formatter={(value) => [formatCompactNumber(value as number), "Documents"]}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
