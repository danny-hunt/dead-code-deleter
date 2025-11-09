// API Client utilities for making requests to backend

import { ApiResponse } from "./types";

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
  async getMeetings(params?: { q?: string; status?: string; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append("q", params.q);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);

    const query = searchParams.toString();
    return this.request(`/meetings${query ? `?${query}` : ""}`);
  }

  async getMeeting(id: string) {
    return this.request(`/meetings/${id}`);
  }

  async createMeeting(data: any) {
    return this.request(`/meetings`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMeeting(id: string, data: any) {
    return this.request(`/meetings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteMeeting(id: string) {
    return this.request(`/meetings/${id}`, {
      method: "DELETE",
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request(`/dashboard/stats`);
  }

  async getMeetingTrends() {
    return this.request(`/dashboard/trends`);
  }

  async getRecentMeetings() {
    return this.request(`/dashboard/recent`);
  }

  // Analytics
  async getAnalytics() {
    return this.request(`/analytics`);
  }

  // Calendar
  async getCalendarEvents(month?: number, year?: number) {
    const searchParams = new URLSearchParams();
    if (month !== undefined) searchParams.append("month", month.toString());
    if (year !== undefined) searchParams.append("year", year.toString());

    const query = searchParams.toString();
    return this.request(`/calendar${query ? `?${query}` : ""}`);
  }

  // Summaries
  async getSummaries() {
    return this.request(`/summaries`);
  }

  async getSummary(id: string) {
    return this.request(`/summaries/${id}`);
  }

  async getSummaryByMeetingId(meetingId: string) {
    return this.request(`/summaries/meeting/${meetingId}`);
  }

  async createSummary(data: any) {
    return this.request(`/summaries`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings() {
    return this.request(`/settings`);
  }

  async updateSettings(data: any) {
    return this.request(`/settings`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
