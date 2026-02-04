import { getFirestore } from "@/lib/firebase/admin";
import { getFieldType } from "./utils";

/**
 * Statistics for numeric fields
 */
export interface NumericFieldStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  stdDev: number;
  sum: number;
}

/**
 * Statistics for string fields
 */
export interface StringFieldStats {
  mostCommon: { value: string; count: number }[];
  avgLength: number;
  minLength: number;
  maxLength: number;
  emptyCount: number;
}

/**
 * Statistics for a single field
 */
export interface FieldStatistics {
  fieldName: string;
  type: string;
  nullCount: number;
  totalCount: number;
  uniqueCount: number;
  fillRate: number; // percentage of non-null values
  numericStats?: NumericFieldStats;
  stringStats?: StringFieldStats;
  booleanStats?: { trueCount: number; falseCount: number };
  arrayStats?: { avgLength: number; minLength: number; maxLength: number };
}

/**
 * Analyze a single field from a collection
 */
export async function getFieldStatistics(
  collectionName: string,
  fieldName: string,
  sampleSize: number = 500
): Promise<FieldStatistics> {
  const db = getFirestore();
  const docs = await db.collection(collectionName).limit(sampleSize).get();

  const values: unknown[] = [];
  let nullCount = 0;

  docs.forEach((doc) => {
    const data = doc.data();
    const value = data[fieldName];

    if (value === null || value === undefined) {
      nullCount++;
    } else {
      values.push(value);
    }
  });

  const type = values.length > 0 ? getFieldType(values[0]) : "unknown";
  const uniqueValues = new Set(
    values.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
  );

  const stats: FieldStatistics = {
    fieldName,
    type,
    nullCount,
    totalCount: docs.size,
    uniqueCount: uniqueValues.size,
    fillRate: docs.size > 0 ? Math.round(((docs.size - nullCount) / docs.size) * 100) : 0,
  };

  // Calculate type-specific stats
  switch (type) {
    case "number":
      stats.numericStats = calculateNumericStats(values as number[]);
      break;
    case "string":
      stats.stringStats = calculateStringStats(values as string[]);
      break;
    case "boolean":
      stats.booleanStats = calculateBooleanStats(values as boolean[]);
      break;
    case "array":
      stats.arrayStats = calculateArrayStats(values as unknown[][]);
      break;
  }

  return stats;
}

/**
 * Calculate statistics for numeric values
 */
function calculateNumericStats(values: number[]): NumericFieldStats {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0, stdDev: 0, sum: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;

  // Calculate standard deviation
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  // Calculate median
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(avg * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    sum: Math.round(sum * 100) / 100,
  };
}

/**
 * Calculate statistics for string values
 */
function calculateStringStats(values: string[]): StringFieldStats {
  if (values.length === 0) {
    return {
      mostCommon: [],
      avgLength: 0,
      minLength: 0,
      maxLength: 0,
      emptyCount: 0,
    };
  }

  const lengths = values.map((s) => s.length);
  const emptyCount = values.filter((s) => s === "").length;

  // Count occurrences
  const counts = new Map<string, number>();
  values.forEach((s) => counts.set(s, (counts.get(s) || 0) + 1));

  // Get most common values (top 5)
  const mostCommon = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([value, count]) => ({
      value: value.length > 50 ? value.slice(0, 50) + "..." : value,
      count,
    }));

  return {
    mostCommon,
    avgLength: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
    minLength: Math.min(...lengths),
    maxLength: Math.max(...lengths),
    emptyCount,
  };
}

/**
 * Calculate statistics for boolean values
 */
function calculateBooleanStats(values: boolean[]): {
  trueCount: number;
  falseCount: number;
} {
  const trueCount = values.filter((v) => v === true).length;
  return {
    trueCount,
    falseCount: values.length - trueCount,
  };
}

/**
 * Calculate statistics for array values
 */
function calculateArrayStats(values: unknown[][]): {
  avgLength: number;
  minLength: number;
  maxLength: number;
} {
  if (values.length === 0) {
    return { avgLength: 0, minLength: 0, maxLength: 0 };
  }

  const lengths = values.map((arr) => (Array.isArray(arr) ? arr.length : 0));

  return {
    avgLength: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
    minLength: Math.min(...lengths),
    maxLength: Math.max(...lengths),
  };
}

/**
 * Get statistics for all fields in a collection
 */
export async function getAllFieldStats(
  collectionName: string,
  sampleSize: number = 500
): Promise<FieldStatistics[]> {
  const db = getFirestore();
  const docs = await db.collection(collectionName).limit(sampleSize).get();

  if (docs.empty) {
    return [];
  }

  // Collect all unique field names
  const fieldNames = new Set<string>();
  docs.forEach((doc) => {
    Object.keys(doc.data()).forEach((key) => fieldNames.add(key));
  });

  // Analyze each field
  const statsPromises = Array.from(fieldNames).map((fieldName) =>
    analyzeFieldFromDocs(docs, fieldName)
  );

  return Promise.all(statsPromises);
}

/**
 * Analyze a field from already-fetched documents
 */
function analyzeFieldFromDocs(
  docs: FirebaseFirestore.QuerySnapshot,
  fieldName: string
): FieldStatistics {
  const values: unknown[] = [];
  let nullCount = 0;

  docs.forEach((doc) => {
    const data = doc.data();
    const value = data[fieldName];

    if (value === null || value === undefined) {
      nullCount++;
    } else {
      values.push(value);
    }
  });

  const type = values.length > 0 ? getFieldType(values[0]) : "unknown";
  const uniqueValues = new Set(
    values.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
  );

  const stats: FieldStatistics = {
    fieldName,
    type,
    nullCount,
    totalCount: docs.size,
    uniqueCount: uniqueValues.size,
    fillRate: docs.size > 0 ? Math.round(((docs.size - nullCount) / docs.size) * 100) : 0,
  };

  // Calculate type-specific stats
  switch (type) {
    case "number":
      stats.numericStats = calculateNumericStats(values as number[]);
      break;
    case "string":
      stats.stringStats = calculateStringStats(values as string[]);
      break;
    case "boolean":
      stats.booleanStats = calculateBooleanStats(values as boolean[]);
      break;
    case "array":
      stats.arrayStats = calculateArrayStats(values as unknown[][]);
      break;
  }

  return stats;
}
