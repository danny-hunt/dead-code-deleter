// Custom React hooks for data fetching

import { useState, useEffect, useCallback } from "react";
import { api } from "./api-client";
import {
  Meeting,
  MeetingSummary,
  DashboardStats,
  MeetingTrend,
  AnalyticsData,
  CalendarEvent,
  UserSettings,
} from "./types";

export function useMeetings(params?: { q?: string; status?: string; startDate?: string; endDate?: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await api.getMeetings(params);
    if (response.success && response.data) {
      setMeetings(response.data);
    } else {
      setError(response.error || "Failed to fetch meetings");
    }
    setLoading(false);
  }, [params?.q, params?.status, params?.startDate, params?.endDate]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const createMeeting = async (data: any) => {
    const response = await api.createMeeting(data);
    if (response.success) {
      await fetchMeetings();
    }
    return response;
  };

  const updateMeeting = async (id: string, data: any) => {
    const response = await api.updateMeeting(id, data);
    if (response.success) {
      await fetchMeetings();
    }
    return response;
  };

  const deleteMeeting = async (id: string) => {
    const response = await api.deleteMeeting(id);
    if (response.success) {
      await fetchMeetings();
    }
    return response;
  };

  return {
    meetings,
    loading,
    error,
    refresh: fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      const response = await api.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || "Failed to fetch stats");
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useMeetingTrends() {
  const [trends, setTrends] = useState<MeetingTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);
      const response = await api.getMeetingTrends();
      if (response.success && response.data) {
        setTrends(response.data);
      } else {
        setError(response.error || "Failed to fetch trends");
      }
      setLoading(false);
    };

    fetchTrends();
  }, []);

  return { trends, loading, error };
}

export function useRecentMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      setError(null);
      const response = await api.getRecentMeetings();
      if (response.success && response.data) {
        setMeetings(response.data);
      } else {
        setError(response.error || "Failed to fetch recent meetings");
      }
      setLoading(false);
    };

    fetchRecent();
  }, []);

  return { meetings, loading, error };
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      const response = await api.getAnalytics();
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || "Failed to fetch analytics");
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  return { analytics, loading, error };
}

export function useCalendarEvents(month?: number, year?: number) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      const response = await api.getCalendarEvents(month, year);
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setError(response.error || "Failed to fetch events");
      }
      setLoading(false);
    };

    fetchEvents();
  }, [month, year]);

  return { events, loading, error };
}

export function useSummaries() {
  const [summaries, setSummaries] = useState<MeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await api.getSummaries();
    if (response.success && response.data) {
      setSummaries(response.data);
    } else {
      setError(response.error || "Failed to fetch summaries");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const createSummary = async (data: any) => {
    const response = await api.createSummary(data);
    if (response.success) {
      await fetchSummaries();
    }
    return response;
  };

  return { summaries, loading, error, refresh: fetchSummaries, createSummary };
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await api.getSettings();
    if (response.success && response.data) {
      setSettings(response.data);
    } else {
      setError(response.error || "Failed to fetch settings");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (data: any) => {
    const response = await api.updateSettings(data);
    if (response.success) {
      await fetchSettings();
    }
    return response;
  };

  return { settings, loading, error, refresh: fetchSettings, updateSettings };
}
