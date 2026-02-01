import type { CollectionInfo } from "@/lib/firebase/types";

/**
 * Calculate growth percentage between two values
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get top collections by document count
 */
export function getTopCollections(
  collections: CollectionInfo[],
  limit: number = 5
): CollectionInfo[] {
  return [...collections]
    .sort((a, b) => b.documentCount - a.documentCount)
    .slice(0, limit);
}

/**
 * Calculate total documents across all collections
 */
export function getTotalDocuments(collections: CollectionInfo[]): number {
  return collections.reduce((sum, col) => sum + col.documentCount, 0);
}

/**
 * Get collection distribution for pie chart
 */
export function getCollectionDistribution(
  collections: CollectionInfo[]
): { name: string; value: number; percentage: number }[] {
  const total = getTotalDocuments(collections);

  return collections.map((col) => ({
    name: col.name,
    value: col.documentCount,
    percentage: total > 0 ? Math.round((col.documentCount / total) * 100) : 0,
  }));
}

/**
 * Aggregate daily counts into weekly totals
 */
export function aggregateToWeekly(
  dailyData: { date: string; count: number }[]
): { week: string; count: number }[] {
  const weeks: Map<string, number> = new Map();

  dailyData.forEach(({ date, count }) => {
    const d = new Date(date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    weeks.set(weekKey, (weeks.get(weekKey) || 0) + count);
  });

  return Array.from(weeks.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Calculate average daily count
 */
export function calculateDailyAverage(
  data: { date: string; count: number }[]
): number {
  if (data.length === 0) return 0;
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return Math.round(total / data.length);
}

/**
 * Find peak day in trend data
 */
export function findPeakDay(
  data: { date: string; count: number }[]
): { date: string; count: number } | null {
  if (data.length === 0) return null;

  return data.reduce(
    (max, item) => (item.count > max.count ? item : max),
    data[0]
  );
}
