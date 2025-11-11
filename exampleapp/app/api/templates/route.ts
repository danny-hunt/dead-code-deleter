import { NextResponse } from "next/server";

// Mock templates data
const templates = [
  {
    id: "1",
    name: "Weekly Team Standup",
    description: "Quick 15-minute sync for team updates and blockers",
    duration: 15,
    type: "standup",
    agenda: ["Round-robin updates", "Blockers discussion", "Week priorities"],
    favorite: true,
    usageCount: 48,
  },
  {
    id: "2",
    name: "1-on-1 Check-in",
    description: "Regular one-on-one meeting with direct reports",
    duration: 30,
    type: "1-on-1",
    agenda: ["Recent wins", "Challenges", "Career development", "Feedback"],
    favorite: true,
    usageCount: 32,
  },
  {
    id: "3",
    name: "Sprint Planning",
    description: "Plan the upcoming sprint with the development team",
    duration: 60,
    type: "planning",
    agenda: [
      "Review sprint goals",
      "Story estimation",
      "Capacity planning",
      "Risk assessment",
      "Team commitments",
    ],
    favorite: false,
    usageCount: 12,
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: templates,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const newTemplate = {
    id: Date.now().toString(),
    ...body,
    favorite: false,
    usageCount: 0,
  };

  return NextResponse.json({
    success: true,
    data: newTemplate,
    message: "Template created successfully",
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("id");

  return NextResponse.json({
    success: true,
    message: "Template deleted successfully",
    data: { templateId },
  });
}

