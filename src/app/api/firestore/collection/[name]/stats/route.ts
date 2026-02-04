import { NextResponse } from "next/server";
import { getAllFieldStats } from "@/lib/analytics/field-stats";
import { analyzeCollectionPatterns } from "@/lib/analytics/pattern-detection";

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
    const sampleSize = parseInt(searchParams.get("sampleSize") || "200", 10);

    // Get field statistics
    const fieldStats = await getAllFieldStats(name, sampleSize);

    // Get pattern analysis
    const patterns = await analyzeCollectionPatterns(name, sampleSize);

    return NextResponse.json({
      collectionName: name,
      fieldStats,
      patterns,
    });
  } catch (error) {
    console.error("Error analyzing collection fields:", error);

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
        message: error instanceof Error ? error.message : "Failed to analyze collection",
      },
      { status: 500 }
    );
  }
}
