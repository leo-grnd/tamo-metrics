import { NextResponse } from "next/server";
import { getCollectionTrends, listCollections } from "@/lib/analytics/queries";
import type { CollectionTrend } from "@/lib/firebase/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("collection");

    // If a specific collection is requested
    if (collectionName) {
      const trends = await getCollectionTrends(collectionName);
      return NextResponse.json({
        collectionName,
        data: trends,
      });
    }

    // Get trends for all collections (limited to first 5 for performance)
    const collections = await listCollections();
    const limitedCollections = collections.slice(0, 5);

    const allTrends: CollectionTrend[] = await Promise.all(
      limitedCollections.map(async (name) => {
        const data = await getCollectionTrends(name);
        return {
          collectionName: name,
          data,
        };
      })
    );

    return NextResponse.json({ trends: allTrends });
  } catch (error) {
    console.error("Error fetching trends:", error);

    if (error instanceof Error && error.message.includes("FIREBASE_")) {
      return NextResponse.json(
        {
          error: "Configuration Error",
          message:
            "Firebase credentials are not configured. Please check your .env.local file.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to fetch trends",
      },
      { status: 500 }
    );
  }
}
