"use client";

import { Card } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { useMeetingTrends } from "@/lib/hooks";

export default function MeetingTrends() {
  const { trends, loading, error } = useMeetingTrends();

  const maxMeetings = trends.length > 0 ? Math.max(...trends.map((t) => t.meetings)) : 1;
  const maxHours = trends.length > 0 ? Math.max(...trends.map((t) => t.hours)) : 1;

  const calculateReduction = () => {
    if (trends.length < 2) return 0;
    const first = trends[0].meetings;
    const last = trends[trends.length - 1].meetings;
    return Math.round(((first - last) / first) * 100);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Meeting Trends</h2>
        <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading trends...</div>
      ) : error ? (
        <div className="text-center text-destructive py-8">{error}</div>
      ) : trends.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No trend data available</div>
      ) : (
        <>
          <div className="space-y-6">
            {trends.map((week) => (
              <div key={week.week}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{week.week}</span>
                  <span className="text-muted-foreground">
                    {week.meetings} meetings, {week.hours}h
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(week.meetings / maxMeetings) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(week.hours / maxHours) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {calculateReduction() > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300">
                <span className="font-semibold">Great progress!</span> You've reduced meetings by {calculateReduction()}
                % this month.
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
