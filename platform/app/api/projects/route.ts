import { NextResponse } from "next/server";
import { getProjectIndex } from "@/lib/storage";
import { ProjectsResponse } from "@/lib/types";

/**
 * GET /api/projects
 * Returns list of all instrumented projects
 */
export async function GET() {
  try {
    const index = await getProjectIndex();

    // Sort projects by last updated (most recent first)
    const sortedProjects = [...index.projects].sort(
      (a, b) => b.lastUpdated - a.lastUpdated
    );

    const response: ProjectsResponse = {
      projects: sortedProjects,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

