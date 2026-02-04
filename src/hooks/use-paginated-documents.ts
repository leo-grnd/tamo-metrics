import { useCallback } from "react";
import useSWRInfinite from "swr/infinite";

interface Document {
  id: string;
  data: Record<string, unknown>;
}

interface PageData {
  documents: Document[];
  hasMore: boolean;
  lastDocId: string | null;
  total?: number;
}

interface UsePaginatedDocumentsOptions {
  pageSize?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  includeTotal?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePaginatedDocuments(
  collectionName: string | null,
  options: UsePaginatedDocumentsOptions = {}
) {
  const {
    pageSize = 25,
    orderBy,
    orderDirection = "desc",
    includeTotal = false,
  } = options;

  // Generate key for each page
  const getKey = (pageIndex: number, previousPageData: PageData | null) => {
    // Return null if collection is not provided
    if (!collectionName) return null;

    // Return null if previous page has no more data
    if (previousPageData && !previousPageData.hasMore) return null;

    // Build URL with pagination params
    const params = new URLSearchParams({
      limit: String(pageSize),
      direction: orderDirection,
    });

    if (orderBy) {
      params.set("orderBy", orderBy);
    }

    // Add cursor for pages after the first
    if (previousPageData?.lastDocId) {
      params.set("startAfter", previousPageData.lastDocId);
    }

    // Only include total on first page
    if (pageIndex === 0 && includeTotal) {
      params.set("includeTotal", "true");
    }

    return `/api/firestore/collection/${encodeURIComponent(collectionName)}/documents?${params}`;
  };

  const {
    data,
    error,
    size,
    setSize,
    isValidating,
    mutate,
  } = useSWRInfinite<PageData>(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Flatten all documents from all pages
  const documents = data ? data.flatMap((page) => page.documents || []) : [];

  // Get total from first page (if requested)
  const total = data?.[0]?.total;

  // Check if we're loading more pages
  const isLoadingMore =
    isValidating && size > 0 && data && typeof data[size - 1] === "undefined";

  // Check if there are more pages
  const hasMore = data ? data[data.length - 1]?.hasMore ?? false : false;

  // Load more documents
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1);
    }
  }, [isLoadingMore, hasMore, setSize, size]);

  // Reset pagination
  const reset = useCallback(() => {
    setSize(1);
    mutate();
  }, [setSize, mutate]);

  return {
    documents,
    total,
    isLoading: !data && !error,
    isLoadingMore: isLoadingMore ?? false,
    hasMore,
    currentPage: size,
    loadMore,
    reset,
    refresh: mutate,
    error,
  };
}
