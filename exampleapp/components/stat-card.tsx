"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  change: string
  icon: LucideIcon
  trend: "up" | "down" | "neutral"
}

export default function StatCard({ label, value, change, icon: Icon, trend }: StatCardProps) {
  const trendColor = {
    up: "text-destructive",
    down: "text-green-600 dark:text-green-400",
    neutral: "text-muted-foreground",
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <p className="text-2xl font-bold mb-2">{value}</p>
          <p className={`text-xs font-semibold ${trendColor[trend]}`}>{change}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}
