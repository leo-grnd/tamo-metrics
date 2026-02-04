import { cn } from "@/lib/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular";
  animation?: "pulse" | "shimmer" | "none";
}

function Skeleton({
  className,
  variant = "default",
  animation = "pulse",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-zinc-200 dark:bg-zinc-800",
        {
          "rounded-md": variant === "default",
          "h-4 rounded": variant === "text",
          "rounded-full": variant === "circular",
          "rounded-none": variant === "rectangular",
          "animate-pulse": animation === "pulse",
          "animate-shimmer": animation === "shimmer",
        },
        className
      )}
      {...props}
    />
  );
}

/**
 * Table skeleton for loading states
 */
interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
}

function TableSkeleton({ rows = 5, cols = 4, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      {showHeader && (
        <div className="flex gap-4 border-b border-zinc-200 pb-3 dark:border-zinc-800">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-4", i === 0 ? "w-16 flex-none" : "flex-1")}
              variant="text"
            />
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                "h-4",
                colIndex === 0 ? "w-20 flex-none" : "flex-1",
                colIndex === cols - 1 && "w-16 flex-none flex-grow-0"
              )}
              variant="text"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Chart skeleton for loading states
 */
interface ChartSkeletonProps {
  height?: number;
  type?: "bar" | "line" | "pie";
}

function ChartSkeleton({ height = 300, type = "bar" }: ChartSkeletonProps) {
  if (type === "pie") {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Skeleton className="h-48 w-48" variant="circular" />
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className="space-y-4" style={{ height }}>
        <div className="flex items-end gap-1" style={{ height: height - 40 }}>
          {/* Y-axis */}
          <div className="flex h-full flex-col justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" variant="text" />
            ))}
          </div>
          {/* Line area */}
          <div className="relative flex-1">
            <svg className="h-full w-full">
              <path
                d="M0,80 Q50,60 100,70 T200,50 T300,60 T400,40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-zinc-200 dark:text-zinc-800"
              />
            </svg>
          </div>
        </div>
        {/* X-axis labels */}
        <div className="ml-10 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-10" variant="text" />
          ))}
        </div>
      </div>
    );
  }

  // Bar chart
  return (
    <div className="space-y-4" style={{ height }}>
      <div className="flex items-end gap-2" style={{ height: height - 40 }}>
        {/* Y-axis */}
        <div className="flex h-full flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" variant="text" />
          ))}
        </div>
        {/* Bars */}
        <div className="flex flex-1 items-end justify-around gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full max-w-12 rounded-t"
              style={{ height: `${30 + Math.random() * 50}%` }}
            />
          ))}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="ml-10 flex justify-around">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" variant="text" />
        ))}
      </div>
    </div>
  );
}

/**
 * Card skeleton for stat cards
 */
function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" variant="text" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-3 w-16" variant="text" />
      </div>
    </div>
  );
}

/**
 * Stats grid skeleton
 */
function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Field stats skeleton
 */
function FieldStatsSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-12" variant="text" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

/**
 * Sidebar skeleton
 */
function SidebarSkeleton() {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="h-4 w-32 mb-4" variant="text" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Skeleton className="h-4 w-4" variant="circular" />
          <Skeleton className="h-4 flex-1" variant="text" />
          <Skeleton className="h-4 w-8" variant="text" />
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  TableSkeleton,
  ChartSkeleton,
  StatCardSkeleton,
  StatsGridSkeleton,
  FieldStatsSkeleton,
  SidebarSkeleton,
};
