import { NextRequest, NextResponse } from "next/server";
import { getProjectUsage } from "@/lib/storage";
import { ProjectDetailsResponse, StoredFunction } from "@/lib/types";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

/**
 * GET /api/projects/[projectId]
 * Returns function usage stats for a specific project
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { projectId } = await context.params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Fetch project usage data
    const usage = await getProjectUsage(projectId);

    if (!usage) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Convert functions object to array
    const functionsArray: StoredFunction[] = Object.values(usage.functions);

    // Get query parameters for sorting
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get("sort") || "totalCalls";
    const order = searchParams.get("order") || "asc";

    // Sort functions
    const sortedFunctions = [...functionsArray].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "file":
          comparison = a.file.localeCompare(b.file);
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "line":
          comparison = a.line - b.line;
          break;
        case "totalCalls":
          comparison = a.totalCalls - b.totalCalls;
          break;
        case "lastSeen":
          comparison = a.lastSeen - b.lastSeen;
          break;
        default:
          comparison = a.totalCalls - b.totalCalls;
      }

      return order === "desc" ? -comparison : comparison;
    });

    const response: ProjectDetailsResponse = {
      projectId: usage.projectId,
      lastUpdated: usage.lastUpdated,
      functions: sortedFunctions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching project details:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch project details",
      },
      { status: 500 }
    );
  }
}

