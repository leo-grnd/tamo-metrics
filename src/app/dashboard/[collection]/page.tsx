"use client";

import { use, useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart } from "@/components/visualization/charts/line-chart";
import { AreaChart } from "@/components/visualization/charts/area-chart";
import { HeatmapChart } from "@/components/visualization/charts/heatmap-chart";
import { HistogramChart } from "@/components/visualization/charts/histogram-chart";
import { DataTable } from "@/components/visualization/tables/data-table";
import { FieldStatsGrid } from "@/components/visualization/field-stats-panel";
import {
  Skeleton,
  TableSkeleton,
  ChartSkeleton,
  FieldStatsSkeleton,
} from "@/components/ui/skeleton";
import { useCollections } from "@/hooks/use-collections";
import { useCollectionStats } from "@/hooks/use-collection-stats";
import { useTrends } from "@/hooks/use-trends";
import { usePaginatedDocuments } from "@/hooks/use-paginated-documents";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { FieldStatistics } from "@/lib/analytics/field-stats";

interface CollectionPageProps {
  params: Promise<{ collection: string }>;
}

function DocumentIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function TodayIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function WeekIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const { collection: encodedCollection } = use(params);
  const collectionName = decodeURIComponent(encodedCollection);

  const { collections, isLoading: collectionsLoading } = useCollections();
  const {
    stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useCollectionStats(collectionName, { includeRecent: true, limit: 20 });
  const { trends, isLoading: trendsLoading } = useTrends(collectionName);

  // Paginated documents for the documents tab
  const {
    documents: paginatedDocs,
    isLoading: docsLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    total: totalDocs,
  } = usePaginatedDocuments(collectionName, {
    pageSize: 25,
    includeTotal: true,
  });

  // Field statistics state (loaded on demand)
  const [fieldStats, setFieldStats] = useState<FieldStatistics[] | null>(null);
  const [fieldStatsLoading, setFieldStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("trends");

  // Load field stats when the "fields" tab is activated
  useEffect(() => {
    if (activeTab === "fields" && !fieldStats && !fieldStatsLoading) {
      setFieldStatsLoading(true);
      fetch(`/api/firestore/collection/${encodeURIComponent(collectionName)}/stats`)
        .then((res) => res.json())
        .then((data) => {
          if (data.fieldStats) {
            setFieldStats(data.fieldStats);
          }
        })
        .catch(console.error)
        .finally(() => setFieldStatsLoading(false));
    }
  }, [activeTab, collectionName, fieldStats, fieldStatsLoading]);

  const isLoading = statsLoading || collectionsLoading;

  // Generate heatmap data from trends
  const heatmapData =
    trends?.data?.map((d) => ({
      date: d.date,
      value: d.count,
    })) || [];

  // Extract numeric values for histogram (if any numeric field exists)
  const numericFieldValues =
    stats?.recentDocuments
      ?.flatMap((doc) =>
        Object.values(doc.data).filter((v): v is number => typeof v === "number")
      ) || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <Sidebar collections={collections} loading={collectionsLoading} />

      <main className="ml-64 min-h-[calc(100vh-4rem)] p-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href="/dashboard"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">
            {collectionName}
          </span>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {collectionName}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Statistiques détaillées de la collection
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour
            </Button>
          </Link>
        </div>

        {statsError ? (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">
                Erreur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 dark:text-red-400">
                Impossible de charger les statistiques de cette collection.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Documents"
                value={stats?.documentCount}
                change={stats?.growthPercent}
                icon={<DocumentIcon />}
                loading={isLoading}
              />
              <StatCard
                title="Aujourd'hui"
                value={stats?.todayCount}
                icon={<TodayIcon />}
                loading={isLoading}
              />
              <StatCard
                title="Cette semaine"
                value={stats?.weekCount}
                icon={<WeekIcon />}
                loading={isLoading}
              />
              <StatCard
                title="Croissance"
                value={stats?.growthPercent !== undefined ? `${stats.growthPercent}%` : null}
                icon={<GrowthIcon />}
                loading={isLoading}
              />
            </div>

            {/* Tabs */}
            <Tabs
              defaultValue="trends"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="trends">Tendances</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="fields">Champs</TabsTrigger>
              </TabsList>

              {/* Trends Tab */}
              <TabsContent value="trends">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Évolution (30 jours)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {trendsLoading ? (
                        <ChartSkeleton height={300} type="line" />
                      ) : (
                        <LineChart
                          data={trends?.data || []}
                          xKey="date"
                          yKey="count"
                          color="#f59e0b"
                        />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Activité cumulée
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {trendsLoading ? (
                        <ChartSkeleton height={300} type="line" />
                      ) : (
                        <AreaChart
                          data={trends?.data || []}
                          xKey="date"
                          yKey="count"
                          color="#3b82f6"
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Répartition par jour/heure
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {trendsLoading ? (
                        <Skeleton className="h-[280px] w-full" />
                      ) : (
                        <HeatmapChart data={heatmapData} height={280} />
                      )}
                    </CardContent>
                  </Card>

                  {numericFieldValues.length > 10 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Distribution des valeurs numériques
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <ChartSkeleton height={300} type="bar" />
                        ) : (
                          <HistogramChart
                            data={numericFieldValues}
                            bins={15}
                            showMean
                            showMedian
                          />
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Documents
                        {totalDocs !== undefined && (
                          <span className="ml-2 text-sm font-normal text-zinc-500">
                            ({totalDocs.toLocaleString("fr-FR")} au total)
                          </span>
                        )}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {docsLoading ? (
                      <TableSkeleton rows={10} cols={5} />
                    ) : (
                      <>
                        <DataTable
                          documents={paginatedDocs}
                          maxFields={6}
                          searchable
                          exportable
                          sortable
                          configurable
                        />
                        {hasMore && (
                          <div className="mt-4 flex justify-center">
                            <Button
                              variant="outline"
                              onClick={loadMore}
                              disabled={isLoadingMore}
                            >
                              {isLoadingMore ? (
                                <>
                                  <svg
                                    className="mr-2 h-4 w-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Chargement...
                                </>
                              ) : (
                                "Charger plus"
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fields Tab */}
              <TabsContent value="fields">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Analyse des champs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fieldStatsLoading || isLoading ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <FieldStatsSkeleton key={i} />
                        ))}
                      </div>
                    ) : fieldStats && fieldStats.length > 0 ? (
                      <FieldStatsGrid stats={fieldStats} />
                    ) : stats?.sampleFields && stats.sampleFields.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Champs détectés dans cette collection :
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {stats.sampleFields.map((field) => (
                            <span
                              key={field}
                              className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Aucun champ détecté dans cette collection
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
