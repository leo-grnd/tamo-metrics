"use client";

import { cn } from "@/lib/utils/cn";

interface ViewSwitcherProps {
  activeView: string;
  onViewChange: (view: string) => void;
  views: { id: string; label: string; icon?: React.ReactNode }[];
}

export function ViewSwitcher({
  activeView,
  onViewChange,
  views,
}: ViewSwitcherProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            activeView === view.id
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          )}
        >
          {view.icon}
          {view.label}
        </button>
      ))}
    </div>
  );
}
