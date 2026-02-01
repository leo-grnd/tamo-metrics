import { NextResponse } from "next/server";
import { listCollections, getCollectionsInfo } from "@/lib/analytics/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get("detailed") === "true";

    if (detailed) {
      const collectionsInfo = await getCollectionsInfo();
      return NextResponse.json({ collections: collectionsInfo });
    }

    const collections = await listCollections();
    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);

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
            : "Failed to fetch collections",
      },
      { status: 500 }
    );
  }
}
