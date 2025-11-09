import { NextRequest, NextResponse } from "next/server";
import { AgentTriggerResponse } from "@/lib/types";

/**
 * POST /api/agent/trigger
 * Trigger dead code removal agent (stubbed for now)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.projectId) {
      return NextResponse.json<AgentTriggerResponse>(
        {
          status: "error",
          message: "Project ID is required",
        },
        { status: 400 }
      );
    }

    // Validate functions array if provided
    if (body.functions && !Array.isArray(body.functions)) {
      return NextResponse.json<AgentTriggerResponse>(
        {
          status: "error",
          message: "Functions must be an array",
        },
        { status: 400 }
      );
    }

    // Log the trigger request
    console.log(
      `[${new Date().toISOString()}] Agent trigger requested for project "${
        body.projectId
      }" with ${body.functions?.length || 0} functions`
    );

    // Return stub response
    const response: AgentTriggerResponse = {
      status: "stub",
      message:
        "Agent integration coming soon! This will integrate with cursor-agent to automatically create PRs removing dead code.",
      jobId: `stub-${Date.now()}`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error triggering agent:", error);

    return NextResponse.json<AgentTriggerResponse>(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to trigger agent",
      },
      { status: 500 }
    );
  }
}

