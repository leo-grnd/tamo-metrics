export interface CollectionInfo {
  name: string;
  documentCount: number;
  lastUpdated?: Date;
}

export interface CollectionStats {
  name: string;
  documentCount: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  growthPercent: number;
  sampleFields: string[];
}

export interface GlobalStats {
  totalDocuments: number;
  totalCollections: number;
  collectionsInfo: CollectionInfo[];
  lastUpdated: Date;
}

export interface TrendDataPoint {
  date: string;
  count: number;
  [key: string]: string | number;
}

export interface CollectionTrend {
  collectionName: string;
  data: TrendDataPoint[];
}
