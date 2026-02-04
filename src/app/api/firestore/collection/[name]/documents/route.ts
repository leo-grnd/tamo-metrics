import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebase/admin";

interface DocumentsResponse {
  documents: { id: string; data: Record<string, unknown> }[];
  hasMore: boolean;
  lastDocId: string | null;
  total?: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<DocumentsResponse | { error: string; message: string }>> {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json(
        { error: "Bad Request", message: "Collection name is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "25", 10), 100);
    const orderBy = searchParams.get("orderBy");
    const direction = (searchParams.get("direction") || "desc") as "asc" | "desc";
    const startAfter = searchParams.get("startAfter");
    const includeTotal = searchParams.get("includeTotal") === "true";

    const db = getFirestore();
    const collectionRef = db.collection(name);

    // Build the query
    let query: FirebaseFirestore.Query = collectionRef;

    // Apply ordering if specified
    if (orderBy) {
      query = query.orderBy(orderBy, direction);
    } else {
      // Try to use createdAt for ordering if available
      const sampleDoc = await collectionRef.limit(1).get();
      if (!sampleDoc.empty && "createdAt" in sampleDoc.docs[0].data()) {
        query = query.orderBy("createdAt", direction);
      }
    }

    // Apply cursor-based pagination
    if (startAfter) {
      const startDoc = await collectionRef.doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    // Fetch one extra to determine if there are more
    const snapshot = await query.limit(limit + 1).get();
    const hasMore = snapshot.docs.length > limit;

    // Get documents (excluding the extra one)
    const documents = snapshot.docs.slice(0, limit).map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));

    const lastDocId = documents.length > 0 ? documents[documents.length - 1].id : null;

    // Optionally get total count
    let total: number | undefined;
    if (includeTotal) {
      const countSnapshot = await collectionRef.count().get();
      total = countSnapshot.data().count;
    }

    return NextResponse.json({
      documents,
      hasMore,
      lastDocId,
      ...(total !== undefined && { total }),
    });
  } catch (error) {
    console.error("Error fetching paginated documents:", error);

    if (error instanceof Error && error.message.includes("FIREBASE_")) {
      return NextResponse.json(
        {
          error: "Configuration Error",
          message: "Firebase credentials are not configured.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to fetch documents",
      },
      { status: 500 }
    );
  }
}
