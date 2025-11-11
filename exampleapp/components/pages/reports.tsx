"use client";

import { useState } from "react";
import { FileText, Download, Calendar, TrendingUp, Clock, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ReportCard from "@/components/report-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Report {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: "weekly" | "monthly" | "custom";
  lastGenerated?: string;
  format: string[];
}

export default function Reports() {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dateRange, setDateRange] = useState("last-7-days");
  const [format, setFormat] = useState("pdf");

  const reports: Report[] = [
    {
      id: "1",
      title: "Weekly Meeting Summary",
      description: "Overview of all meetings, time spent, and key metrics for the past week",
      icon: Calendar,
      type: "weekly",
      lastGenerated: "2 hours ago",
      format: ["PDF", "CSV", "JSON"],
    },
    {
      id: "2",
      title: "Meeting Efficiency Report",
      description: "Analysis of meeting productivity, attendance rates, and optimization opportunities",
      icon: TrendingUp,
      type: "custom",
      lastGenerated: "1 day ago",
      format: ["PDF", "Excel"],
    },
    {
      id: "3",
      title: "Time Distribution Analysis",
      description: "Breakdown of time spent across different meeting types and departments",
      icon: Clock,
      type: "monthly",
      lastGenerated: "3 days ago",
      format: ["PDF", "CSV"],
    },
    {
      id: "4",
      title: "Team Attendance Report",
      description: "Track team member participation, attendance patterns, and engagement",
      icon: Users,
      type: "custom",
      lastGenerated: "1 week ago",
      format: ["PDF", "Excel", "CSV"],
    },
    {
      id: "5",
      title: "Meeting Cost Analysis",
      description: "Calculate the cost of meetings based on attendee time and salaries",
      icon: TrendingUp,
      type: "monthly",
      lastGenerated: "2 weeks ago",
      format: ["PDF", "Excel"],
    },
    {
      id: "6",
      title: "Action Items Tracker",
      description: "Summary of action items from meetings, completion rates, and overdue tasks",
      icon: FileText,
      type: "weekly",
      format: ["PDF", "CSV", "JSON"],
    },
  ];

  const handleGenerateReport = (report: Report) => {
    setSelectedReport(report);
    setShowGenerateDialog(true);
  };

  const handleDownload = () => {
    console.log(`Generating ${selectedReport?.title} for ${dateRange} in ${format} format`);
    setShowGenerateDialog(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-2">Generate and export meeting analytics reports</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">Reports Generated</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-muted-foreground">Total Downloads</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Scheduled Reports</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">Active Automations</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onGenerate={handleGenerateReport} />
          ))}
        </div>
      </div>

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>{selectedReport?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedReport?.format.map((fmt) => (
                    <SelectItem key={fmt} value={fmt.toLowerCase()}>{fmt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Generate & Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

