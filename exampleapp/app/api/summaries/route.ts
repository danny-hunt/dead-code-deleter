import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, MeetingSummary } from "@/lib/types";

// GET /api/summaries - Get all meeting summaries
export async function GET() {
  try {
    const summaries = await db.summaries.getAll();

    const response: ApiResponse<MeetingSummary[]> = {
      success: true,
      data: summaries,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<MeetingSummary[]> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch summaries",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/summaries - Generate a new summary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.meetingId || !body.meeting || !body.date) {
      const response: ApiResponse<MeetingSummary> = {
        success: false,
        error: "Missing required fields: meetingId, meeting, date",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // In production, this would call an AI service to generate the summary
    const newSummary = await db.summaries.create({
      meetingId: body.meetingId,
      meeting: body.meeting,
      date: body.date,
      attendees: body.attendees || 0,
      keyPoints: body.keyPoints || [],
      fullSummary: body.fullSummary || "Summary will be generated automatically.",
    });

    const response: ApiResponse<MeetingSummary> = {
      success: true,
      data: newSummary,
      message: "Summary generated successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: ApiResponse<MeetingSummary> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate summary",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
