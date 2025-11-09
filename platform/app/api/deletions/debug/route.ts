import { NextRequest, NextResponse } from "next/server";
import { getDeletionQueue } from "@/lib/storage";

/**
 * GET /api/deletions/debug
 * View the deletion queue without dequeuing items (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    // Get the entire queue
    const queue = await getDeletionQueue();

    // Filter by projectId if provided
    const items = projectId
      ? queue.items.filter((item) => item.projectId === projectId)
      : queue.items;

    console.log(
      `[${new Date().toISOString()}] Debug: Queue has ${queue.items.length} total items, ${items.length} for project "${projectId || "all"}"`
    );

    return NextResponse.json(
      {
        totalItems: queue.items.length,
        filteredItems: items.length,
        items,
        usingBlobStorage: !!process.env.BLOB_READ_WRITE_TOKEN,
        environment: process.env.VERCEL ? "vercel" : "local",
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching deletion queue:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch queue",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/deletions/debug
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

