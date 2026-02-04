import { getFirestore } from "@/lib/firebase/admin";
import { getFieldType } from "./utils";

/**
 * Pattern matchers for common data types
 */
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/[^\s]+$/,
  phone: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  isoDate: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/,
  currency: /^[€$£¥]\s*[\d,]+\.?\d*$|^[\d,]+\.?\d*\s*[€$£¥]$/,
  ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
  ipv6: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  slug: /^[a-z0-9]+(-[a-z0-9]+)*$/,
  hexColor: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
  creditCard: /^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/,
  postalCodeFR: /^\d{5}$/,
  percentage: /^\d+(\.\d+)?%$/,
};

/**
 * Field name hints for pattern detection
 */
const FIELD_NAME_HINTS: Record<string, string> = {
  email: "email",
  mail: "email",
  courriel: "email",
  url: "url",
  link: "url",
  lien: "url",
  website: "url",
  site: "url",
  phone: "phone",
  tel: "phone",
  telephone: "phone",
  mobile: "phone",
  price: "currency",
  prix: "currency",
  amount: "currency",
  montant: "currency",
  cost: "currency",
  cout: "currency",
  total: "currency",
  percent: "percentage",
  ratio: "percentage",
  ip: "ipv4",
  address: "address",
  adresse: "address",
  color: "hexColor",
  couleur: "hexColor",
  slug: "slug",
  uid: "uuid",
  uuid: "uuid",
  guid: "uuid",
};

/**
 * Detected pattern information
 */
export interface FieldPattern {
  type: string; // Base type (string, number, etc.)
  inferredType: string; // Inferred semantic type (email, url, currency, etc.)
  confidence: number; // 0-1 confidence score
  sampleValues: unknown[];
  nullCount: number;
  uniqueRatio: number; // unique values / total values
  isCategorial: boolean; // Low cardinality string field
}

/**
 * Pattern analysis result for a collection
 */
export interface CollectionPatterns {
  collectionName: string;
  documentCount: number;
  fields: Record<string, FieldPattern>;
  suggestedPrimaryKey?: string;
  temporalFields: string[];
  categoricalFields: string[];
  numericFields: string[];
}

/**
 * Analyze patterns in a single field
 */
function detectPattern(fieldName: string, values: unknown[]): FieldPattern {
  const nonNullValues = values.filter((v) => v != null);
  const stringValues = nonNullValues.filter((v) => typeof v === "string") as string[];
  const uniqueValues = new Set(
    nonNullValues.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
  );

  const baseType = nonNullValues.length > 0 ? getFieldType(nonNullValues[0]) : "unknown";
  let inferredType = baseType;
  let confidence = 1.0;

  // Check for semantic patterns in strings
  if (stringValues.length > 0) {
    let bestMatch: { pattern: string; ratio: number } | null = null;

    for (const [patternName, regex] of Object.entries(PATTERNS)) {
      const matches = stringValues.filter((s) => regex.test(s)).length;
      const matchRatio = matches / stringValues.length;

      if (matchRatio > 0.7 && (!bestMatch || matchRatio > bestMatch.ratio)) {
        bestMatch = { pattern: patternName, ratio: matchRatio };
      }
    }

    if (bestMatch) {
      inferredType = bestMatch.pattern;
      confidence = bestMatch.ratio;
    }

    // Check field name hints
    const lowerFieldName = fieldName.toLowerCase();
    for (const [hint, type] of Object.entries(FIELD_NAME_HINTS)) {
      if (lowerFieldName.includes(hint)) {
        // If field name suggests a type and values partially match, increase confidence
        if (inferredType === baseType) {
          inferredType = type;
          confidence = 0.85;
        } else if (inferredType === type) {
          confidence = Math.min(1, confidence + 0.1);
        }
        break;
      }
    }
  }

  // Check for numeric patterns
  const numericValues = nonNullValues.filter((v) => typeof v === "number") as number[];
  if (numericValues.length > 0) {
    const lowerFieldName = fieldName.toLowerCase();

    if (
      lowerFieldName.includes("price") ||
      lowerFieldName.includes("prix") ||
      lowerFieldName.includes("amount") ||
      lowerFieldName.includes("montant") ||
      lowerFieldName.includes("cost") ||
      lowerFieldName.includes("total")
    ) {
      inferredType = "currency";
      confidence = 0.9;
    } else if (
      lowerFieldName.includes("percent") ||
      lowerFieldName.includes("ratio") ||
      lowerFieldName.includes("rate") ||
      lowerFieldName.includes("taux")
    ) {
      inferredType = "percentage";
      confidence = 0.9;
    } else if (
      lowerFieldName.includes("lat") ||
      lowerFieldName.includes("lon") ||
      lowerFieldName.includes("coord")
    ) {
      inferredType = "coordinate";
      confidence = 0.85;
    } else if (
      lowerFieldName.includes("age") ||
      lowerFieldName.includes("year") ||
      lowerFieldName.includes("annee")
    ) {
      inferredType = "age";
      confidence = 0.8;
    } else if (lowerFieldName.includes("count") || lowerFieldName.includes("nombre")) {
      inferredType = "count";
      confidence = 0.8;
    }
  }

  // Determine if categorical
  const uniqueRatio = nonNullValues.length > 0 ? uniqueValues.size / nonNullValues.length : 0;
  const isCategorial = baseType === "string" && uniqueRatio < 0.1 && uniqueValues.size <= 20;

  return {
    type: baseType,
    inferredType,
    confidence,
    sampleValues: nonNullValues.slice(0, 5),
    nullCount: values.length - nonNullValues.length,
    uniqueRatio: Math.round(uniqueRatio * 100) / 100,
    isCategorial,
  };
}

/**
 * Analyze all field patterns in a collection
 */
export async function analyzeCollectionPatterns(
  collectionName: string,
  sampleSize: number = 200
): Promise<CollectionPatterns> {
  const db = getFirestore();
  const collection = db.collection(collectionName);

  // Get document count
  const countSnapshot = await collection.count().get();
  const documentCount = countSnapshot.data().count;

  // Get sample documents
  const docs = await collection.limit(sampleSize).get();

  if (docs.empty) {
    return {
      collectionName,
      documentCount: 0,
      fields: {},
      temporalFields: [],
      categoricalFields: [],
      numericFields: [],
    };
  }

  // Collect values for each field
  const fieldValues: Record<string, unknown[]> = {};

  docs.forEach((doc) => {
    const data = doc.data();
    for (const [key, value] of Object.entries(data)) {
      if (!fieldValues[key]) fieldValues[key] = [];
      fieldValues[key].push(value);
    }
  });

  // Analyze patterns for each field
  const fields: Record<string, FieldPattern> = {};
  const temporalFields: string[] = [];
  const categoricalFields: string[] = [];
  const numericFields: string[] = [];

  for (const [fieldName, values] of Object.entries(fieldValues)) {
    const pattern = detectPattern(fieldName, values);
    fields[fieldName] = pattern;

    // Categorize fields
    if (pattern.type === "timestamp" || pattern.inferredType === "isoDate") {
      temporalFields.push(fieldName);
    }
    if (pattern.isCategorial) {
      categoricalFields.push(fieldName);
    }
    if (pattern.type === "number") {
      numericFields.push(fieldName);
    }
  }

  // Try to identify primary key
  let suggestedPrimaryKey: string | undefined;
  for (const [fieldName, pattern] of Object.entries(fields)) {
    if (
      pattern.uniqueRatio === 1 &&
      (pattern.inferredType === "uuid" ||
        fieldName.toLowerCase().includes("id") ||
        fieldName.toLowerCase().includes("key"))
    ) {
      suggestedPrimaryKey = fieldName;
      break;
    }
  }

  return {
    collectionName,
    documentCount,
    fields,
    suggestedPrimaryKey,
    temporalFields,
    categoricalFields,
    numericFields,
  };
}

/**
 * Get inferred type label in French
 */
export function getInferredTypeLabel(inferredType: string): string {
  const labels: Record<string, string> = {
    email: "Email",
    url: "URL",
    phone: "Téléphone",
    uuid: "UUID",
    isoDate: "Date ISO",
    currency: "Devise",
    ipv4: "Adresse IPv4",
    ipv6: "Adresse IPv6",
    slug: "Slug",
    hexColor: "Couleur Hex",
    creditCard: "Carte bancaire",
    postalCodeFR: "Code postal",
    percentage: "Pourcentage",
    coordinate: "Coordonnée",
    age: "Âge",
    count: "Compteur",
    string: "Texte",
    number: "Nombre",
    boolean: "Booléen",
    timestamp: "Date/Heure",
    array: "Tableau",
    map: "Objet",
    reference: "Référence",
    geopoint: "Point géo",
    unknown: "Inconnu",
  };

  return labels[inferredType] || inferredType;
}

/**
 * Get color for inferred type
 */
export function getInferredTypeColor(inferredType: string): string {
  const colors: Record<string, string> = {
    email: "text-blue-600 dark:text-blue-400",
    url: "text-cyan-600 dark:text-cyan-400",
    phone: "text-emerald-600 dark:text-emerald-400",
    uuid: "text-purple-600 dark:text-purple-400",
    isoDate: "text-amber-600 dark:text-amber-400",
    currency: "text-green-600 dark:text-green-400",
    ipv4: "text-orange-600 dark:text-orange-400",
    percentage: "text-pink-600 dark:text-pink-400",
    coordinate: "text-teal-600 dark:text-teal-400",
  };

  return colors[inferredType] || "text-zinc-600 dark:text-zinc-400";
}
