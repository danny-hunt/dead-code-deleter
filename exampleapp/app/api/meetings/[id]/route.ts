import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, Meeting } from "@/lib/types";

// GET /api/meetings/[id] - Get a single meeting
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const meeting = await db.meetings.getById(id);

    if (!meeting) {
      const response: ApiResponse<Meeting> = {
        success: false,
        error: "Meeting not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Meeting> = {
      success: true,
      data: meeting,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Meeting> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch meeting",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/meetings/[id] - Update a meeting
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedMeeting = await db.meetings.update(id, body);

    if (!updatedMeeting) {
      const response: ApiResponse<Meeting> = {
        success: false,
        error: "Meeting not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Meeting> = {
      success: true,
      data: updatedMeeting,
      message: "Meeting updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Meeting> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update meeting",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/meetings/[id] - Delete a meeting
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await db.meetings.delete(id);

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Meeting not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<null> = {
      success: true,
      message: "Meeting deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete meeting",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
