"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { formatCompactNumber } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface Collection {
  name: string;
  documentCount: number;
}

interface SidebarProps {
  collections: Collection[];
  loading?: boolean;
}

export function Sidebar({ collections, loading = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Collections
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {loading
              ? "Chargement..."
              : `${collections.length} collection${collections.length > 1 ? "s" : ""} détectée${collections.length > 1 ? "s" : ""}`}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Aucune collection trouvée
            </div>
          ) : (
            <ul className="space-y-1">
              <li>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname === "/dashboard"
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span>Vue d&apos;ensemble</span>
                  </div>
                </Link>
              </li>
              {collections.map((collection) => {
                const isActive =
                  pathname === `/dashboard/${encodeURIComponent(collection.name)}`;
                return (
                  <li key={collection.name}>
                    <Link
                      href={`/dashboard/${encodeURIComponent(collection.name)}`}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4"
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
                        <span className="truncate">{collection.name}</span>
                      </div>
                      <span
                        className={cn(
                          "text-xs",
                          isActive
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-zinc-400 dark:text-zinc-500"
                        )}
                      >
                        {formatCompactNumber(collection.documentCount)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="text-xs text-zinc-400 dark:text-zinc-500">
            Dernière mise à jour
            <br />
            <span className="text-zinc-600 dark:text-zinc-400">
              {new Date().toLocaleTimeString("fr-FR")}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
