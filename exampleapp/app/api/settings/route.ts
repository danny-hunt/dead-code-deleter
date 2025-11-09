import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiResponse, UserSettings } from "@/lib/types";

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const settings = await db.settings.get();

    const response: ApiResponse<UserSettings> = {
      success: true,
      data: settings,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<UserSettings> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch settings",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const updatedSettings = await db.settings.update(body);

    const response: ApiResponse<UserSettings> = {
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<UserSettings> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
