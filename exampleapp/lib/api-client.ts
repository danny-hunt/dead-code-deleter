// API Client utilities for making requests to backend

import { ApiResponse, Meeting, DashboardStats, MeetingTrend, AnalyticsData, CalendarEvent, MeetingSummary, UserSettings } from "./types";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Meetings
  async getMeetings(params?: { q?: string; status?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Meeting[]>> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append("q", params.q);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);

    const query = searchParams.toString();
    return this.request<Meeting[]>(`/meetings${query ? `?${query}` : ""}`);
  }

  async getMeeting(id: string): Promise<ApiResponse<Meeting>> {
    return this.request<Meeting>(`/meetings/${id}`);
  }

  async createMeeting(data: any): Promise<ApiResponse<Meeting>> {
    return this.request<Meeting>(`/meetings`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMeeting(id: string, data: any): Promise<ApiResponse<Meeting>> {
    return this.request<Meeting>(`/meetings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteMeeting(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/meetings/${id}`, {
      method: "DELETE",
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>(`/dashboard/stats`);
  }

  async getMeetingTrends(): Promise<ApiResponse<MeetingTrend[]>> {
    return this.request<MeetingTrend[]>(`/dashboard/trends`);
  }

  async getRecentMeetings(): Promise<ApiResponse<Meeting[]>> {
    return this.request<Meeting[]>(`/dashboard/recent`);
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    return this.request<AnalyticsData>(`/analytics`);
  }

  // Calendar
  async getCalendarEvents(month?: number, year?: number): Promise<ApiResponse<CalendarEvent[]>> {
    const searchParams = new URLSearchParams();
    if (month !== undefined) searchParams.append("month", month.toString());
    if (year !== undefined) searchParams.append("year", year.toString());

    const query = searchParams.toString();
    return this.request<CalendarEvent[]>(`/calendar${query ? `?${query}` : ""}`);
  }

  // Summaries
  async getSummaries(): Promise<ApiResponse<MeetingSummary[]>> {
    return this.request<MeetingSummary[]>(`/summaries`);
  }

  async getSummary(id: string): Promise<ApiResponse<MeetingSummary>> {
    return this.request<MeetingSummary>(`/summaries/${id}`);
  }

  async getSummaryByMeetingId(meetingId: string): Promise<ApiResponse<MeetingSummary>> {
    return this.request<MeetingSummary>(`/summaries/meeting/${meetingId}`);
  }

  async createSummary(data: any): Promise<ApiResponse<MeetingSummary>> {
    return this.request<MeetingSummary>(`/summaries`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings(): Promise<ApiResponse<UserSettings>> {
    return this.request<UserSettings>(`/settings`);
  }

  async updateSettings(data: any): Promise<ApiResponse<UserSettings>> {
    return this.request<UserSettings>(`/settings`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
