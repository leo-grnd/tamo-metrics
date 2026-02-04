"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "./charts/line-chart";
import { BarChart } from "./charts/bar-chart";
import { PieChart } from "./charts/pie-chart";
import { CollectionComparison } from "./collection-comparison";
import { ChartSkeleton, Skeleton } from "@/components/ui/skeleton";
import type { CollectionTrend } from "@/lib/firebase/types";

interface Collection {
  name: string;
  documentCount: number;
}

interface TrendResponse {
  collectionName?: string;
  data?: { date: string; count: number }[];
  trends?: CollectionTrend[];
}

interface VisualizationContainerProps {
  collections: Collection[];
  trends?: TrendResponse | null;
  loading?: boolean;
}

export function VisualizationContainer({
  collections,
  trends,
  loading = false,
}: VisualizationContainerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [collectionTrends, setCollectionTrends] = useState<
    Record<string, { date: string; count: number }[]>
  >({});
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Load trends for comparison when the comparison tab is activated
  useEffect(() => {
    if (activeTab === "comparison" && Object.keys(collectionTrends).length === 0 && collections.length > 1) {
      setComparisonLoading(true);

      // Load trends for up to 5 collections
      const collectionsToLoad = collections.slice(0, 5);
      const promises = collectionsToLoad.map((col) =>
        fetch(`/api/firestore/trends?collection=${encodeURIComponent(col.name)}`)
          .then((res) => res.json())
          .then((data) => ({
            name: col.name,
            data: data.data || [],
          }))
          .catch(() => ({ name: col.name, data: [] }))
      );

      Promise.all(promises)
        .then((results) => {
          const trendsMap: Record<string, { date: string; count: number }[]> = {};
          results.forEach(({ name, data }) => {
            trendsMap[name] = data;
          });
          setCollectionTrends(trendsMap);
        })
        .finally(() => setComparisonLoading(false));
    }
  }, [activeTab, collections, collectionTrends]);

  // Prepare data for charts
  const pieData = collections.map((col, index) => ({
    name: col.name,
    value: col.documentCount,
    color: getCollectionColor(index),
  }));

  const barData = collections.slice(0, 10).map((col) => ({
    name: col.name,
    documents: col.documentCount,
  }));

  // Get line chart data from trends
  const lineData = trends?.trends?.[0]?.data || trends?.data || [];

  return (
    <Tabs
      defaultValue="overview"
      className="w-full"
      onValueChange={setActiveTab}
    >
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Tendances</TabsTrigger>
        <TabsTrigger value="distribution">Distribution</TabsTrigger>
        {collections.length >= 2 && (
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Documents par collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton height={300} type="bar" />
              ) : (
                <BarChart
                  data={barData}
                  xKey="name"
                  yKey="documents"
                  color="#f59e0b"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Répartition des documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton height={300} type="pie" />
              ) : (
                <PieChart data={pieData} />
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="trends">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Évolution sur 30 jours</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={400} type="line" />
            ) : lineData.length > 0 ? (
              <LineChart
                data={lineData}
                xKey="date"
                yKey="count"
                color="#f59e0b"
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground bg-muted/20 rounded-lg">
                Aucune donnée de tendance disponible (champ "createdAt" manquant)
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="distribution">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Distribution par collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={400} type="pie" />
            ) : (
              <div className="h-[400px]">
                <PieChart data={pieData} showLegend />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {collections.length >= 2 && (
        <TabsContent value="comparison">
          {comparisonLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <ChartSkeleton height={350} type="line" />
              </CardContent>
            </Card>
          ) : (
            <CollectionComparison
              collections={collections}
              trendsData={collectionTrends}
              height={350}
            />
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}

function getCollectionColor(index: number): string {
  const colors = [
    "#f59e0b", // amber-500
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f97316", // orange-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#6366f1", // indigo-500
    "#14b8a6", // teal-500
  ];
  return colors[index % colors.length];
}

