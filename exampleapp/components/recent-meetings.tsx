"use client";

import { Card } from "@/components/ui/card";
import { Users, Clock, MessageSquare } from "lucide-react";
import { useRecentMeetings } from "@/lib/hooks";

export default function RecentMeetings() {
  const { meetings, loading, error } = useRecentMeetings();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Recent Meetings</h2>
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading recent meetings...</div>
      ) : error ? (
        <div className="text-center text-destructive py-8">{error}</div>
      ) : meetings.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No recent meetings</div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-secondary transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <p className="font-semibold text-sm">{meeting.title}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {meeting.attendees}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(meeting.duration)}
                  </div>
                  {meeting.hasNotes && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Notes
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs font-semibold text-green-600 dark:text-green-400">Completed</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
