"use client";

import { Clock, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: "weekly" | "monthly" | "custom";
  lastGenerated?: string;
  format: string[];
}

interface ReportCardProps {
  report: Report;
  onGenerate: (report: Report) => void;
}

export default function ReportCard({ report, onGenerate }: ReportCardProps) {
  const Icon = report.icon;

  const getTypeColor = () => {
    switch (report.type) {
      case "weekly":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "monthly":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{report.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor()}`}>
            {report.type}
          </span>
          {report.lastGenerated && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{report.lastGenerated}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Formats:</p>
          <div className="flex gap-1">
            {report.format.map((fmt) => (
              <span key={fmt} className="text-xs px-2 py-0.5 rounded bg-muted">
                {fmt}
              </span>
            ))}
          </div>
        </div>

        <Button
          className="w-full gap-2"
          onClick={() => onGenerate(report)}
        >
          <Download className="w-4 h-4" />
          Generate Report
        </Button>
      </div>
    </Card>
  );
}

