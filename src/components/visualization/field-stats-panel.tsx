"use client";

import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FieldStatistics } from "@/lib/analytics/field-stats";

interface FieldStatsPanelProps {
  stats: FieldStatistics;
  className?: string;
}

// Progress bar component
function ProgressBar({
  value,
  max,
  color = "amber",
}: {
  value: number;
  max: number;
  color?: "amber" | "blue" | "emerald" | "red";
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const colorClasses = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
  };

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
      <div
        className={cn("h-full rounded-full transition-all", colorClasses[color])}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

// Type badge component
function TypeBadge({ type }: { type: string }) {
  const colorClasses: Record<string, string> = {
    string: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    number: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    boolean: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    timestamp: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    array: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    map: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    reference: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    geopoint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    unknown: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  };

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        colorClasses[type] || colorClasses.unknown
      )}
    >
      {type}
    </span>
  );
}

export function FieldStatsPanel({ stats, className }: FieldStatsPanelProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="font-mono text-amber-600 dark:text-amber-500">
            {stats.fieldName}
          </span>
          <TypeBadge type={stats.type} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* General stats */}
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Total</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {stats.totalCount.toLocaleString("fr-FR")}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Uniques</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {stats.uniqueCount.toLocaleString("fr-FR")}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Null</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {stats.nullCount.toLocaleString("fr-FR")}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Remplissage</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {stats.fillRate}%
            </p>
          </div>
        </div>

        {/* Fill rate bar */}
        <div>
          <ProgressBar value={stats.fillRate} max={100} color="amber" />
        </div>

        {/* Numeric stats */}
        {stats.numericStats && (
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Statistiques numériques
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm sm:grid-cols-6">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Min</p>
                <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.numericStats.min.toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Max</p>
                <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.numericStats.max.toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Moyenne</p>
                <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.numericStats.avg.toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Médiane</p>
                <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.numericStats.median.toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Écart-type</p>
                <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.numericStats.stdDev.toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Somme</p>
                <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.numericStats.sum.toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* String stats */}
        {stats.stringStats && (
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Valeurs les plus fréquentes
            </h4>
            <ul className="space-y-2">
              {stats.stringStats.mostCommon.map(({ value, count }, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-mono text-zinc-700 dark:text-zinc-300">
                        {value || <span className="italic text-zinc-400">(vide)</span>}
                      </span>
                      <span className="ml-2 text-zinc-500">{count}</span>
                    </div>
                    <ProgressBar
                      value={count}
                      max={stats.stringStats!.mostCommon[0]?.count || 1}
                      color="blue"
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Long. moy.</p>
                <p className="font-mono text-zinc-900 dark:text-zinc-100">
                  {stats.stringStats.avgLength}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Long. min</p>
                <p className="font-mono text-zinc-900 dark:text-zinc-100">
                  {stats.stringStats.minLength}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Long. max</p>
                <p className="font-mono text-zinc-900 dark:text-zinc-100">
                  {stats.stringStats.maxLength}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Boolean stats */}
        {stats.booleanStats && (
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Distribution booléenne
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">true</span>
                <span className="text-zinc-500">{stats.booleanStats.trueCount}</span>
              </div>
              <ProgressBar
                value={stats.booleanStats.trueCount}
                max={stats.booleanStats.trueCount + stats.booleanStats.falseCount}
                color="emerald"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600 dark:text-red-400">false</span>
                <span className="text-zinc-500">{stats.booleanStats.falseCount}</span>
              </div>
              <ProgressBar
                value={stats.booleanStats.falseCount}
                max={stats.booleanStats.trueCount + stats.booleanStats.falseCount}
                color="red"
              />
            </div>
          </div>
        )}

        {/* Array stats */}
        {stats.arrayStats && (
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Statistiques de tableaux
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Taille moy.</p>
                <p className="font-mono text-zinc-900 dark:text-zinc-100">
                  {stats.arrayStats.avgLength}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Taille min</p>
                <p className="font-mono text-zinc-900 dark:text-zinc-100">
                  {stats.arrayStats.minLength}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Taille max</p>
                <p className="font-mono text-zinc-900 dark:text-zinc-100">
                  {stats.arrayStats.maxLength}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Grid component for displaying multiple field stats
interface FieldStatsGridProps {
  stats: FieldStatistics[];
  className?: string;
}

export function FieldStatsGrid({ stats, className }: FieldStatsGridProps) {
  if (stats.length === 0) {
    return (
      <div className={cn("py-8 text-center text-zinc-500", className)}>
        Aucune statistique disponible
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {stats.map((fieldStats) => (
        <FieldStatsPanel key={fieldStats.fieldName} stats={fieldStats} />
      ))}
    </div>
  );
}
