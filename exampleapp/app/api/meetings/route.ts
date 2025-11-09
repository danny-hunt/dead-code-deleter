import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, Meeting } from "@/lib/types";

// GET /api/meetings - Get all meetings or search/filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let meetings: Meeting[];

    if (query) {
      meetings = await db.meetings.search(query);
    } else if (status || startDate || endDate) {
      meetings = await db.meetings.filter(status || undefined, startDate || undefined, endDate || undefined);
    } else {
      meetings = await db.meetings.getAll();
    }

    const response: ApiResponse<Meeting[]> = {
      success: true,
      data: meetings,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Meeting[]> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch meetings",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.time || !body.duration) {
      const response: ApiResponse<Meeting> = {
        success: false,
        error: "Missing required fields: title, time, duration",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const newMeeting = await db.meetings.create({
      title: body.title,
      attendees: body.attendees || 0,
      time: body.time,
      duration: body.duration,
      status: body.status || "Confirmed",
      description: body.description,
      location: body.location,
      organizer: body.organizer,
      hasNotes: body.hasNotes || false,
      hasAgenda: body.hasAgenda || false,
    });

    const response: ApiResponse<Meeting> = {
      success: true,
      data: newMeeting,
      message: "Meeting created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: ApiResponse<Meeting> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create meeting",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
