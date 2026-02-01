"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

interface Collection {
  name: string;
  documentCount: number;
}

interface CollectionSelectorProps {
  collections: Collection[];
  currentCollection?: string;
}

export function CollectionSelector({
  collections,
  currentCollection,
}: CollectionSelectorProps) {
  const router = useRouter();

  const options = [
    { value: "", label: "Vue d'ensemble" },
    ...collections.map((col) => ({
      value: col.name,
      label: `${col.name} (${col.documentCount})`,
    })),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      router.push(`/dashboard/${encodeURIComponent(value)}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Select
      options={options}
      value={currentCollection || ""}
      onChange={handleChange}
      className="w-full sm:w-64"
    />
  );
}
