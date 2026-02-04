/**
 * Determine the field type from a value
 */
export function getFieldType(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (Array.isArray(value)) return "array";

  if (value instanceof Date) return "timestamp";

  if (typeof value === "object") {
    // Check if it's a Firestore Timestamp
    if ("toDate" in value && typeof (value as { toDate: unknown }).toDate === "function") {
      return "timestamp";
    }
    // Check if it's a GeoPoint
    if ("latitude" in value && "longitude" in value) {
      return "geopoint";
    }
    // Check if it's a DocumentReference
    if ("path" in value && "id" in value) {
      return "reference";
    }
    return "map";
  }

  return typeof value;
}

/**
 * Format a field value for display
 */
export function formatFieldValue(value: unknown, maxLength: number = 50): string {
  if (value === null) return "N/A";
  if (value === undefined) return "N/A";

  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    // Check if it's a Firestore Timestamp
    if ("toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }
    // Check if it's a GeoPoint
    if ("latitude" in value && "longitude" in value) {
      const geo = value as { latitude: number; longitude: number };
      return `(${geo.latitude}, ${geo.longitude})`;
    }
    // Check if it's a DocumentReference
    if ("path" in value) {
      return `ref: ${(value as { path: string }).path}`;
    }
    return "{...}";
  }

  const str = String(value);
  if (str.length > maxLength) {
    return str.slice(0, maxLength) + "...";
  }
  return str;
}

/**
 * Estimate document size in bytes
 */
export function estimateDocumentSize(data: Record<string, unknown>): number {
  const json = JSON.stringify(data);
  return new TextEncoder().encode(json).length;
}

/**
 * Generate a color for a collection based on its name
 */
export function getCollectionColor(name: string, index: number): string {
  const colors = [
    "#f59e0b", // amber-500
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f97316", // orange-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#6366f1", // indigo-500
    "#14b8a6", // teal-500
  ];

  return colors[index % colors.length];
}

/**
 * Sanitize collection name for display
 */
export function sanitizeCollectionName(name: string): string {
  // Remove leading underscores (Firestore reserved)
  if (name.startsWith("_")) {
    return name.slice(1);
  }
  return name;
}

/**
 * Check if a collection name is a system collection
 */
export function isSystemCollection(name: string): boolean {
  return name.startsWith("_") || name.startsWith("__");
}
