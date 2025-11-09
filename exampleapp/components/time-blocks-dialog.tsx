"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Calendar, TrendingUp } from "lucide-react";
import { useMeetings } from "@/lib/hooks";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

interface TimeBlocksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TimeBlocksDialog({ open, onOpenChange }: TimeBlocksDialogProps) {
  const { meetings } = useMeetings();

  // Get current week
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getMeetingsForDay = (day: Date) => {
    return meetings.filter((meeting) => {
      const meetingDate = parseISO(meeting.time);
      return isSameDay(meetingDate, day) && meeting.status !== "Cancelled";
    });
  };

  const calculateTotalHours = (dayMeetings: typeof meetings) => {
    return dayMeetings.reduce((total, meeting) => total + meeting.duration, 0) / 60;
  };

  const getDayColor = (hours: number) => {
    if (hours >= 6) return "bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800";
    if (hours >= 4) return "bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800";
    return "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Review Time Blocks
          </DialogTitle>
          <DialogDescription>Analyze your meeting schedule for the current week</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
              <p className="text-2xl font-bold">
                {meetings.filter((m) => {
                  const meetingDate = parseISO(m.time);
                  return meetingDate >= weekStart && meetingDate <= weekEnd && m.status !== "Cancelled";
                }).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Meetings</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Time in Meetings</p>
              </div>
              <p className="text-2xl font-bold">
                {(
                  meetings
                    .filter((m) => {
                      const meetingDate = parseISO(m.time);
                      return meetingDate >= weekStart && meetingDate <= weekEnd && m.status !== "Cancelled";
                    })
                    .reduce((total, m) => total + m.duration, 0) / 60
                ).toFixed(1)}
                h
              </p>
              <p className="text-xs text-muted-foreground mt-1">Hours</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Busiest Day</p>
              </div>
              <p className="text-2xl font-bold">
                {format(
                  weekDays.reduce(
                    (busiest, day) => {
                      const dayHours = calculateTotalHours(getMeetingsForDay(day));
                      return dayHours > busiest.hours ? { day, hours: dayHours } : busiest;
                    },
                    { day: weekDays[0], hours: 0 }
                  ).day,
                  "EEE"
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Most Meetings</p>
            </Card>
          </div>

          {/* Daily Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Daily Breakdown</h3>
            {weekDays.map((day) => {
              const dayMeetings = getMeetingsForDay(day);
              const totalHours = calculateTotalHours(dayMeetings);
              const isToday = isSameDay(day, now);

              return (
                <Card key={day.toISOString()} className={`p-4 ${getDayColor(totalHours)} ${isToday ? "ring-2 ring-primary" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{format(day, "EEEE, MMM d")}</p>
                      {isToday && <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded">Today</span>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{totalHours.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground">{dayMeetings.length} meeting{dayMeetings.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  {dayMeetings.length > 0 ? (
                    <div className="space-y-2">
                      {dayMeetings.map((meeting) => (
                        <div key={meeting.id} className="flex items-center justify-between text-sm bg-background/50 p-2 rounded">
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(meeting.time), "h:mm a")} • {meeting.duration} min
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">{meeting.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No meetings scheduled</p>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Recommendations */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-2 text-sm">Recommendations</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {weekDays.some((day) => calculateTotalHours(getMeetingsForDay(day)) >= 6) && (
                <li>• Consider rescheduling some meetings - you have days with 6+ hours of meetings</li>
              )}
              {weekDays.some((day) => getMeetingsForDay(day).length === 0) && (
                <li>• You have some free days - great for focus time!</li>
              )}
              <li>• Try to batch similar meetings together to reduce context switching</li>
            </ul>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

