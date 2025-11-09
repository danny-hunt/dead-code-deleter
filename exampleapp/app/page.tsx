"use client"

import { useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Dashboard from "@/components/pages/dashboard"
import Meetings from "@/components/pages/meetings"
import Analytics from "@/components/pages/analytics"
import Calendar from "@/components/pages/calendar"
import Summaries from "@/components/pages/summaries"
import Settings from "@/components/pages/settings"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard")

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
