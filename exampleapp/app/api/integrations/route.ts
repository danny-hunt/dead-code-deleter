import { NextResponse } from "next/server";

// Mock integrations data
const integrations = [
  {
    id: "1",
    name: "Google Calendar",
    description: "Sync your meetings with Google Calendar automatically",
    logo: "📅",
    category: "calendar",
    connected: true,
    features: ["Two-way sync", "Auto-create events", "Real-time updates"],
  },
  {
    id: "2",
    name: "Slack",
    description: "Get meeting notifications and summaries in Slack",
    logo: "💬",
    category: "communication",
    connected: true,
    features: ["Meeting reminders", "AI summaries", "Quick actions"],
  },
  {
    id: "3",
    name: "Microsoft Teams",
    description: "Integrate with Teams for seamless collaboration",
    logo: "👥",
    category: "communication",
    connected: false,
    features: ["Video calls", "Chat integration", "File sharing"],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: integrations,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { integrationId, connected } = body;

  // Simulate toggling integration connection
  return NextResponse.json({
    success: true,
    data: {
      integrationId,
      connected,
      updatedAt: new Date().toISOString(),
    },
    message: connected ? "Integration connected successfully" : "Integration disconnected",
  });
}

