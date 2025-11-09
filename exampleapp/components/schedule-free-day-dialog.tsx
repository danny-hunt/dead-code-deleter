"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useMeetings } from "@/lib/hooks";

interface ScheduleFreeDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ScheduleFreeDayDialog({ open, onOpenChange }: ScheduleFreeDayDialogProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { meetings } = useMeetings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    setLoading(true);
    try {
      // Check for existing meetings on that date
      const selectedDateObj = new Date(selectedDate);
      const dayStart = new Date(selectedDateObj);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(selectedDateObj);
      dayEnd.setHours(23, 59, 59, 999);

      const conflictingMeetings = meetings.filter((meeting) => {
        const meetingDate = new Date(meeting.time);
        return meetingDate >= dayStart && meetingDate <= dayEnd && meeting.status !== "Cancelled";
      });

      if (conflictingMeetings.length > 0) {
        const confirmCancel = confirm(
          `You have ${conflictingMeetings.length} meeting(s) scheduled on ${format(selectedDateObj, "MMM d, yyyy")}. Do you want to cancel them to make this a meeting-free day?`
        );
        if (confirmCancel) {
          // In a real app, we would cancel these meetings
          alert(
            `${conflictingMeetings.length} meeting(s) would be cancelled. In a production app, this would update the meetings.`
          );
        } else {
          setLoading(false);
          return;
        }
      }

      // In a real app, we would create a "block" or update calendar
      alert(
        `Meeting-free day scheduled for ${format(selectedDateObj, "MMMM d, yyyy")}${reason ? `\nReason: ${reason}` : ""}`
      );
      onOpenChange(false);
      setSelectedDate("");
      setReason("");
    } catch (error) {
      alert("Failed to schedule meeting-free day");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Meeting-Free Day
          </DialogTitle>
          <DialogDescription>Block out a day to focus on deep work without meetings</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., Focus day, Project deadline, Personal time"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {selectedDate && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>
                  This will block out <strong>{format(new Date(selectedDate), "MMMM d, yyyy")}</strong> as a meeting-free
                  day
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Free Day"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

