import { NextResponse } from "next/server";
import { analytics } from "@/lib/db";
import { ApiResponse, AnalyticsData } from "@/lib/types";

function transformAnalyticsData(analyticsData: AnalyticsData): AnalyticsData {
  return {
    ...analyticsData,
    timeByType: analyticsData.timeByType.map((type) => ({
      ...type,
      percent: type.percent * 100,
    })),
  };
}

// GET /api/analytics - Get analytics data
export async function GET() {
  try {
    const analyticsData = await analytics.getAnalyticsData();

    const response: ApiResponse<AnalyticsData> = {
      success: true,
      data: transformAnalyticsData(analyticsData),
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<AnalyticsData> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch analytics",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
