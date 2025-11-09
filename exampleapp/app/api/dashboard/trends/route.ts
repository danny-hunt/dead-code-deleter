import { NextResponse } from "next/server";
import { analytics } from "@/lib/db";
import { ApiResponse, MeetingTrend } from "@/lib/types";

// GET /api/dashboard/trends - Get meeting trends
export async function GET() {
  try {
    const trends = await analytics.getMeetingTrends();

    const response: ApiResponse<MeetingTrend[]> = {
      success: true,
      data: trends,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<MeetingTrend[]> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch meeting trends",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
