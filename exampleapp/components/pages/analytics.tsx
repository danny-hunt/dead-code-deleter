"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAnalytics } from "@/lib/hooks";

export default function Analytics() {
  const { analytics, loading, error } = useAnalytics();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">Understand your meeting patterns and optimize productivity</p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading analytics...</div>
      ) : error ? (
        <div className="text-center text-destructive py-12">{error}</div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Time Spent by Meeting Type</h3>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {analytics.timeByType.map((item, idx) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`bg-chart-${idx + 1} h-2 rounded-full`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Meeting Health</h3>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Meetings with agendas</p>
                  <p className="text-2xl font-bold">{Math.round(analytics.meetingHealth.withAgendas)}%</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    +{analytics.meetingHealth.withAgendasTrend}% this month
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Decision-making effectiveness</p>
                  <p className="text-2xl font-bold">{analytics.meetingHealth.decisionEffectiveness}%</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">High engagement</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Insights & Recommendations</h3>
            <div className="space-y-3">
              {analytics.insights.map((insight, idx) => {
                const colorClass =
                  insight.type === "info"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : insight.type === "warning"
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                    : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";

                const textColorClass =
                  insight.type === "info"
                    ? "text-blue-900 dark:text-blue-400"
                    : insight.type === "warning"
                    ? "text-amber-900 dark:text-amber-400"
                    : "text-green-900 dark:text-green-400";

                const descColorClass =
                  insight.type === "info"
                    ? "text-blue-800 dark:text-blue-300"
                    : insight.type === "warning"
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-green-800 dark:text-green-300";

                return (
                  <div key={idx} className={`p-3 rounded-lg border ${colorClass}`}>
                    <p className={`text-sm font-semibold ${textColorClass}`}>{insight.title}</p>
                    <p className={`text-sm ${descColorClass}`}>{insight.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
