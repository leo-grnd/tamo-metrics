import useSWR from "swr";
import type { CollectionStats } from "@/lib/firebase/types";

interface CollectionStatsResponse extends CollectionStats {
  recentDocuments?: { id: string; data: Record<string, unknown> }[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCollectionStats(
  collectionName: string | null,
  options?: { includeRecent?: boolean; limit?: number }
) {
  const { includeRecent = false, limit = 10 } = options || {};

  const url = collectionName
    ? `/api/firestore/collection/${encodeURIComponent(collectionName)}?recent=${includeRecent}&limit=${limit}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<CollectionStatsResponse>(
    url,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  return {
    stats: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
