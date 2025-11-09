import { NextRequest, NextResponse } from "next/server";
import { AgentTriggerResponse, DeletionQueueItem } from "@/lib/types";
import { queueFunctionsForDeletion } from "@/lib/storage";

/**
 * POST /api/agent/trigger
 * Queue functions for deletion by the cursor-agent running on the local machine
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

    if (!body.functions || body.functions.length === 0) {
      return NextResponse.json<AgentTriggerResponse>(
        {
          status: "error",
          message: "At least one function must be selected",
        },
        { status: 400 }
      );
    }

    // Parse function keys (format: "file:name:line")
    const deletionItems: DeletionQueueItem[] = [];
    for (const funcKey of body.functions) {
      const parts = funcKey.split(":");
      if (parts.length < 3) {
        return NextResponse.json<AgentTriggerResponse>(
          {
            status: "error",
            message: `Invalid function key format: ${funcKey}`,
          },
          { status: 400 }
        );
      }

      const line = parseInt(parts[parts.length - 1], 10);
      const name = parts[parts.length - 2];
      const file = parts.slice(0, parts.length - 2).join(":");

      deletionItems.push({
        projectId: "exampleapp",
        file,
        name,
        line,
        queuedAt: Date.now(),
      });
    }

    // Queue functions for deletion
    await queueFunctionsForDeletion(deletionItems);

    // Log the trigger request
    console.log(
      `[${new Date().toISOString()}] Queued ${deletionItems.length} functions for deletion in project "${
        body.projectId
      }"`
    );

    const response: AgentTriggerResponse = {
      status: "success",
      message: `Queued ${deletionItems.length} function${
        deletionItems.length !== 1 ? "s" : ""
      } for deletion. The local cursor-agent will process this soon.`,
      jobId: `deletion-${Date.now()}`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error triggering agent:", error);

    return NextResponse.json<AgentTriggerResponse>(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to trigger agent",
      },
      { status: 500 }
    );
  }
}
