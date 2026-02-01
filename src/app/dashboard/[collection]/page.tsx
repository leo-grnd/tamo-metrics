"use client";

import { use } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart } from "@/components/visualization/charts/line-chart";
import { AreaChart } from "@/components/visualization/charts/area-chart";
import { DataTable } from "@/components/visualization/tables/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollections } from "@/hooks/use-collections";
import { useCollectionStats } from "@/hooks/use-collection-stats";
import { useTrends } from "@/hooks/use-trends";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  } = useCollectionStats(collectionName, { includeRecent: true, limit: 10 });
  const { trends, isLoading: trendsLoading } = useTrends(collectionName);

  const isLoading = statsLoading || collectionsLoading;

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
                value={stats?.documentCount || 0}
                change={stats?.growthPercent}
                icon={<DocumentIcon />}
                loading={isLoading}
              />
              <StatCard
                title="Aujourd'hui"
                value={stats?.todayCount || 0}
                icon={<TodayIcon />}
                loading={isLoading}
              />
              <StatCard
                title="Cette semaine"
                value={stats?.weekCount || 0}
                icon={<WeekIcon />}
                loading={isLoading}
              />
              <StatCard
                title="Croissance"
                value={stats?.growthPercent || 0}
                icon={<GrowthIcon />}
                loading={isLoading}
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="trends" className="w-full">
              <TabsList>
                <TabsTrigger value="trends">Tendances</TabsTrigger>
                <TabsTrigger value="documents">Documents récents</TabsTrigger>
                <TabsTrigger value="fields">Champs</TabsTrigger>
              </TabsList>

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
                        <Skeleton className="h-[300px] w-full" />
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
                        <Skeleton className="h-[300px] w-full" />
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

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      10 derniers documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <DataTable
                        documents={stats?.recentDocuments || []}
                        maxFields={5}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fields">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Champs détectés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full" />
                        ))}
                      </div>
                    ) : stats?.sampleFields && stats.sampleFields.length > 0 ? (
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
