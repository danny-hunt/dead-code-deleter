import { NextResponse } from "next/server";

// Mock team members data
const teamMembers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "Owner",
    status: "Active",
    joinedAt: "2024-01-15",
    meetingsThisWeek: 12,
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael@company.com",
    role: "Admin",
    status: "Active",
    joinedAt: "2024-02-01",
    meetingsThisWeek: 8,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily@company.com",
    role: "Member",
    status: "Active",
    joinedAt: "2024-03-10",
    meetingsThisWeek: 15,
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: teamMembers,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const newMember = {
    id: Date.now().toString(),
    ...body,
    status: "Invited",
    joinedAt: new Date().toISOString(),
    meetingsThisWeek: 0,
  };

  return NextResponse.json({
    success: true,
    data: newMember,
    message: "Team member invited successfully",
  });
}

