"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "./charts/line-chart";
import { BarChart } from "./charts/bar-chart";
import { PieChart } from "./charts/pie-chart";
import { Skeleton } from "@/components/ui/skeleton";
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
  const lineData =
    trends?.trends?.[0]?.data ||
    trends?.data ||
    generateMockLineData();

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Tendances</TabsTrigger>
        <TabsTrigger value="distribution">Distribution</TabsTrigger>
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
                <Skeleton className="h-[300px] w-full" />
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
                <Skeleton className="h-[300px] w-full" />
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
            <CardTitle className="text-base">
              Évolution sur 30 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <LineChart
                data={lineData}
                xKey="date"
                yKey="count"
                color="#f59e0b"
              />
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
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <div className="h-[400px]">
                <PieChart data={pieData} showLegend />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
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

function generateMockLineData() {
  const data = [];
  const now = new Date();
  let baseValue = 100;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    baseValue = Math.max(50, baseValue + Math.floor(Math.random() * 20) - 8);

    data.push({
      date: date.toISOString().split("T")[0],
      count: baseValue,
    });
  }

  return data;
}
