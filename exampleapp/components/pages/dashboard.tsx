"use client";

import { TrendingDown, Users, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/stat-card";
import RecentMeetings from "@/components/recent-meetings";
import MeetingTrends from "@/components/meeting-trends";
import { useDashboardStats } from "@/lib/hooks";

export default function Dashboard() {
  const { stats, loading, error } = useDashboardStats();

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Reclaim 7 hours this week by optimizing your meetings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 text-center text-muted-foreground">Loading stats...</div>
        ) : error ? (
          <div className="col-span-4 text-center text-destructive">{error}</div>
        ) : stats ? (
          <>
            <StatCard
              label="Meetings This Week"
              value={stats.meetingsThisWeek.value.toString()}
              change={stats.meetingsThisWeek.changeLabel}
              icon={Users}
              trend={stats.meetingsThisWeek.change < 0 ? "down" : "up"}
            />
            <StatCard
              label="Time in Meetings"
              value={`${stats.timeInMeetings.value.toFixed(1)}h`}
              change={stats.timeInMeetings.changeLabel}
              icon={Clock}
              trend={stats.timeInMeetings.change < 0 ? "down" : "up"}
            />
            <StatCard
              label="Declined Meetings"
              value={stats.declinedMeetings.value.toString()}
              change={stats.declinedMeetings.changeLabel}
              icon={TrendingDown}
              trend="up"
            />
            <StatCard
              label="Optimizations"
              value={stats.optimizations.value.toString()}
              change={stats.optimizations.changeLabel}
              icon={AlertCircle}
              trend="neutral"
            />
          </>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MeetingTrends />
        </div>
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                Schedule Meeting-Free Day
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                Review Time Blocks
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                Export Weekly Report
              </Button>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Tip of the Day</h3>
            <p className="text-sm text-muted-foreground">
              Try scheduling focus blocks on Tuesday mornings. Teams that do see a 20% productivity increase.
            </p>
          </Card>
        </div>
      </div>

      {/* Recent Meetings */}
      <RecentMeetings />
    </div>
  );
}
