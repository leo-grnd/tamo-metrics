import useSWR from "swr";
import type { TrendDataPoint, CollectionTrend } from "@/lib/firebase/types";

interface TrendResponse {
  collectionName?: string;
  data?: TrendDataPoint[];
  trends?: CollectionTrend[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTrends(collectionName?: string) {
  const url = collectionName
    ? `/api/firestore/trends?collection=${encodeURIComponent(collectionName)}`
    : "/api/firestore/trends";

  const { data, error, isLoading, mutate } = useSWR<TrendResponse>(
    url,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes (trends don't change often)
      revalidateOnFocus: false,
    }
  );

  return {
    trends: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
