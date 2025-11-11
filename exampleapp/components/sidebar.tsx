"use client"

import { BarChart3, Calendar, Clock, FileText, Home, LogOut, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      category: "main",
    },
    {
      id: "meetings",
      label: "Meetings",
      icon: Users,
      category: "main",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      category: "main",
    },
    {
      id: "team",
      label: "Team",
      icon: Users,
      category: "main",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      category: "insights",
    },
    {
      id: "summaries",
      label: "AI Summaries",
      icon: FileText,
      category: "insights",
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      category: "insights",
    },
    {
      id: "templates",
      label: "Templates",
      icon: FileText,
      category: "tools",
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: LogOut,
      category: "tools",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      category: "admin",
    },
  ]

  const mainItems = menuItems.filter((i) => i.category === "main")
  const insightItems = menuItems.filter((i) => i.category === "insights")
  const toolItems = menuItems.filter((i) => i.category === "tools")
  const adminItems = menuItems.filter((i) => i.category === "admin")

  const MenuItem = ({ item }: any) => {
    const Icon = item.icon
    const isActive = currentPage === item.id

    return (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start gap-3 ${isActive ? "bg-primary text-primary-foreground" : ""}`}
        onClick={() => onPageChange(item.id)}
      >
        <Icon className="w-4 h-4" />
        <span>{item.label}</span>
      </Button>
    )
  }

  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">MeetingFlow</h1>
            <p className="text-xs text-sidebar-foreground/60">Reclaim your time</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Main */}
        <div>
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase mb-3 px-2">Main</h3>
          <div className="space-y-2">
            {mainItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase mb-3 px-2">Insights</h3>
          <div className="space-y-2">
            {insightItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase mb-3 px-2">Tools</h3>
          <div className="space-y-2">
            {toolItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Admin */}
        <div>
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase mb-3 px-2">Admin</h3>
          <div className="space-y-2">
            {adminItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sidebar-foreground border-sidebar-border bg-transparent"
        >
          <Users className="w-4 h-4" />
          <span className="text-xs">Invite Team</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70">
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Logout</span>
        </Button>
      </div>
    </aside>
  )
}
