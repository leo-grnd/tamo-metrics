import { NextResponse } from "next/server";
import {
  getCollectionStats,
  getRecentDocuments,
} from "@/lib/analytics/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json(
        { error: "Bad Request", message: "Collection name is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeRecent = searchParams.get("recent") === "true";
    const recentLimit = parseInt(searchParams.get("limit") || "10", 10);

    const stats = await getCollectionStats(name);

    let recentDocuments = null;
    if (includeRecent) {
      recentDocuments = await getRecentDocuments(name, recentLimit);
    }

    return NextResponse.json({
      ...stats,
      recentDocuments,
    });
  } catch (error) {
    console.error("Error fetching collection stats:", error);

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
          error instanceof Error
            ? error.message
            : "Failed to fetch collection stats",
      },
      { status: 500 }
    );
  }
}
