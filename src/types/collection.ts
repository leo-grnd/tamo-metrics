export interface Collection {
  id: string;
  name: string;
  documentCount: number;
}

export interface CollectionDetails {
  name: string;
  documentCount: number;
  fields: FieldInfo[];
  recentDocuments: DocumentPreview[];
  trends: DailyCount[];
}

export interface FieldInfo {
  name: string;
  type: string;
  sampleValue?: unknown;
}

export interface DocumentPreview {
  id: string;
  createdAt?: string;
  preview: Record<string, unknown>;
}

export interface DailyCount {
  date: string;
  count: number;
}
