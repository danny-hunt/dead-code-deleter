"use client";

import { Download, Copy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSummaries } from "@/lib/hooks";

export default function Summaries() {
  const { summaries, loading, error } = useSummaries();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Summary copied to clipboard!");
    } catch (err) {
      alert("Failed to copy to clipboard");
    }
  };

  const handleExport = (summary: any) => {
    const content = `${summary.meeting}\n${summary.date} • ${
      summary.attendees
    } attendees\n\nKey Points:\n${summary.keyPoints.map((p: string) => `• ${p}`).join("\n")}\n\n${summary.fullSummary}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${summary.meeting.replace(/\s+/g, "_")}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Summaries</h1>
        <p className="text-muted-foreground mt-2">Auto-generated summaries of all your meetings</p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading summaries...</div>
      ) : error ? (
        <div className="text-center text-destructive py-12">{error}</div>
      ) : summaries.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No summaries available yet</div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => (
            <Card key={summary.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{summary.meeting}</h3>
                  <p className="text-sm text-muted-foreground">
                    {summary.date} • {summary.attendees} attendees
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    onClick={() => handleCopy(summary.fullSummary)}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    onClick={() => handleExport(summary)}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">Key Points</p>
                </div>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, i) => (
                    <li key={i} className="text-sm text-foreground flex gap-3">
                      <span className="text-primary font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <p className="text-sm text-foreground leading-relaxed">{summary.fullSummary}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
