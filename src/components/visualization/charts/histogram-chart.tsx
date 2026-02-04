"use client";

import { useMemo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCompactNumber } from "@/lib/utils/format";

interface HistogramChartProps {
  data: number[];
  bins?: number;
  color?: string;
  height?: number;
  showMean?: boolean;
  showMedian?: boolean;
  title?: string;
}

interface HistogramBin {
  range: string;
  rangeStart: number;
  rangeEnd: number;
  count: number;
}

/**
 * Calculate histogram bins from numeric data
 */
function calculateHistogram(data: number[], bins: number): HistogramBin[] {
  if (data.length === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);

  // Handle case where all values are the same
  if (min === max) {
    return [
      {
        range: String(min),
        rangeStart: min,
        rangeEnd: max,
        count: data.length,
      },
    ];
  }

  const binWidth = (max - min) / bins;

  const histogram: HistogramBin[] = Array.from({ length: bins }, (_, i) => {
    const rangeStart = min + i * binWidth;
    const rangeEnd = min + (i + 1) * binWidth;

    // Format range label based on magnitude
    let rangeLabel: string;
    if (binWidth < 1) {
      rangeLabel = rangeStart.toFixed(2);
    } else if (binWidth < 10) {
      rangeLabel = rangeStart.toFixed(1);
    } else {
      rangeLabel = formatCompactNumber(Math.round(rangeStart));
    }

    return {
      range: rangeLabel,
      rangeStart,
      rangeEnd,
      count: 0,
    };
  });

  // Count values in each bin
  data.forEach((value) => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
    histogram[binIndex].count++;
  });

  return histogram;
}

/**
 * Calculate statistics for the data
 */
function calculateStats(data: number[]) {
  if (data.length === 0) return { mean: 0, median: 0 };

  const sorted = [...data].sort((a, b) => a - b);
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / data.length;

  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  return { mean, median };
}

export function HistogramChart({
  data,
  bins = 20,
  color = "#f59e0b",
  height = 300,
  showMean = true,
  showMedian = false,
  title,
}: HistogramChartProps) {
  const histogram = useMemo(() => calculateHistogram(data, bins), [data, bins]);
  const stats = useMemo(() => calculateStats(data), [data]);

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

  // Find the bin index for reference lines
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;

  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={histogram}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 10, fill: "#71717a" }}
            interval={Math.max(0, Math.floor(bins / 8) - 1)}
            stroke="#e4e4e7"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#71717a" }}
            stroke="#e4e4e7"
            width={40}
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
            formatter={(value) => [`${value} documents`, "Valeur"]}
            labelFormatter={(_label, payload) => {
              if (payload && payload[0]) {
                const bin = payload[0].payload as HistogramBin;
                return `${bin.rangeStart.toLocaleString("fr-FR")} - ${bin.rangeEnd.toLocaleString("fr-FR")}`;
              }
              return "Intervalle";
            }}
          />
          <Bar
            dataKey="count"
            fill={color}
            radius={[2, 2, 0, 0]}
            maxBarSize={50}
          />

          {/* Mean reference line */}
          {showMean && binWidth > 0 && (
            <ReferenceLine
              x={histogram[Math.min(Math.floor((stats.mean - min) / binWidth), bins - 1)]?.range}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Moy: ${stats.mean.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}`,
                fill: "#ef4444",
                fontSize: 11,
                position: "top",
              }}
            />
          )}

          {/* Median reference line */}
          {showMedian && binWidth > 0 && (
            <ReferenceLine
              x={histogram[Math.min(Math.floor((stats.median - min) / binWidth), bins - 1)]?.range}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Méd: ${stats.median.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}`,
                fill: "#3b82f6",
                fontSize: 11,
                position: "top",
              }}
            />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>

      {/* Stats summary */}
      <div className="flex justify-center gap-6 text-xs text-zinc-500">
        <span>
          Min:{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {Math.min(...data).toLocaleString("fr-FR")}
          </span>
        </span>
        <span>
          Max:{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {Math.max(...data).toLocaleString("fr-FR")}
          </span>
        </span>
        <span>
          Moy:{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {stats.mean.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}
          </span>
        </span>
        <span>
          n={" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {data.length.toLocaleString("fr-FR")}
          </span>
        </span>
      </div>
    </div>
  );
}
