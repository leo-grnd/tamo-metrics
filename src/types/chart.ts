export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface LineChartData {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  color?: string;
}

export interface PieChartData {
  data: { name: string; value: number; color?: string }[];
}

export interface BarChartData {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  color?: string;
}
