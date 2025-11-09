"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, Eye, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useMeetings } from "@/lib/hooks";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import MeetingFormDialog from "@/components/meeting-form-dialog";
import { Meeting, MeetingStatus } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Meetings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  
  // Handle URL search parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const search = params.get("search");
      if (search) {
        setSearchQuery(search);
      }
    }
  }, []);

  const { meetings, loading, error, deleteMeeting, createMeeting, updateMeeting } = useMeetings(
    searchQuery || statusFilter !== "all" ? { q: searchQuery || undefined, status: statusFilter !== "all" ? statusFilter : undefined } : undefined
  );

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

  const handleCreateMeeting = async (data: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    await createMeeting(data);
  };

  const handleUpdateMeeting = async (data: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, data);
      setEditingMeeting(null);
    }
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setViewingMeeting(meeting);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setViewingMeeting(null);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground mt-2">Manage all your scheduled meetings</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
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
        <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowFilterDialog(true)}>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewMeeting(meeting)} title="View meeting">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditMeeting(meeting)} title="Edit meeting">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(meeting.id)} title="Delete meeting">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Meeting Dialog */}
      <MeetingFormDialog
        open={showCreateDialog || editingMeeting !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingMeeting(null);
          }
        }}
        meeting={editingMeeting}
        onSubmit={editingMeeting ? handleUpdateMeeting : handleCreateMeeting}
      />

      {/* View Meeting Dialog */}
      <Dialog open={viewingMeeting !== null} onOpenChange={(open) => !open && setViewingMeeting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingMeeting?.title}</DialogTitle>
            <DialogDescription>
              {viewingMeeting && `${formatMeetingTime(viewingMeeting.time)} • ${viewingMeeting.duration} minutes`}
            </DialogDescription>
          </DialogHeader>
          {viewingMeeting && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <p className="font-medium">{viewingMeeting.status}</p>
              </div>
              {viewingMeeting.organizer && (
                <div>
                  <Label className="text-xs text-muted-foreground">Organizer</Label>
                  <p className="font-medium">{viewingMeeting.organizer}</p>
                </div>
              )}
              {viewingMeeting.location && (
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <p className="font-medium">{viewingMeeting.location}</p>
                </div>
              )}
              {viewingMeeting.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm">{viewingMeeting.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <div className="text-xs text-muted-foreground">
                  {viewingMeeting.attendees} attendee{viewingMeeting.attendees !== 1 ? "s" : ""}
                </div>
                {viewingMeeting.hasAgenda && <span className="text-xs text-muted-foreground">• Has Agenda</span>}
                {viewingMeeting.hasNotes && <span className="text-xs text-muted-foreground">• Has Notes</span>}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => handleEditMeeting(viewingMeeting)}>
                  Edit Meeting
                </Button>
                <Button variant="destructive" onClick={() => {
                  handleDelete(viewingMeeting.id);
                  setViewingMeeting(null);
                }}>
                  Delete Meeting
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Meetings</DialogTitle>
            <DialogDescription>Filter meetings by status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Tentative">Tentative</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setStatusFilter("all");
                setShowFilterDialog(false);
              }}>
                Clear Filter
              </Button>
              <Button onClick={() => setShowFilterDialog(false)}>
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
