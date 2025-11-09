import { NextRequest, NextResponse } from "next/server";
import { DeletionsResponse } from "@/lib/types";
import { dequeueAllDeletions } from "@/lib/storage";

/**
 * GET /api/deletions?projectId=xxx
 * Retrieve and dequeue all pending deletions for a project
 * This is called by the exampleapp instrumentation to check for work
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        {
          error: "Project ID is required",
        },
        { status: 400 }
      );
    }

    // Get and remove all deletions for this project
    const deletions = await dequeueAllDeletions(projectId);

    // Log the request
    console.log(
      `[${new Date().toISOString()}] Dequeued ${deletions.length} deletion(s) for project "${projectId}"`
    );

    const response: DeletionsResponse = {
      deletions,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // Enable CORS for cross-origin requests from instrumented apps
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error fetching deletions:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch deletions",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/deletions
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

