export interface DashboardStats {
  totalDocuments: number;
  totalCollections: number;
  growthPercent: number;
  lastUpdated: string;
}

export interface CollectionStat {
  name: string;
  count: number;
  growth: number;
}
