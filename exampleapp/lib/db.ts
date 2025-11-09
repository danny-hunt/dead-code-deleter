// Mock database layer - replace with actual database in production
// This provides a simple in-memory store that can be easily swapped for Prisma, Drizzle, etc.

import {
  Meeting,
  MeetingSummary,
  DashboardStats,
  MeetingTrend,
  AnalyticsData,
  CalendarEvent,
  UserSettings,
} from "./types";

// In-memory data store (in production, this would be replaced with a real database)
let meetings: Meeting[] = [
  {
    id: "1",
    title: "Product Roadmap Planning",
    attendees: 12,
    time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    duration: 90,
    status: "Confirmed",
    description: "Q1 2025 planning session",
    hasNotes: false,
    hasAgenda: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Weekly Standup",
    attendees: 8,
    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    duration: 30,
    status: "Completed",
    hasNotes: true,
    hasAgenda: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Design Critique",
    attendees: 5,
    time: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(), // tomorrow
    duration: 60,
    status: "Confirmed",
    hasNotes: false,
    hasAgenda: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Engineering All-Hands",
    attendees: 25,
    time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    status: "Confirmed",
    hasNotes: false,
    hasAgenda: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "1:1 with Manager",
    attendees: 2,
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    status: "Completed",
    hasNotes: true,
    hasAgenda: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let summaries: MeetingSummary[] = [
  {
    id: "1",
    meetingId: "2",
    meeting: "Product Roadmap Review",
    date: "Nov 8, 2024",
    attendees: 12,
    keyPoints: ["Q1 2025 features prioritized", "New design system approved", "Timeline agreed"],
    fullSummary:
      "The team aligned on Q1 priorities, reviewed mockups for the new design system, and confirmed delivery dates. Two critical bugs need addressing before Friday's release.",
    generatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    meetingId: "5",
    meeting: "Engineering Standup",
    date: "Nov 8, 2024",
    attendees: 8,
    keyPoints: ["Sprint progress on track", "Two blockers identified", "Demo scheduled for Friday"],
    fullSummary:
      "Team provided updates on current sprint work. Two blockers were identified: API rate limiting and database migration issues. Demo prepared for Friday stakeholder review.",
    generatedAt: new Date().toISOString(),
  },
];

let userSettings: UserSettings = {
  account: {
    email: "alex.chen@company.com",
    name: "Alex Chen",
  },
  notifications: {
    emailDigest: "Daily",
    meetingReminders: true,
    summaryNotifications: true,
  },
  team: {
    teamMembers: 12,
    workspace: "Acme Inc",
    role: "Product Manager",
  },
  preferences: {
    timeZone: "America/Los_Angeles",
    theme: "System",
    language: "en-US",
  },
};

// Database operations
export const db = {
  // Meetings
  meetings: {
    getAll: async (): Promise<Meeting[]> => {
      return [...meetings];
    },
    getById: async (id: string): Promise<Meeting | null> => {
      return meetings.find((m) => m.id === id) || null;
    },
    create: async (meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">): Promise<Meeting> => {
      const newMeeting: Meeting = {
        ...meeting,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      meetings.push(newMeeting);
      return newMeeting;
    },
    update: async (id: string, updates: Partial<Meeting>): Promise<Meeting | null> => {
      const index = meetings.findIndex((m) => m.id === id);
      if (index === -1) return null;
      meetings[index] = {
        ...meetings[index],
        ...updates,
        id: meetings[index].id,
        updatedAt: new Date().toISOString(),
      };
      return meetings[index];
    },
    delete: async (id: string): Promise<boolean> => {
      const index = meetings.findIndex((m) => m.id === id);
      if (index === -1) return false;
      meetings.splice(index, 1);
      return true;
    },
    search: async (query: string): Promise<Meeting[]> => {
      const lowerQuery = query.toLowerCase();
      return meetings.filter(
        (m) => m.title.toLowerCase().includes(lowerQuery) || m.description?.toLowerCase().includes(lowerQuery)
      );
    },
    filter: async (status?: string, startDate?: string, endDate?: string): Promise<Meeting[]> => {
      return meetings.filter((m) => {
        if (status && m.status !== status) return false;
        if (startDate && new Date(m.time) < new Date(startDate)) return false;
        if (endDate && new Date(m.time) > new Date(endDate)) return false;
        return true;
      });
    },
  },

  // Summaries
  summaries: {
    getAll: async (): Promise<MeetingSummary[]> => {
      return [...summaries];
    },
    getById: async (id: string): Promise<MeetingSummary | null> => {
      return summaries.find((s) => s.id === id) || null;
    },
    getByMeetingId: async (meetingId: string): Promise<MeetingSummary | null> => {
      return summaries.find((s) => s.meetingId === meetingId) || null;
    },
    create: async (summary: Omit<MeetingSummary, "id" | "generatedAt">): Promise<MeetingSummary> => {
      const newSummary: MeetingSummary = {
        ...summary,
        id: Date.now().toString(),
        generatedAt: new Date().toISOString(),
      };
      summaries.push(newSummary);
      return newSummary;
    },
  },

  // Settings
  settings: {
    get: async (): Promise<UserSettings> => {
      return { ...userSettings };
    },
    update: async (updates: Partial<UserSettings>): Promise<UserSettings> => {
      userSettings = {
        account: { ...userSettings.account, ...updates.account },
        notifications: { ...userSettings.notifications, ...updates.notifications },
        team: { ...userSettings.team, ...updates.team },
        preferences: { ...userSettings.preferences, ...updates.preferences },
      };
      return { ...userSettings };
    },
  },
};

// Analytics calculations
export const analytics = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekMeetings = meetings.filter((m) => new Date(m.time) >= weekAgo && new Date(m.time) <= now);
    const lastWeekMeetings = meetings.filter((m) => new Date(m.time) >= twoWeeksAgo && new Date(m.time) < weekAgo);

    const thisWeekHours = thisWeekMeetings.reduce((sum, m) => sum + m.duration / 60, 0);
    const lastWeekHours = lastWeekMeetings.reduce((sum, m) => sum + m.duration / 60, 0);

    const declinedThisWeek = 8; // Mock data
    const declinedLastWeek = 6;

    return {
      meetingsThisWeek: {
        value: thisWeekMeetings.length,
        change: lastWeekMeetings.length
          ? ((thisWeekMeetings.length - lastWeekMeetings.length) / lastWeekMeetings.length) * 100
          : 0,
        changeLabel: `-${Math.abs(
          Math.round(((thisWeekMeetings.length - lastWeekMeetings.length) / lastWeekMeetings.length) * 100)
        )}% from last week`,
      },
      timeInMeetings: {
        value: thisWeekHours,
        change: lastWeekHours ? ((thisWeekHours - lastWeekHours) / lastWeekHours) * 100 : 0,
        changeLabel: `-${Math.abs(thisWeekHours - lastWeekHours).toFixed(1)}h from last week`,
      },
      declinedMeetings: {
        value: declinedThisWeek,
        change: declinedLastWeek ? ((declinedThisWeek - declinedLastWeek) / declinedLastWeek) * 100 : 0,
        changeLabel: `+${declinedThisWeek - declinedLastWeek} from last week`,
      },
      optimizations: {
        value: 12,
        changeLabel: "Actions suggested",
      },
    };
  },

  getMeetingTrends: async (): Promise<MeetingTrend[]> => {
    // Mock trend data - in production, calculate from actual meeting data
    return [
      { week: "Week 1", meetings: 28, hours: 22 },
      { week: "Week 2", meetings: 25, hours: 20 },
      { week: "Week 3", meetings: 23, hours: 18.5 },
      { week: "Week 4", meetings: 20, hours: 16 },
    ];
  },

  getAnalyticsData: async (): Promise<AnalyticsData> => {
    const totalMeetings = meetings.length;
    const withAgendas = meetings.filter((m) => m.hasAgenda).length;

    return {
      timeByType: [
        { label: "1:1s", percent: 35, hours: 6.5 },
        { label: "Team Standup", percent: 20, hours: 3.7 },
        { label: "Presentations", percent: 25, hours: 4.6 },
        { label: "Brainstorms", percent: 20, hours: 3.7 },
      ],
      meetingHealth: {
        withAgendas: totalMeetings ? (withAgendas / totalMeetings) * 100 : 0,
        withAgendasTrend: 12,
        decisionEffectiveness: 82,
      },
      insights: [
        {
          type: "info",
          title: "Avoid Mondays",
          description: "You have 7 meetings on Mondays. Consider consolidating to Tuesdays.",
        },
        {
          type: "warning",
          title: "Long meetings detected",
          description: "15% of your meetings run over. Set explicit time limits.",
        },
      ],
    };
  },

  getCalendarEvents: async (month: number, year: number): Promise<CalendarEvent[]> => {
    const events: CalendarEvent[] = meetings
      .filter((m) => {
        const date = new Date(m.time);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .map((m) => {
        const date = new Date(m.time);
        return {
          id: `event-${m.id}`,
          title: m.title,
          date: date.toISOString().split("T")[0],
          time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          duration: `${Math.floor(m.duration / 60)}h ${m.duration % 60}m`,
          meetingId: m.id,
        };
      });

    return events;
  },
};
