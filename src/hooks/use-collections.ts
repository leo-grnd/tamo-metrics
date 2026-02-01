import useSWR from "swr";

interface Collection {
  name: string;
  documentCount: number;
}

interface CollectionsResponse {
  collections: Collection[] | string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCollections(detailed: boolean = true) {
  const url = `/api/firestore/collections${detailed ? "?detailed=true" : ""}`;

  const { data, error, isLoading, mutate } = useSWR<CollectionsResponse>(
    url,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  // Normalize the response
  const collections: Collection[] = data?.collections
    ? Array.isArray(data.collections)
      ? typeof data.collections[0] === "string"
        ? (data.collections as string[]).map((name) => ({
            name,
            documentCount: 0,
          }))
        : (data.collections as Collection[])
      : []
    : [];

  return {
    collections,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
