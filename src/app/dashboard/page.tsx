"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { VisualizationContainer } from "@/components/visualization/visualization-container";
import { useStats } from "@/hooks/use-stats";
import { useCollections } from "@/hooks/use-collections";
import { useTrends } from "@/hooks/use-trends";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { stats, isLoading: statsLoading, isError: statsError } = useStats();
  const { collections, isLoading: collectionsLoading } = useCollections();
  const { trends, isLoading: trendsLoading } = useTrends();

  const isLoading = statsLoading || collectionsLoading;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-20 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {sidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </Button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar collections={collections} loading={collectionsLoading} />
      </div>

      <main className="min-h-[calc(100vh-4rem)] p-4 pt-16 lg:ml-64 lg:p-6 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Vue d&apos;ensemble
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Statistiques globales de votre base Firestore
          </p>
        </div>

        {statsError ? (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">
                Erreur de connexion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 dark:text-red-400">
                Impossible de se connecter à Firestore. Vérifiez que vos
                credentials sont correctement configurés dans le fichier
                .env.local.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-red-100 p-4 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
                {`FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"`}
              </pre>
            </CardContent>
          </Card>
        ) : (
          <>
            <StatsOverview
              totalDocuments={stats?.totalDocuments || 0}
              totalCollections={stats?.totalCollections || 0}
              growthPercent={12} // TODO: Calculate actual growth
              loading={isLoading}
            />

            <div className="mt-6">
              <VisualizationContainer
                collections={collections}
                trends={trends}
                loading={trendsLoading}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
