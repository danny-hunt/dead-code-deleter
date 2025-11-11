import { NextResponse } from "next/server";

// Mock reports data
const reports = [
  {
    id: "1",
    title: "Weekly Meeting Summary",
    description: "Overview of all meetings, time spent, and key metrics for the past week",
    type: "weekly",
    lastGenerated: "2 hours ago",
    format: ["PDF", "CSV", "JSON"],
  },
  {
    id: "2",
    title: "Meeting Efficiency Report",
    description: "Analysis of meeting productivity, attendance rates, and optimization opportunities",
    type: "custom",
    lastGenerated: "1 day ago",
    format: ["PDF", "Excel"],
  },
  {
    id: "3",
    title: "Time Distribution Analysis",
    description: "Breakdown of time spent across different meeting types and departments",
    type: "monthly",
    lastGenerated: "3 days ago",
    format: ["PDF", "CSV"],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: reports,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { reportId, dateRange, format } = body;

  // Simulate report generation
  return NextResponse.json({
    success: true,
    data: {
      reportId,
      dateRange,
      format,
      url: `/downloads/report-${reportId}-${Date.now()}.${format}`,
      generatedAt: new Date().toISOString(),
    },
    message: "Report generated successfully",
  });
}

