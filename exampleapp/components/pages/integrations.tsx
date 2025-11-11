"use client";

import { useState } from "react";
import { Plug, Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import IntegrationCard from "@/components/integration-card";

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: "calendar" | "communication" | "productivity" | "analytics";
  connected: boolean;
  features: string[];
}

export default function Integrations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Google Calendar",
      description: "Sync your meetings with Google Calendar automatically",
      logo: "📅",
      category: "calendar",
      connected: true,
      features: ["Two-way sync", "Auto-create events", "Real-time updates"],
    },
    {
      id: "2",
      name: "Slack",
      description: "Get meeting notifications and summaries in Slack",
      logo: "💬",
      category: "communication",
      connected: true,
      features: ["Meeting reminders", "AI summaries", "Quick actions"],
    },
    {
      id: "3",
      name: "Microsoft Teams",
      description: "Integrate with Teams for seamless collaboration",
      logo: "👥",
      category: "communication",
      connected: false,
      features: ["Video calls", "Chat integration", "File sharing"],
    },
    {
      id: "4",
      name: "Zoom",
      description: "Auto-generate Zoom links for virtual meetings",
      logo: "🎥",
      category: "communication",
      connected: true,
      features: ["Auto-generate links", "Recording sync", "Attendance tracking"],
    },
    {
      id: "5",
      name: "Notion",
      description: "Export meeting notes and summaries to Notion",
      logo: "📝",
      category: "productivity",
      connected: false,
      features: ["Note export", "Template sync", "Database integration"],
    },
    {
      id: "6",
      name: "Jira",
      description: "Create and track action items from meetings in Jira",
      logo: "🎯",
      category: "productivity",
      connected: false,
      features: ["Task creation", "Status tracking", "Sprint planning"],
    },
    {
      id: "7",
      name: "Asana",
      description: "Turn meeting action items into Asana tasks",
      logo: "✅",
      category: "productivity",
      connected: false,
      features: ["Task automation", "Project linking", "Timeline sync"],
    },
    {
      id: "8",
      name: "Salesforce",
      description: "Connect meeting data with your CRM",
      logo: "☁️",
      category: "analytics",
      connected: false,
      features: ["Contact sync", "Deal tracking", "Activity logging"],
    },
  ]);

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || 
      (filter === "connected" && integration.connected) ||
      (filter === "available" && !integration.connected) ||
      integration.category === filter;
    return matchesSearch && matchesFilter;
  });

  const handleToggleConnection = (id: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === id
        ? { ...integration, connected: !integration.connected }
        : integration
    ));
  };

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-2">Connect MeetingFlow with your favorite tools</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{connectedCount}</p>
              <p className="text-xs text-muted-foreground">Connected</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Plug className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{integrations.length - connectedCount}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Plug className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{integrations.length}</p>
              <p className="text-xs text-muted-foreground">Total Integrations</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "connected" ? "default" : "outline"}
            onClick={() => setFilter("connected")}
          >
            Connected
          </Button>
          <Button
            variant={filter === "available" ? "default" : "outline"}
            onClick={() => setFilter("available")}
          >
            Available
          </Button>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onToggle={handleToggleConnection}
          />
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No integrations found
        </div>
      )}
    </div>
  );
}

