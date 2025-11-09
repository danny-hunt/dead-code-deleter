import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, MeetingSummary } from "@/lib/types";

// GET /api/summaries/[id] - Get a single summary
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const summary = await db.summaries.getById(id);

    if (!summary) {
      const response: ApiResponse<MeetingSummary> = {
        success: false,
        error: "Summary not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<MeetingSummary> = {
      success: true,
      data: summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<MeetingSummary> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch summary",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
