"use client";

import { useState, useMemo, useCallback, Fragment } from "react";
import { cn } from "@/lib/utils/cn";
import { formatFieldValue, getFieldType } from "@/lib/analytics/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DataTableProps {
  documents: { id: string; data: Record<string, unknown> }[];
  fields?: string[];
  maxFields?: number;
  className?: string;
  searchable?: boolean;
  exportable?: boolean;
  sortable?: boolean;
  configurable?: boolean;
  onDocumentClick?: (doc: { id: string; data: Record<string, unknown> }) => void;
}

// Calculate field priority for smart display ordering
function calculateFieldPriority(fieldName: string, sampleValue: unknown): number {
  let score = 50;

  const lowerName = fieldName.toLowerCase();

  // High priority fields (shown first)
  const highPriorityPatterns = [
    "name",
    "title",
    "email",
    "status",
    "type",
    "label",
    "username",
    "displayname",
  ];
  // Low priority fields (shown last)
  const lowPriorityPatterns = [
    "_id",
    "id",
    "updatedat",
    "modifiedat",
    "metadata",
    "__v",
    "createdat",
    "timestamp",
  ];

  if (highPriorityPatterns.some((p) => lowerName.includes(p))) {
    score += 30;
  }
  if (lowPriorityPatterns.some((p) => lowerName.includes(p))) {
    score -= 20;
  }

  // Prioritize simple types over complex
  const type = getFieldType(sampleValue);
  if (type === "string" || type === "number" || type === "boolean") {
    score += 10;
  }
  if (type === "map" || type === "array") {
    score -= 10;
  }
  if (type === "null" || type === "undefined") {
    score -= 15;
  }

  return score;
}

// Download helper
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Search icon component
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

// Chevron icon for expand/collapse
function ChevronIcon({
  expanded,
  className,
}: {
  expanded: boolean;
  className?: string;
}) {
  return (
    <svg
      className={cn(
        "h-4 w-4 transition-transform",
        expanded && "rotate-90",
        className
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

// Sort indicator
function SortIndicator({ direction }: { direction: "asc" | "desc" | null }) {
  if (!direction) return null;
  return (
    <span className="ml-1 text-amber-500">
      {direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

// Document preview component
function DocumentPreview({
  document,
}: {
  document: { id: string; data: Record<string, unknown> };
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(document.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [document.data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Document complet
        </h4>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? "Copié !" : "Copier"}
        </Button>
      </div>
      <pre className="max-h-64 overflow-auto rounded-lg bg-zinc-100 p-4 text-xs dark:bg-zinc-800">
        <code className="text-zinc-700 dark:text-zinc-300">
          {JSON.stringify(document.data, null, 2)}
        </code>
      </pre>
    </div>
  );
}

// Field cell component
function FieldCell({ value }: { value: unknown }) {
  const type = getFieldType(value);

  return (
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className={cn("text-sm", {
            "text-zinc-900 dark:text-zinc-100":
              type === "string" || type === "number",
            "text-blue-600 dark:text-blue-400": type === "boolean",
            "text-amber-600 dark:text-amber-400": type === "timestamp",
            "text-purple-600 dark:text-purple-400": type === "reference",
            "text-emerald-600 dark:text-emerald-400": type === "geopoint",
            "text-cyan-600 dark:text-cyan-400": type === "array",
            "text-orange-600 dark:text-orange-400": type === "map",
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
}

export function DataTable({
  documents,
  fields,
  maxFields = 5,
  className,
  searchable = true,
  exportable = true,
  sortable = true,
  configurable = true,
  onDocumentClick,
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleFieldCount, setVisibleFieldCount] = useState<number>(maxFields);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Get all unique fields from documents
  const allFields = useMemo(() => {
    if (!documents.length) return [];
    return Array.from(
      new Set(documents.flatMap((doc) => Object.keys(doc.data)))
    );
  }, [documents]);

  // Smart field prioritization
  const smartFields = useMemo(() => {
    if (fields) return fields.slice(0, visibleFieldCount);
    if (!documents.length) return [];

    const fieldScores = allFields.map((field) => ({
      field,
      score: calculateFieldPriority(field, documents[0]?.data[field]),
    }));

    return fieldScores
      .sort((a, b) => b.score - a.score)
      .slice(0, visibleFieldCount)
      .map((f) => f.field);
  }, [documents, fields, allFields, visibleFieldCount]);

  // Filter documents based on search
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;

    const query = searchQuery.toLowerCase();
    return documents.filter((doc) => {
      // Search in document ID
      if (doc.id.toLowerCase().includes(query)) return true;

      // Search in field values
      return Object.values(doc.data).some((v) => {
        if (v === null || v === undefined) return false;
        return String(v).toLowerCase().includes(query);
      });
    });
  }, [documents, searchQuery]);

  // Sort documents
  const sortedDocuments = useMemo(() => {
    if (!sortField || !sortable) return filteredDocuments;

    return [...filteredDocuments].sort((a, b) => {
      const aVal = sortField === "_id" ? a.id : a.data[sortField];
      const bVal = sortField === "_id" ? b.id : b.data[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison: number;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredDocuments, sortField, sortDirection, sortable]);

  // Handle column header click for sorting
  const handleSort = useCallback(
    (field: string) => {
      if (!sortable) return;

      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortable]
  );

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = ["id", ...smartFields];
    const rows = sortedDocuments.map((doc) => [
      doc.id,
      ...smartFields.map((f) => {
        const val = formatFieldValue(doc.data[f], 10000);
        // Escape quotes and wrap in quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      }),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    downloadFile(csv, `export-${Date.now()}.csv`, "text/csv;charset=utf-8");
  }, [sortedDocuments, smartFields]);

  // Export to JSON
  const exportToJSON = useCallback(() => {
    const data = sortedDocuments.map((doc) => ({
      _id: doc.id,
      ...doc.data,
    }));
    downloadFile(
      JSON.stringify(data, null, 2),
      `export-${Date.now()}.json`,
      "application/json"
    );
  }, [sortedDocuments]);

  // Toggle document expansion
  const toggleExpand = useCallback((docId: string) => {
    setExpandedDocId((prev) => (prev === docId ? null : docId));
  }, []);

  // Empty state
  if (!documents || documents.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <p className="text-zinc-500 dark:text-zinc-400">
          Aucun document trouvé
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        {searchable && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-amber-500"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export buttons */}
          {exportable && (
            <>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <svg
                  className="mr-1.5 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToJSON}>
                <svg
                  className="mr-1.5 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                JSON
              </Button>
            </>
          )}

          {/* Field count selector */}
          {configurable && (
            <select
              value={visibleFieldCount}
              onChange={(e) => setVisibleFieldCount(Number(e.target.value))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm transition-colors focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value={3}>3 champs</option>
              <option value={5}>5 champs</option>
              <option value={8}>8 champs</option>
              <option value={10}>10 champs</option>
              <option value={allFields.length}>
                Tous ({allFields.length})
              </option>
            </select>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {filteredDocuments.length} document
        {filteredDocuments.length !== 1 ? "s" : ""}
        {searchQuery && (
          <span className="ml-1">
            (filtré sur {documents.length})
          </span>
        )}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              {/* ID column */}
              <th
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400",
                  sortable &&
                    "cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
                onClick={() => handleSort("_id")}
              >
                <div className="flex items-center">
                  ID
                  <SortIndicator
                    direction={sortField === "_id" ? sortDirection : null}
                  />
                </div>
              </th>

              {/* Field columns */}
              {smartFields.map((field) => (
                <th
                  key={field}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400",
                    sortable &&
                      "cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                  onClick={() => handleSort(field)}
                >
                  <div className="flex items-center">
                    {field}
                    <SortIndicator
                      direction={sortField === field ? sortDirection : null}
                    />
                  </div>
                </th>
              ))}

              {/* Expand column */}
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sortedDocuments.map((doc, index) => (
              <Fragment key={doc.id}>
                <tr
                  className={cn(
                    "border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
                    index % 2 === 0
                      ? "bg-white dark:bg-black"
                      : "bg-zinc-50/50 dark:bg-zinc-900/50",
                    onDocumentClick && "cursor-pointer"
                  )}
                  onClick={() => onDocumentClick?.(doc)}
                >
                  {/* ID cell */}
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    <span title={doc.id}>
                      {doc.id.length > 20 ? `${doc.id.slice(0, 20)}...` : doc.id}
                    </span>
                  </td>

                  {/* Field cells */}
                  {smartFields.map((field) => (
                    <FieldCell key={field} value={doc.data[field]} />
                  ))}

                  {/* Expand button */}
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(doc.id);
                      }}
                      className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      title="Voir le document complet"
                    >
                      <ChevronIcon expanded={expandedDocId === doc.id} />
                    </button>
                  </td>
                </tr>

                {/* Expanded document preview */}
                {expandedDocId === doc.id && (
                  <tr>
                    <td
                      colSpan={smartFields.length + 2}
                      className="border-b border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
                    >
                      <DocumentPreview document={doc} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* No results message */}
      {sortedDocuments.length === 0 && searchQuery && (
        <div className="py-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            Aucun résultat pour "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500"
          >
            Effacer la recherche
          </button>
        </div>
      )}
    </div>
  );
}
