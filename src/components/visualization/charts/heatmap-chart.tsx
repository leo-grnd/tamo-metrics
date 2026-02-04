"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

interface HeatmapChartProps {
  data: { date: Date | string; value?: number }[];
  height?: number;
  title?: string;
}

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Convert data to a grid format for heatmap display
 */
function buildHeatmapGrid(data: { date: Date | string; value?: number }[]) {
  // Initialize 7x24 grid (days x hours)
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

  data.forEach(({ date, value = 1 }) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return;

    const day = d.getDay();
    const hour = d.getHours();
    grid[day][hour] += value;
  });

  return grid;
}

/**
 * Get color class based on value intensity
 */
function getColorClass(value: number, maxValue: number): string {
  if (value === 0) return "bg-zinc-100 dark:bg-zinc-800";

  const intensity = maxValue > 0 ? value / maxValue : 0;

  if (intensity < 0.2) return "bg-amber-100 dark:bg-amber-900/20";
  if (intensity < 0.4) return "bg-amber-200 dark:bg-amber-800/40";
  if (intensity < 0.6) return "bg-amber-300 dark:bg-amber-700/60";
  if (intensity < 0.8) return "bg-amber-400 dark:bg-amber-600/80";
  return "bg-amber-500 dark:bg-amber-500";
}

export function HeatmapChart({ data, height = 280, title }: HeatmapChartProps) {
  const heatmapData = useMemo(() => buildHeatmapGrid(data), [data]);

  const maxValue = useMemo(() => {
    return Math.max(...heatmapData.flat(), 1);
  }, [heatmapData]);

  const totalCount = useMemo(() => {
    return heatmapData.flat().reduce((a, b) => a + b, 0);
  }, [heatmapData]);

  // Find peak day and hour
  const peak = useMemo(() => {
    let maxVal = 0;
    let peakDay = 0;
    let peakHour = 0;

    heatmapData.forEach((dayData, day) => {
      dayData.forEach((val, hour) => {
        if (val > maxVal) {
          maxVal = val;
          peakDay = day;
          peakHour = hour;
        }
      });
    });

    return { day: DAYS_FR[peakDay], hour: peakHour, value: maxVal };
  }, [heatmapData]);

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
    <div className="space-y-3" style={{ minHeight: height }}>
      {title && (
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
      )}

      {/* Hour labels */}
      <div className="flex pl-12">
        {HOURS.filter((_, i) => i % 3 === 0).map((hour) => (
          <div
            key={hour}
            className="flex-1 text-center text-[10px] text-zinc-400"
            style={{ width: `${100 / 8}%` }}
          >
            {hour}h
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-1">
        {DAYS_FR.map((day, dayIndex) => (
          <div key={day} className="flex items-center gap-1">
            <div className="w-10 text-right text-xs text-zinc-500">{day}</div>
            <div className="flex flex-1 gap-0.5">
              {HOURS.map((hour) => {
                const value = heatmapData[dayIndex][hour];
                return (
                  <div
                    key={hour}
                    className={cn(
                      "h-6 flex-1 rounded-sm transition-all hover:ring-2 hover:ring-amber-500/50",
                      getColorClass(value, maxValue)
                    )}
                    title={`${day} ${hour}h-${hour + 1}h: ${value} document${value !== 1 ? "s" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Moins</span>
          <div className="flex gap-0.5">
            {[
              "bg-zinc-100 dark:bg-zinc-800",
              "bg-amber-100 dark:bg-amber-900/20",
              "bg-amber-200 dark:bg-amber-800/40",
              "bg-amber-300 dark:bg-amber-700/60",
              "bg-amber-400 dark:bg-amber-600/80",
              "bg-amber-500 dark:bg-amber-500",
            ].map((color, i) => (
              <div key={i} className={cn("h-3 w-3 rounded-sm", color)} />
            ))}
          </div>
          <span className="text-xs text-zinc-400">Plus</span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-zinc-500">
          <span>
            Total:{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {totalCount.toLocaleString("fr-FR")}
            </span>
          </span>
          <span>
            Pic:{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {peak.day} {peak.hour}h ({peak.value})
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Heatmap variant showing month/day pattern
 */
interface MonthHeatmapProps {
  data: { date: Date | string; value?: number }[];
  height?: number;
  title?: string;
}

export function MonthHeatmapChart({ data, height = 200, title }: MonthHeatmapProps) {
  const { grid, maxValue, weeks, months } = useMemo(() => {
    // Build a calendar-style grid for the last 52 weeks
    const now = new Date();
    const weeksCount = 52;
    const grid: { date: Date; value: number }[][] = [];

    // Create a map of date -> value
    const valueMap = new Map<string, number>();
    data.forEach(({ date, value = 1 }) => {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return;
      const key = d.toISOString().split("T")[0];
      valueMap.set(key, (valueMap.get(key) || 0) + value);
    });

    // Find the start of the first week (Sunday)
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - weeksCount * 7);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Build the grid
    let maxVal = 0;
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let week = 0; week < weeksCount; week++) {
      const weekData: { date: Date; value: number }[] = [];

      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7 + day);

        // Track month changes
        if (date.getMonth() !== lastMonth) {
          lastMonth = date.getMonth();
          monthLabels.push({
            month: date.toLocaleDateString("fr-FR", { month: "short" }),
            weekIndex: week,
          });
        }

        const key = date.toISOString().split("T")[0];
        const value = valueMap.get(key) || 0;
        maxVal = Math.max(maxVal, value);

        weekData.push({ date, value });
      }

      grid.push(weekData);
    }

    return {
      grid,
      maxValue: maxVal || 1,
      weeks: weeksCount,
      months: monthLabels,
    };
  }, [data]);

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
    <div className="space-y-2" style={{ minHeight: height }}>
      {title && (
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
      )}

      {/* Month labels */}
      <div className="flex pl-8">
        {months.map(({ month, weekIndex }, i) => (
          <div
            key={i}
            className="text-[10px] text-zinc-400"
            style={{
              marginLeft: i === 0 ? `${(weekIndex / weeks) * 100}%` : undefined,
              width: `${((months[i + 1]?.weekIndex || weeks) - weekIndex) / weeks * 100}%`,
            }}
          >
            {month}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col justify-around pr-1 text-[10px] text-zinc-400">
          <span>Lun</span>
          <span>Mer</span>
          <span>Ven</span>
        </div>

        {/* Calendar grid */}
        <div className="flex flex-1 gap-0.5">
          {grid.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map(({ date, value }, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn(
                    "h-2.5 w-2.5 rounded-sm transition-all hover:ring-1 hover:ring-amber-500/50",
                    getColorClass(value, maxValue)
                  )}
                  title={`${date.toLocaleDateString("fr-FR")}: ${value} document${value !== 1 ? "s" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <span className="text-[10px] text-zinc-400">Moins</span>
        <div className="flex gap-0.5">
          {[
            "bg-zinc-100 dark:bg-zinc-800",
            "bg-amber-200 dark:bg-amber-800/40",
            "bg-amber-400 dark:bg-amber-600/80",
            "bg-amber-500",
          ].map((color, i) => (
            <div key={i} className={cn("h-2.5 w-2.5 rounded-sm", color)} />
          ))}
        </div>
        <span className="text-[10px] text-zinc-400">Plus</span>
      </div>
    </div>
  );
}
