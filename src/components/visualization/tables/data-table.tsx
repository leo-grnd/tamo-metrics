"use client";

import { cn } from "@/lib/utils/cn";
import { formatFieldValue, getFieldType } from "@/lib/analytics/utils";
import { Card } from "@/components/ui/card";

interface DataTableProps {
  documents: { id: string; data: Record<string, unknown> }[];
  fields?: string[];
  maxFields?: number;
  className?: string;
}

export function DataTable({
  documents,
  fields,
  maxFields = 5,
  className,
}: DataTableProps) {
  if (!documents || documents.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <p className="text-zinc-500 dark:text-zinc-400">
          Aucun document trouvé
        </p>
      </Card>
    );
  }

  // Get fields to display
  const displayFields =
    fields ||
    Array.from(
      new Set(documents.flatMap((doc) => Object.keys(doc.data)))
    ).slice(0, maxFields);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              ID
            </th>
            {displayFields.map((field) => (
              <th
                key={field}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, index) => (
            <tr
              key={doc.id}
              className={cn(
                "border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
                index % 2 === 0 ? "bg-white dark:bg-black" : "bg-zinc-50/50 dark:bg-zinc-900/50"
              )}
            >
              <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {doc.id.length > 20 ? `${doc.id.slice(0, 20)}...` : doc.id}
              </td>
              {displayFields.map((field) => {
                const value = doc.data[field];
                const type = getFieldType(value);

                return (
                  <td key={field} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("text-sm", {
                          "text-zinc-900 dark:text-zinc-100":
                            type === "string" || type === "number",
                          "text-blue-600 dark:text-blue-400":
                            type === "boolean",
                          "text-amber-600 dark:text-amber-400":
                            type === "timestamp",
                          "text-purple-600 dark:text-purple-400":
                            type === "reference",
                          "text-zinc-500 dark:text-zinc-400":
                            type === "null" || type === "undefined",
                        })}
                      >
                        {formatFieldValue(value, 30)}
                      </span>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {type}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
