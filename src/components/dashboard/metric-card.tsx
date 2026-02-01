import { cn } from "@/lib/utils/cn";
import { formatCompactNumber, formatPercentage } from "@/lib/utils/format";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  previousValue,
  subtitle,
  trend,
  icon,
  className,
}: MetricCardProps) {
  const changePercent = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : null;

  const determinedTrend =
    trend || (changePercent ? (changePercent >= 0 ? "up" : "down") : "neutral");

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatCompactNumber(value)}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
          {changePercent !== null && (
            <div className="flex items-center gap-1">
              {determinedTrend === "up" && (
                <svg
                  className="h-3 w-3 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              )}
              {determinedTrend === "down" && (
                <svg
                  className="h-3 w-3 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              <span
                className={cn("text-xs font-medium", {
                  "text-emerald-600 dark:text-emerald-500":
                    determinedTrend === "up",
                  "text-red-600 dark:text-red-500": determinedTrend === "down",
                  "text-zinc-500 dark:text-zinc-400":
                    determinedTrend === "neutral",
                })}
              >
                {formatPercentage(changePercent)}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
