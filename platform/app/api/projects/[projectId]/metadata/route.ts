import { NextRequest, NextResponse } from "next/server";
import {
  saveProjectMetadata,
  getProjectMetadata,
} from "@/lib/storage";
import {
  FunctionMetadataFile,
  MetadataUploadResponse,
  MetadataResponse,
} from "@/lib/types";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

/**
 * POST /api/projects/[projectId]/metadata
 * Receives and stores function metadata from static analysis
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { projectId } = await context.params;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json<MetadataUploadResponse>(
        {
          success: false,
          error: "Invalid projectId",
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate payload structure
    if (!body.projectId || typeof body.projectId !== "string") {
      return NextResponse.json<MetadataUploadResponse>(
        {
          success: false,
          error: "Missing or invalid projectId in body",
        },
        { status: 400 }
      );
    }

    if (body.projectId !== projectId) {
      return NextResponse.json<MetadataUploadResponse>(
        {
          success: false,
          error: "projectId mismatch between URL and body",
        },
        { status: 400 }
      );
    }

    if (!body.analyzedAt || typeof body.analyzedAt !== "number") {
      return NextResponse.json<MetadataUploadResponse>(
        {
          success: false,
          error: "Missing or invalid analyzedAt",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.functions)) {
      return NextResponse.json<MetadataUploadResponse>(
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
        !Array.isArray(func.contributors)
      ) {
        return NextResponse.json<MetadataUploadResponse>(
          {
            success: false,
            error: "Invalid function metadata format",
          },
          { status: 400 }
        );
      }

      // Validate contributors
      for (const contributor of func.contributors) {
        if (
          typeof contributor.name !== "string" ||
          typeof contributor.email !== "string"
        ) {
          return NextResponse.json<MetadataUploadResponse>(
            {
              success: false,
              error: "Invalid contributor format",
            },
            { status: 400 }
          );
        }
      }
    }

    const metadata: FunctionMetadataFile = {
      projectId: body.projectId,
      analyzedAt: body.analyzedAt,
      functions: body.functions,
    };

    // Save metadata to storage
    await saveProjectMetadata(metadata);

    console.log(
      `[${new Date().toISOString()}] Received metadata for project "${
        metadata.projectId
      }": ${metadata.functions.length} functions`
    );

    return NextResponse.json<MetadataUploadResponse>(
      {
        success: true,
        message: "Metadata received and stored successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing metadata:", error);

    return NextResponse.json<MetadataUploadResponse>(
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
 * GET /api/projects/[projectId]/metadata
 * Retrieves function metadata for a project
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { projectId } = await context.params;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json<MetadataResponse>(
        {
          projectId: "",
          analyzedAt: 0,
          functions: [],
        },
        { status: 400 }
      );
    }

    const metadata = await getProjectMetadata(projectId);

    if (!metadata) {
      return NextResponse.json<MetadataResponse>(
        {
          projectId,
          analyzedAt: 0,
          functions: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json<MetadataResponse>(metadata, { status: 200 });
  } catch (error) {
    console.error("Error fetching metadata:", error);

    return NextResponse.json<MetadataResponse>(
      {
        projectId: (await context.params).projectId || "",
        analyzedAt: 0,
        functions: [],
      },
      { status: 500 }
    );
  }
}

