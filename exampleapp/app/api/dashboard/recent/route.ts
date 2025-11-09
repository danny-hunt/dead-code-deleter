import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, Meeting } from "@/lib/types";

// GET /api/dashboard/recent - Get recent meetings (completed, sorted by time)
export async function GET() {
  try {
    const allMeetings = await db.meetings.getAll();

    // Filter completed meetings and sort by time descending
    const recentMeetings = allMeetings
      .filter((m) => m.status === "Completed")
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5); // Get top 5 recent

    const response: ApiResponse<Meeting[]> = {
      success: true,
      data: recentMeetings,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Meeting[]> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch recent meetings",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
