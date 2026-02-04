import { getFirestore } from "@/lib/firebase/admin";

/**
 * Information about a subcollection
 */
export interface SubcollectionInfo {
  name: string;
  path: string;
  parentCollection: string;
  parentDocId: string;
  documentCount: number;
  depth: number;
}

/**
 * Complete collection hierarchy
 */
export interface CollectionHierarchy {
  rootCollections: {
    name: string;
    documentCount: number;
    hasSubcollections: boolean;
  }[];
  subcollections: SubcollectionInfo[];
  totalDepth: number;
  totalSubcollections: number;
}

/**
 * Discover subcollections for a given collection path
 * This function samples documents and checks for subcollections
 */
export async function discoverSubcollections(
  collectionPath: string,
  maxDepth: number = 2,
  currentDepth: number = 0,
  sampleSize: number = 3
): Promise<SubcollectionInfo[]> {
  if (currentDepth >= maxDepth) {
    return [];
  }

  const db = getFirestore();
  const collection = db.collection(collectionPath);

  // Sample a few documents to discover subcollections
  const sampleDocs = await collection.limit(sampleSize).get();
  const subcollections: SubcollectionInfo[] = [];
  const seenSubcollectionNames = new Set<string>();

  for (const doc of sampleDocs.docs) {
    try {
      const docSubcollections = await doc.ref.listCollections();

      for (const subCol of docSubcollections) {
        // Avoid duplicates (same subcollection name across different parent docs)
        if (seenSubcollectionNames.has(subCol.id)) {
          continue;
        }
        seenSubcollectionNames.add(subCol.id);

        const fullPath = `${collectionPath}/${doc.id}/${subCol.id}`;

        // Get count for this subcollection
        let documentCount = 0;
        try {
          const countSnapshot = await db.collection(fullPath).count().get();
          documentCount = countSnapshot.data().count;
        } catch {
          // Count might fail, default to 0
        }

        const parentParts = collectionPath.split("/");
        const parentCollection = parentParts[parentParts.length - 1] || collectionPath;

        subcollections.push({
          name: subCol.id,
          path: fullPath,
          parentCollection,
          parentDocId: doc.id,
          documentCount,
          depth: currentDepth + 1,
        });

        // Recursively discover nested subcollections
        if (currentDepth + 1 < maxDepth) {
          const nested = await discoverSubcollections(
            fullPath,
            maxDepth,
            currentDepth + 1,
            sampleSize
          );
          subcollections.push(...nested);
        }
      }
    } catch (error) {
      // Continue with other documents if one fails
      console.error(`Error listing subcollections for ${doc.ref.path}:`, error);
    }
  }

  return subcollections;
}

/**
 * Get the complete collection hierarchy including root collections and subcollections
 */
export async function getCollectionHierarchy(
  maxDepth: number = 2,
  sampleSize: number = 3
): Promise<CollectionHierarchy> {
  const db = getFirestore();

  // Get all root collections
  const rootColRefs = await db.listCollections();
  const allSubcollections: SubcollectionInfo[] = [];

  const rootCollections = await Promise.all(
    rootColRefs.map(async (colRef) => {
      // Get document count
      const countSnapshot = await colRef.count().get();
      const documentCount = countSnapshot.data().count;

      // Discover subcollections for this root collection
      const subcollections = await discoverSubcollections(
        colRef.id,
        maxDepth,
        0,
        sampleSize
      );

      allSubcollections.push(...subcollections);

      return {
        name: colRef.id,
        documentCount,
        hasSubcollections: subcollections.length > 0,
      };
    })
  );

  // Calculate max depth
  const totalDepth =
    allSubcollections.length > 0
      ? Math.max(...allSubcollections.map((s) => s.depth))
      : 0;

  return {
    rootCollections,
    subcollections: allSubcollections,
    totalDepth,
    totalSubcollections: allSubcollections.length,
  };
}

/**
 * Check if a collection has any subcollections
 */
export async function hasSubcollections(
  collectionPath: string,
  sampleSize: number = 3
): Promise<boolean> {
  const db = getFirestore();
  const collection = db.collection(collectionPath);

  const sampleDocs = await collection.limit(sampleSize).get();

  for (const doc of sampleDocs.docs) {
    try {
      const subcollections = await doc.ref.listCollections();
      if (subcollections.length > 0) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

/**
 * Get subcollection names for a specific document
 */
export async function getDocumentSubcollections(
  collectionPath: string,
  documentId: string
): Promise<string[]> {
  const db = getFirestore();
  const docRef = db.collection(collectionPath).doc(documentId);

  try {
    const subcollections = await docRef.listCollections();
    return subcollections.map((col) => col.id);
  } catch {
    return [];
  }
}

/**
 * Build a tree structure from subcollections for UI display
 */
export interface CollectionTreeNode {
  name: string;
  path: string;
  documentCount: number;
  depth: number;
  children: CollectionTreeNode[];
}

export function buildCollectionTree(
  rootCollections: { name: string; documentCount: number }[],
  subcollections: SubcollectionInfo[]
): CollectionTreeNode[] {
  const tree: CollectionTreeNode[] = rootCollections.map((root) => ({
    name: root.name,
    path: root.name,
    documentCount: root.documentCount,
    depth: 0,
    children: [],
  }));

  // Sort subcollections by path length to process parents first
  const sortedSubcollections = [...subcollections].sort(
    (a, b) => a.path.split("/").length - b.path.split("/").length
  );

  // Add subcollections to tree
  for (const sub of sortedSubcollections) {
    const pathParts = sub.path.split("/");
    const rootName = pathParts[0];

    const rootNode = tree.find((n) => n.name === rootName);
    if (!rootNode) continue;

    // Navigate to parent
    let currentNode = rootNode;
    for (let i = 2; i < pathParts.length - 1; i += 2) {
      const childName = pathParts[i];
      const child = currentNode.children.find((c) => c.name === childName);
      if (child) {
        currentNode = child;
      }
    }

    // Add this subcollection as a child
    currentNode.children.push({
      name: sub.name,
      path: sub.path,
      documentCount: sub.documentCount,
      depth: sub.depth,
      children: [],
    });
  }

  return tree;
}
