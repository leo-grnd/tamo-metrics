"use client";

import { useState, useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate, formatCompactNumber } from "@/lib/utils/format";

interface TrendData {
  date: string;
  count: number;
}

interface CollectionComparisonProps {
  collections: { name: string; documentCount: number }[];
  trendsData: Record<string, TrendData[]>;
  height?: number;
}

const COLORS = [
  "#f59e0b", // amber-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#f97316", // orange-500
];

export function CollectionComparison({
  collections,
  trendsData,
  height = 350,
}: CollectionComparisonProps) {
  // Default to first two collections
  const [selectedCollections, setSelectedCollections] = useState<string[]>(() =>
    collections.slice(0, 2).map((c) => c.name)
  );

  // Merge data for comparison
  const comparisonData = useMemo(() => {
    // Get all unique dates
    const dates = new Set<string>();
    selectedCollections.forEach((col) => {
      trendsData[col]?.forEach((d) => dates.add(d.date));
    });

    // Sort dates
    const sortedDates = Array.from(dates).sort();

    // Create merged data points
    return sortedDates.map((date) => {
      const point: Record<string, string | number> = { date };
      selectedCollections.forEach((col) => {
        const dayData = trendsData[col]?.find((d) => d.date === date);
        point[col] = dayData?.count || 0;
      });
      return point;
    });
  }, [selectedCollections, trendsData]);

  // Calculate comparison stats
  const stats = useMemo(() => {
    return selectedCollections.map((col, index) => {
      const data = trendsData[col] || [];
      const total = data.reduce((sum, d) => sum + d.count, 0);
      const avg = data.length > 0 ? total / data.length : 0;
      const max = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 0;

      return {
        name: col,
        color: COLORS[index % COLORS.length],
        total,
        avg: Math.round(avg * 10) / 10,
        max,
        documentCount: collections.find((c) => c.name === col)?.documentCount || 0,
      };
    });
  }, [selectedCollections, trendsData, collections]);

  const handleCollectionChange = (index: number, value: string) => {
    setSelectedCollections((prev) => {
      const newSelected = [...prev];
      newSelected[index] = value;
      return newSelected;
    });
  };

  const addCollection = () => {
    if (selectedCollections.length < 4) {
      const available = collections.find(
        (c) => !selectedCollections.includes(c.name)
      );
      if (available) {
        setSelectedCollections((prev) => [...prev, available.name]);
      }
    }
  };

  const removeCollection = (index: number) => {
    if (selectedCollections.length > 1) {
      setSelectedCollections((prev) => prev.filter((_, i) => i !== index));
    }
  };

  if (collections.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-zinc-500">
          Il faut au moins 2 collections pour comparer
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-base">Comparaison des collections</CardTitle>

          {/* Collection selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedCollections.map((col, index) => (
              <div key={index} className="flex items-center gap-1">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <select
                  value={col}
                  onChange={(e) => handleCollectionChange(index, e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {collections.map((c) => (
                    <option
                      key={c.name}
                      value={c.name}
                      disabled={
                        selectedCollections.includes(c.name) && c.name !== col
                      }
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
                {selectedCollections.length > 1 && (
                  <button
                    onClick={() => removeCollection(index)}
                    className="ml-1 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                    title="Retirer"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {selectedCollections.length < 4 &&
              selectedCollections.length < collections.length && (
                <button
                  onClick={addCollection}
                  className="rounded-lg border border-dashed border-zinc-300 px-2 py-1 text-sm text-zinc-500 hover:border-amber-500 hover:text-amber-600 dark:border-zinc-700"
                >
                  + Ajouter
                </button>
              )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart */}
        {comparisonData.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart
              data={comparisonData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#71717a" }}
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
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {value}
                  </span>
                )}
              />
              {selectedCollections.map((col, index) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: COLORS[index % COLORS.length] }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        ) : (
          <div
            className="flex items-center justify-center text-zinc-400"
            style={{ height }}
          >
            Aucune donnée de tendance disponible
          </div>
        )}

        {/* Stats comparison table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2 text-left font-medium text-zinc-500">
                  Collection
                </th>
                <th className="px-4 py-2 text-right font-medium text-zinc-500">
                  Documents
                </th>
                <th className="px-4 py-2 text-right font-medium text-zinc-500">
                  Total (30j)
                </th>
                <th className="px-4 py-2 text-right font-medium text-zinc-500">
                  Moy./jour
                </th>
                <th className="px-4 py-2 text-right font-medium text-zinc-500">
                  Pic
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr
                  key={stat.name}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: stat.color }}
                      />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {stat.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-zinc-700 dark:text-zinc-300">
                    {stat.documentCount.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-zinc-700 dark:text-zinc-300">
                    {stat.total.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-zinc-700 dark:text-zinc-300">
                    {stat.avg.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-zinc-700 dark:text-zinc-300">
                    {stat.max.toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
