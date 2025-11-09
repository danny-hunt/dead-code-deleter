"use client"

import { useState } from "react"
import { Search, Settings, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MessagesDialog from "@/components/messages-dialog"
import NotificationsPopover from "@/components/notifications-popover"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [messagesOpen, setMessagesOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to meetings page with search query
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set("page", "meetings")
      currentUrl.searchParams.set("search", searchQuery)
      window.location.href = currentUrl.toString()
    }
  }

  const handleSettingsClick = () => {
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set("page", "settings")
    window.location.href = currentUrl.toString()
  }

  return (
    <header className="border-b border-border bg-card h-16 px-8 flex items-center justify-between">
      <form onSubmit={handleSearch} className="flex items-center flex-1 gap-4 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search meetings, people, documents..." 
          className="bg-background border-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="flex items-center gap-6">
        {/* Quick Stats */}
        <div className="flex items-center gap-6 pr-6 border-r border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-sm font-semibold">5 meetings</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">This week</p>
            <p className="text-sm font-semibold">23 hrs</p>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setMessagesOpen(true)}
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <NotificationsPopover />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSettingsClick}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-2 pl-2 border-l border-border ml-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold leading-none">Alex Chen</p>
              <p className="text-xs text-muted-foreground">Premium</p>
            </div>
          </div>
        </div>
      </div>
      <MessagesDialog open={messagesOpen} onOpenChange={setMessagesOpen} />
    </header>
  )
}
