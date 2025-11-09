"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCalendarEvents } from "@/lib/hooks";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const { events, loading, error } = useCalendarEvents(month, year);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Calculate calendar dates
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: 35 }, (_, i) => {
    const date = i - firstDayOfMonth + 1;
    return date > 0 && date <= daysInMonth ? date : null;
  });

  const today = new Date();
  const isToday = (date: number | null) => {
    if (!date) return false;
    return date === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  // Get today's events
  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === today.toDateString();
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-2">View and manage your meeting schedule</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {days.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {dates.map((date, i) => (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold border ${
                date === null
                  ? "border-transparent"
                  : isToday(date)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-border hover:bg-secondary cursor-pointer"
              }`}
            >
              {date}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">{todayEvents.length > 0 ? "Today's Events" : "Upcoming Events"}</h3>
        {loading ? (
          <div className="text-center text-muted-foreground py-4">Loading events...</div>
        ) : error ? (
          <div className="text-center text-destructive py-4">{error}</div>
        ) : todayEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">No events scheduled for today</div>
        ) : (
          <div className="space-y-3">
            {todayEvents.map((event) => (
              <div key={event.id} className="flex gap-4 p-3 bg-muted rounded-lg">
                <div className="text-sm font-semibold w-20">{event.time}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.duration}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
