import useSWR from "swr";
import type { GlobalStats } from "@/lib/firebase/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR<GlobalStats>(
    "/api/firestore/stats",
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
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
