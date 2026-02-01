import { cn } from "@/lib/utils/cn";
import { formatCompactNumber, formatPercentage } from "@/lib/utils/format";
import { Card } from "./card";

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  change,
  icon,
  className,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatCompactNumber(value)}
          </p>
          {change !== undefined && (
            <p
              className={cn("text-sm font-medium", {
                "text-emerald-600 dark:text-emerald-500": change >= 0,
                "text-red-600 dark:text-red-500": change < 0,
              })}
            >
              {formatPercentage(change)} ce mois
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export { StatCard };
