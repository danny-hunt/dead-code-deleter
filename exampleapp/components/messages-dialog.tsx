"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, User, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Message {
  id: string;
  from: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface MessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockMessages: Message[] = [
  {
    id: "1",
    from: "Sarah Johnson",
    subject: "Meeting Follow-up",
    message: "Thanks for the great discussion today. Here are the action items we agreed on...",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "2",
    from: "Mike Chen",
    subject: "Project Update",
    message: "The design mockups are ready for review. Can we schedule a quick sync?",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "3",
    from: "Emily Davis",
    subject: "Meeting Request",
    message: "Would you be available for a 30-minute call tomorrow afternoon?",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "4",
    from: "Team Calendar",
    subject: "Weekly Sync Reminder",
    message: "Don't forget about our weekly team sync tomorrow at 10 AM.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

export default function MessagesDialog({ open, onOpenChange }: MessagesDialogProps) {
  const unreadCount = mockMessages.filter((m) => !m.read).length;

  const formatTime = (timestamp: string) => {
    const date = parseISO(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return format(date, "MMM d");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messages {unreadCount > 0 && <span className="text-sm font-normal text-muted-foreground">({unreadCount} unread)</span>}
          </DialogTitle>
          <DialogDescription>Your meeting-related messages and communications</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {mockMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No messages</div>
          ) : (
            mockMessages.map((message) => (
              <Card
                key={message.id}
                className={`p-4 cursor-pointer hover:bg-secondary transition-colors ${!message.read ? "border-l-4 border-l-primary" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{message.from}</p>
                          {!message.read && <span className="w-2 h-2 bg-primary rounded-full" />}
                        </div>
                        <p className="font-medium text-sm mt-1">{message.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{message.message}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => alert("Mark all as read feature coming soon!")}>Mark All as Read</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

