"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Lock, Users, Zap } from "lucide-react";
import { useSettings } from "@/lib/hooks";

export default function Settings() {
  const { settings, loading, error } = useSettings();

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground py-12">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-destructive py-12">{error}</div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  const settingsSections = [
    {
      title: "Account",
      icon: Lock,
      settings: [
        { label: "Email", value: settings.account.email },
        { label: "Name", value: settings.account.name },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        { label: "Email Digest", value: settings.notifications.emailDigest },
        { label: "Meeting Reminders", value: settings.notifications.meetingReminders ? "Enabled" : "Disabled" },
      ],
    },
    {
      title: "Team",
      icon: Users,
      settings: [
        { label: "Team Members", value: settings.team.teamMembers.toString() },
        { label: "Workspace", value: settings.team.workspace },
      ],
    },
    {
      title: "Preferences",
      icon: Zap,
      settings: [
        { label: "Time Zone", value: settings.preferences.timeZone },
        { label: "Theme", value: settings.preferences.theme },
      ],
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
      </div>

      <div className="space-y-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              <div className="space-y-4">
                {section.settings.map((setting, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <label className="text-sm font-medium">{setting.label}</label>
                    <Button variant="outline" size="sm">
                      {setting.value}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 border-destructive/20 bg-destructive/5">
        <h3 className="font-semibold mb-2 text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">These actions cannot be undone.</p>
        <Button variant="destructive">Delete Account</Button>
      </Card>
    </div>
  );
}
