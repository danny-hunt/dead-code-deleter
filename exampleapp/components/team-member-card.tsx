"use client";

import { Crown, Shield, User, MoreVertical, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  avatar?: string;
  status: "Active" | "Invited" | "Inactive";
  joinedAt: string;
  meetingsThisWeek: number;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  const getRoleIcon = () => {
    switch (member.role) {
      case "Owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "Admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (member.status) {
      case "Active":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "Invited":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Inactive":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold">
            {member.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{member.name}</h3>
              {getRoleIcon()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Mail className="w-3 h-3" />
              <span>{member.email}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Meetings</p>
            <p className="font-semibold">{member.meetingsThisWeek}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
              {member.status}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

