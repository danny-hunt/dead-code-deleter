"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Dashboard from "@/components/pages/dashboard"
import Meetings from "@/components/pages/meetings"
import Analytics from "@/components/pages/analytics"
import Calendar from "@/components/pages/calendar"
import Summaries from "@/components/pages/summaries"
import Settings from "@/components/pages/settings"
import Team from "@/components/pages/team"
import Reports from "@/components/pages/reports"
import Integrations from "@/components/pages/integrations"
import Templates from "@/components/pages/templates"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard")

  useEffect(() => {
    // Handle URL parameters for navigation
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const page = params.get("page")
      if (page && ["dashboard", "meetings", "analytics", "calendar", "summaries", "settings", "team", "reports", "integrations", "templates"].includes(page)) {
        setCurrentPage(page)
      }
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "meetings":
        return <Meetings />
      case "analytics":
        return <Analytics />
      case "calendar":
        return <Calendar />
      case "summaries":
        return <Summaries />
      case "settings":
        return <Settings />
      case "team":
        return <Team />
      case "reports":
        return <Reports />
      case "integrations":
        return <Integrations />
      case "templates":
        return <Templates />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  )
}
