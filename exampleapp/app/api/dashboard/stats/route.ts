import { NextResponse } from "next/server";
import { analytics } from "@/lib/db";
import { ApiResponse, DashboardStats } from "@/lib/types";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const stats = await analytics.getDashboardStats();

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<DashboardStats> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch dashboard stats",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
