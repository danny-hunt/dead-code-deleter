// Utility to generate weekly meeting reports

import { Meeting } from "./types";
import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalMeetings: number;
  totalHours: number;
  meetingsByDay: Array<{
    day: string;
    date: string;
    meetings: number;
    hours: number;
    meetingList: Array<{
      title: string;
      time: string;
      duration: number;
      status: string;
    }>;
  }>;
  meetingsByStatus: {
    Confirmed: number;
    Completed: number;
    Cancelled: number;
    Tentative: number;
  };
  topAttendees: Array<{
    meeting: string;
    attendees: number;
  }>;
  summary: string;
}

export function generateWeeklyReport(meetings: Meeting[], weekOffset: number = 0): WeeklyReport {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Filter meetings for this week
  const weekMeetings = meetings.filter((meeting) => {
    const meetingDate = parseISO(meeting.time);
    return isWithinInterval(meetingDate, { start: weekStart, end: weekEnd });
  });

  // Calculate totals
  const totalMeetings = weekMeetings.length;
  const totalHours = weekMeetings.reduce((sum, m) => sum + m.duration, 0) / 60;

  // Group by day
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const meetingsByDay = days.map((dayName, index) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + index);
    const dayMeetings = weekMeetings.filter((m) => {
      const meetingDate = parseISO(m.time);
      return format(meetingDate, "EEEE") === dayName;
    });

    return {
      day: dayName,
      date: format(dayDate, "MMM d, yyyy"),
      meetings: dayMeetings.length,
      hours: dayMeetings.reduce((sum, m) => sum + m.duration, 0) / 60,
      meetingList: dayMeetings.map((m) => ({
        title: m.title,
        time: format(parseISO(m.time), "h:mm a"),
        duration: m.duration,
        status: m.status,
      })),
    };
  });

  // Count by status
  const meetingsByStatus = {
    Confirmed: weekMeetings.filter((m) => m.status === "Confirmed").length,
    Completed: weekMeetings.filter((m) => m.status === "Completed").length,
    Cancelled: weekMeetings.filter((m) => m.status === "Cancelled").length,
    Tentative: weekMeetings.filter((m) => m.status === "Tentative").length,
  };

  // Top meetings by attendees
  const topAttendees = weekMeetings
    .sort((a, b) => b.attendees - a.attendees)
    .slice(0, 5)
    .map((m) => ({
      meeting: m.title,
      attendees: m.attendees,
    }));

  // Generate summary
  const avgHoursPerDay = totalHours / 7;
  const busiestDay = meetingsByDay.reduce((busiest, day) => (day.hours > busiest.hours ? day : busiest), meetingsByDay[0]);
  const summary = `This week you had ${totalMeetings} meetings totaling ${totalHours.toFixed(1)} hours. Your busiest day was ${busiestDay.day} with ${busiestDay.hours.toFixed(1)} hours of meetings. Average ${avgHoursPerDay.toFixed(1)} hours per day.`;

  return {
    weekStart: format(weekStart, "MMM d, yyyy"),
    weekEnd: format(weekEnd, "MMM d, yyyy"),
    totalMeetings,
    totalHours,
    meetingsByDay,
    meetingsByStatus,
    topAttendees,
    summary,
  };
}

export function exportReportToText(report: WeeklyReport): string {
  let text = `WEEKLY MEETING REPORT\n`;
  text += `================================\n\n`;
  text += `Week: ${report.weekStart} - ${report.weekEnd}\n\n`;
  text += `SUMMARY\n`;
  text += `-------\n`;
  text += `${report.summary}\n\n`;
  text += `STATISTICS\n`;
  text += `----------\n`;
  text += `Total Meetings: ${report.totalMeetings}\n`;
  text += `Total Hours: ${report.totalHours.toFixed(1)}h\n\n`;
  text += `By Status:\n`;
  text += `  Confirmed: ${report.meetingsByStatus.Confirmed}\n`;
  text += `  Completed: ${report.meetingsByStatus.Completed}\n`;
  text += `  Cancelled: ${report.meetingsByStatus.Cancelled}\n`;
  text += `  Tentative: ${report.meetingsByStatus.Tentative}\n\n`;
  text += `DAILY BREAKDOWN\n`;
  text += `---------------\n`;
  report.meetingsByDay.forEach((day) => {
    if (day.meetings > 0) {
      text += `\n${day.day} (${day.date})\n`;
      text += `  ${day.meetings} meeting(s), ${day.hours.toFixed(1)} hours\n`;
      day.meetingList.forEach((meeting) => {
        text += `  • ${meeting.title} - ${meeting.time} (${meeting.duration} min) [${meeting.status}]\n`;
      });
    }
  });
  text += `\nTOP MEETINGS BY ATTENDEES\n`;
  text += `--------------------------\n`;
  report.topAttendees.forEach((item, index) => {
    text += `${index + 1}. ${item.meeting} - ${item.attendees} attendees\n`;
  });
  text += `\nGenerated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}\n`;
  return text;
}

export function exportReportToJSON(report: WeeklyReport): string {
  return JSON.stringify(report, null, 2);
}

