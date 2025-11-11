"use client";

import { useState } from "react";
import { Users, Mail, UserPlus, Search, MoreVertical, Crown, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import TeamMemberCard from "@/components/team-member-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("Member");

  // Mock team data
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "Owner",
      status: "Active",
      joinedAt: "2024-01-15",
      meetingsThisWeek: 12,
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael@company.com",
      role: "Admin",
      status: "Active",
      joinedAt: "2024-02-01",
      meetingsThisWeek: 8,
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      email: "emily@company.com",
      role: "Member",
      status: "Active",
      joinedAt: "2024-03-10",
      meetingsThisWeek: 15,
    },
    {
      id: "4",
      name: "James Wilson",
      email: "james@company.com",
      role: "Member",
      status: "Active",
      joinedAt: "2024-04-05",
      meetingsThisWeek: 6,
    },
    {
      id: "5",
      name: "Lisa Anderson",
      email: "lisa@company.com",
      role: "Viewer",
      status: "Invited",
      joinedAt: "2024-11-10",
      meetingsThisWeek: 0,
    },
  ]);

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = () => {
    console.log(`Inviting ${inviteEmail} as ${inviteRole}`);
    setShowInviteDialog(false);
    setInviteEmail("");
    setInviteRole("Member");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return Crown;
      case "Admin":
        return Shield;
      default:
        return UserIcon;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground mt-2">Manage your team members and permissions</p>
        </div>
        <Button className="gap-2" onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === "Active").length}</p>
              <p className="text-xs text-muted-foreground">Active Members</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === "Invited").length}</p>
              <p className="text-xs text-muted-foreground">Pending Invites</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(teamMembers.reduce((acc, m) => acc + m.meetingsThisWeek, 0) / teamMembers.filter(m => m.status === "Active").length)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Meetings/Week</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teamMembers.filter(m => m.role === "Admin" || m.role === "Owner").length}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your team workspace</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail}>
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

