import { NextRequest, NextResponse } from "next/server";
import { analytics } from "@/lib/db";
import { ApiResponse, CalendarEvent } from "@/lib/types";

// GET /api/calendar - Get calendar events for a specific month
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth()));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const events = await analytics.getCalendarEvents(month, year);

    const response: ApiResponse<CalendarEvent[]> = {
      success: true,
      data: events,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<CalendarEvent[]> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch calendar events",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
