"use client";

import { useState } from "react";
import { Search, Plus, Filter, Eye, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useMeetings } from "@/lib/hooks";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

export default function Meetings() {
  const [searchQuery, setSearchQuery] = useState("");
  const { meetings, loading, error, deleteMeeting } = useMeetings(searchQuery ? { q: searchQuery } : undefined);

  const formatMeetingTime = (timeString: string) => {
    const date = parseISO(timeString);
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d 'at' h:mm a");
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}.5 hrs`;
    } else if (hours > 0) {
      return `${hours} hr${hours > 1 ? "s" : ""}`;
    }
    return `${mins} min`;
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      await deleteMeeting(id);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground mt-2">Manage all your scheduled meetings</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading meetings...</div>
      ) : error ? (
        <div className="text-center text-destructive py-12">{error}</div>
      ) : meetings.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          {searchQuery ? "No meetings found" : "No meetings scheduled"}
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{meeting.title}</h3>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{meeting.attendees} attendees</span>
                    <span>{formatMeetingTime(meeting.time)}</span>
                    <span>{formatDuration(meeting.duration)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      meeting.status === "Completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    }`}
                  >
                    {meeting.status}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(meeting.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
