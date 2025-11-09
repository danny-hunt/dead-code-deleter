import { NextRequest, NextResponse } from "next/server";
import { updateProjectUsage } from "@/lib/storage";
import { UsagePayload, UsageUploadResponse } from "@/lib/types";

/**
 * POST /api/usage
 * Receives instrumentation data from client apps
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate payload structure
    if (!body.projectId || typeof body.projectId !== "string") {
      return NextResponse.json<UsageUploadResponse>(
        {
          success: false,
          error: "Missing or invalid projectId",
        },
        { status: 400 }
      );
    }

    if (!body.timestamp || typeof body.timestamp !== "number") {
      return NextResponse.json<UsageUploadResponse>(
        {
          success: false,
          error: "Missing or invalid timestamp",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.functions)) {
      return NextResponse.json<UsageUploadResponse>(
        {
          success: false,
          error: "Missing or invalid functions array",
        },
        { status: 400 }
      );
    }

    // Validate each function in the array
    for (const func of body.functions) {
      if (
        !func.file ||
        typeof func.file !== "string" ||
        !func.name ||
        typeof func.name !== "string" ||
        typeof func.line !== "number" ||
        typeof func.callCount !== "number"
      ) {
        return NextResponse.json<UsageUploadResponse>(
          {
            success: false,
            error: "Invalid function data format",
          },
          { status: 400 }
        );
      }
    }

    const payload: UsagePayload = {
      projectId: body.projectId,
      timestamp: body.timestamp,
      functions: body.functions,
    };

    // Update project usage in blob storage
    await updateProjectUsage(payload);

    // Log for debugging
    console.log(
      `[${new Date().toISOString()}] Received usage data for project "${
        payload.projectId
      }": ${payload.functions.length} functions`
    );

    return NextResponse.json<UsageUploadResponse>(
      {
        success: true,
        message: "Usage data received successfully",
      },
      {
        status: 200,
        headers: {
          // Enable CORS for cross-origin requests from instrumented apps
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error processing usage data:", error);

    return NextResponse.json<UsageUploadResponse>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/usage
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

