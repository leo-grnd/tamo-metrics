import { NextResponse } from "next/server";
import { getGlobalStats } from "@/lib/analytics/queries";

export async function GET() {
  try {
    const stats = await getGlobalStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching global stats:", error);

    // Check if it's a configuration error
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
          error instanceof Error ? error.message : "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
}
