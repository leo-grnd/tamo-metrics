"use client";

import { StatCard } from "@/components/ui/stat-card";

interface StatsOverviewProps {
  totalDocuments: number;
  totalCollections: number;
  growthPercent?: number;
  loading?: boolean;
}

function DatabaseIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  );
}

function CollectionIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

export function StatsOverview({
  totalDocuments,
  totalCollections,
  growthPercent = 0,
  loading = false,
}: StatsOverviewProps) {
  // Estimate average docs per collection
  const avgDocsPerCollection =
    totalCollections > 0 ? Math.round(totalDocuments / totalCollections) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Documents"
        value={totalDocuments}
        change={growthPercent}
        icon={<DatabaseIcon />}
        loading={loading}
      />
      <StatCard
        title="Collections"
        value={totalCollections}
        icon={<CollectionIcon />}
        loading={loading}
      />
      <StatCard
        title="Croissance"
        value={growthPercent}
        icon={<TrendIcon />}
        loading={loading}
      />
      <StatCard
        title="Moy. docs/collection"
        value={avgDocsPerCollection}
        icon={<ActivityIcon />}
        loading={loading}
      />
    </div>
  );
}
