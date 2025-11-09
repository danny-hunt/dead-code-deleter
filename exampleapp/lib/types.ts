// Core data types for MeetingFlow application

export type MeetingStatus = "Confirmed" | "Completed" | "Cancelled" | "Tentative";

export interface Meeting {
  id: string;
  title: string;
  attendees: number;
  time: string; // ISO datetime string
  duration: number; // in minutes
  status: MeetingStatus;
  description?: string;
  location?: string;
  organizer?: string;
  hasNotes: boolean;
  hasAgenda: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSummary {
  id: string;
  meetingId: string;
  meeting: string;
  date: string;
  attendees: number;
  keyPoints: string[];
  fullSummary: string;
  generatedAt: string;
}

export interface DashboardStats {
  meetingsThisWeek: {
    value: number;
    change: number;
    changeLabel: string;
  };
  timeInMeetings: {
    value: number; // in hours
    change: number;
    changeLabel: string;
  };
  declinedMeetings: {
    value: number;
    change: number;
    changeLabel: string;
  };
  optimizations: {
    value: number;
    changeLabel: string;
  };
}

export interface MeetingTrend {
  week: string;
  meetings: number;
  hours: number;
}

export interface AnalyticsData {
  timeByType: Array<{
    label: string;
    percent: number;
    hours: number;
  }>;
  meetingHealth: {
    withAgendas: number;
    withAgendasTrend: number;
    decisionEffectiveness: number;
  };
  insights: Array<{
    type: "info" | "warning" | "success";
    title: string;
    description: string;
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  time: string;
  duration: string;
  meetingId?: string;
}

export interface UserSettings {
  account: {
    email: string;
    name: string;
  };
  notifications: {
    emailDigest: "Daily" | "Weekly" | "Never";
    meetingReminders: boolean;
    summaryNotifications: boolean;
  };
  team: {
    teamMembers: number;
    workspace: string;
    role: string;
  };
  preferences: {
    timeZone: string;
    theme: "Light" | "Dark" | "System";
    language: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
