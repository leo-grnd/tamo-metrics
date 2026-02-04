import { getFirestore } from "@/lib/firebase/admin";

/**
 * Relationship type between collections
 */
export type RelationshipType = "reference" | "foreign_key" | "embedded";

/**
 * A detected relationship between two collections
 */
export interface CollectionRelationship {
  sourceCollection: string;
  targetCollection: string;
  sourceField: string;
  relationshipType: RelationshipType;
  confidence: number;
  sampleValue?: string;
}

/**
 * Complete relationship map for a database
 */
export interface DatabaseRelationships {
  relationships: CollectionRelationship[];
  collections: string[];
  relationshipCount: number;
}

/**
 * Detect relationships from a single collection to other collections
 */
export async function detectCollectionRelationships(
  collectionName: string,
  allCollections: string[],
  sampleSize: number = 20
): Promise<CollectionRelationship[]> {
  const db = getFirestore();
  const collection = db.collection(collectionName);

  const sample = await collection.limit(sampleSize).get();
  if (sample.empty) {
    return [];
  }

  const relationships: CollectionRelationship[] = [];
  const seenRelationships = new Set<string>();

  // Analyze each document
  for (const doc of sample.docs) {
    const data = doc.data();

    for (const [field, value] of Object.entries(data)) {
      const relationshipKey = `${collectionName}:${field}`;
      if (seenRelationships.has(relationshipKey)) {
        continue;
      }

      // Check for Firestore DocumentReference
      if (value && typeof value === "object" && "path" in value && "id" in value) {
        const refPath = (value as { path: string }).path;
        const targetCollection = refPath.split("/")[0];

        seenRelationships.add(relationshipKey);
        relationships.push({
          sourceCollection: collectionName,
          targetCollection,
          sourceField: field,
          relationshipType: "reference",
          confidence: 1.0,
          sampleValue: refPath,
        });
        continue;
      }

      // Check for foreign key patterns (field ending with Id, _id, Ref, _ref)
      if (typeof value === "string" && value.length > 0) {
        const foreignKeyPatterns = [
          { suffix: "Id", strip: "Id" },
          { suffix: "_id", strip: "_id" },
          { suffix: "Ref", strip: "Ref" },
          { suffix: "_ref", strip: "_ref" },
          { suffix: "ID", strip: "ID" },
        ];

        for (const { suffix, strip } of foreignKeyPatterns) {
          if (field.endsWith(suffix)) {
            const potentialCollectionBase = field.slice(0, -strip.length).toLowerCase();

            // Try to match with collection names
            const matchingCollection = allCollections.find((c) => {
              const cLower = c.toLowerCase();
              return (
                cLower === potentialCollectionBase ||
                cLower === potentialCollectionBase + "s" ||
                cLower === potentialCollectionBase + "es" ||
                (potentialCollectionBase.endsWith("y") &&
                  cLower === potentialCollectionBase.slice(0, -1) + "ies")
              );
            });

            if (matchingCollection && matchingCollection !== collectionName) {
              seenRelationships.add(relationshipKey);
              relationships.push({
                sourceCollection: collectionName,
                targetCollection: matchingCollection,
                sourceField: field,
                relationshipType: "foreign_key",
                confidence: 0.85,
                sampleValue: String(value).slice(0, 30),
              });
              break;
            }
          }
        }
      }

      // Check for embedded collection references in field names
      if (typeof value === "string" || typeof value === "number") {
        for (const targetCollection of allCollections) {
          if (targetCollection === collectionName) continue;

          const fieldLower = field.toLowerCase();
          const targetLower = targetCollection.toLowerCase();
          const targetSingular = targetLower.endsWith("s")
            ? targetLower.slice(0, -1)
            : targetLower;

          // Check if field name suggests a reference
          if (
            fieldLower === targetSingular + "id" ||
            fieldLower === targetSingular + "_id" ||
            fieldLower === targetLower + "id" ||
            fieldLower === targetLower + "_id"
          ) {
            seenRelationships.add(relationshipKey);
            relationships.push({
              sourceCollection: collectionName,
              targetCollection,
              sourceField: field,
              relationshipType: "foreign_key",
              confidence: 0.7,
              sampleValue: String(value).slice(0, 30),
            });
            break;
          }
        }
      }
    }
  }

  return relationships;
}

/**
 * Detect all relationships in the database
 */
export async function detectAllRelationships(
  sampleSize: number = 20
): Promise<DatabaseRelationships> {
  const db = getFirestore();

  // Get all collection names
  const collectionsRefs = await db.listCollections();
  const collections = collectionsRefs.map((c) => c.id);

  // Detect relationships for each collection
  const allRelationships: CollectionRelationship[] = [];

  for (const collection of collections) {
    const relationships = await detectCollectionRelationships(
      collection,
      collections,
      sampleSize
    );
    allRelationships.push(...relationships);
  }

  return {
    relationships: allRelationships,
    collections,
    relationshipCount: allRelationships.length,
  };
}

/**
 * Get relationship type label in French
 */
export function getRelationshipTypeLabel(type: RelationshipType): string {
  const labels: Record<RelationshipType, string> = {
    reference: "Référence Firestore",
    foreign_key: "Clé étrangère",
    embedded: "Intégré",
  };
  return labels[type] || type;
}

/**
 * Build a graph structure from relationships for visualization
 */
export interface RelationshipGraph {
  nodes: { id: string; label: string; documentCount?: number }[];
  edges: { source: string; target: string; label: string; type: RelationshipType }[];
}

export function buildRelationshipGraph(
  relationships: CollectionRelationship[],
  collectionsInfo?: { name: string; documentCount: number }[]
): RelationshipGraph {
  const nodes = new Map<string, { id: string; label: string; documentCount?: number }>();
  const edges: RelationshipGraph["edges"] = [];

  // Add nodes for all collections involved in relationships
  for (const rel of relationships) {
    if (!nodes.has(rel.sourceCollection)) {
      const info = collectionsInfo?.find((c) => c.name === rel.sourceCollection);
      nodes.set(rel.sourceCollection, {
        id: rel.sourceCollection,
        label: rel.sourceCollection,
        documentCount: info?.documentCount,
      });
    }
    if (!nodes.has(rel.targetCollection)) {
      const info = collectionsInfo?.find((c) => c.name === rel.targetCollection);
      nodes.set(rel.targetCollection, {
        id: rel.targetCollection,
        label: rel.targetCollection,
        documentCount: info?.documentCount,
      });
    }

    edges.push({
      source: rel.sourceCollection,
      target: rel.targetCollection,
      label: rel.sourceField,
      type: rel.relationshipType,
    });
  }

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}
