"use client";

import { useState } from "react";
import { FileText, Search, Plus, Star, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import TemplateCard from "@/components/template-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface MeetingTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: "1-on-1" | "team" | "standup" | "planning" | "review" | "custom";
  agenda: string[];
  favorite: boolean;
  usageCount: number;
}

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const [templates, setTemplates] = useState<MeetingTemplate[]>([
    {
      id: "1",
      name: "Weekly Team Standup",
      description: "Quick 15-minute sync for team updates and blockers",
      duration: 15,
      type: "standup",
      agenda: ["Round-robin updates", "Blockers discussion", "Week priorities"],
      favorite: true,
      usageCount: 48,
    },
    {
      id: "2",
      name: "1-on-1 Check-in",
      description: "Regular one-on-one meeting with direct reports",
      duration: 30,
      type: "1-on-1",
      agenda: ["Recent wins", "Challenges", "Career development", "Feedback"],
      favorite: true,
      usageCount: 32,
    },
    {
      id: "3",
      name: "Sprint Planning",
      description: "Plan the upcoming sprint with the development team",
      duration: 60,
      type: "planning",
      agenda: [
        "Review sprint goals",
        "Story estimation",
        "Capacity planning",
        "Risk assessment",
        "Team commitments",
      ],
      favorite: false,
      usageCount: 12,
    },
    {
      id: "4",
      name: "Project Kickoff",
      description: "Launch new projects with stakeholders",
      duration: 45,
      type: "planning",
      agenda: [
        "Project overview",
        "Goals and objectives",
        "Timeline and milestones",
        "Roles and responsibilities",
        "Q&A",
      ],
      favorite: false,
      usageCount: 8,
    },
    {
      id: "5",
      name: "Retrospective",
      description: "Reflect on the sprint and identify improvements",
      duration: 45,
      type: "review",
      agenda: [
        "What went well",
        "What could be improved",
        "Action items",
        "Team shoutouts",
      ],
      favorite: true,
      usageCount: 24,
    },
    {
      id: "6",
      name: "Client Demo",
      description: "Showcase progress and gather feedback from clients",
      duration: 30,
      type: "custom",
      agenda: [
        "Demo recent features",
        "Gather feedback",
        "Discuss next steps",
        "Q&A session",
      ],
      favorite: false,
      usageCount: 16,
    },
  ]);

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleFavorite = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, favorite: !t.favorite } : t
    ));
  };

  const handleDuplicateTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Copy)`,
        usageCount: 0,
        favorite: false,
      };
      setTemplates([...templates, newTemplate]);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate: MeetingTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: templateDescription,
      duration: 30,
      type: "custom",
      agenda: ["Topic 1", "Topic 2", "Topic 3"],
      favorite: false,
      usageCount: 0,
    };
    setTemplates([...templates, newTemplate]);
    setShowCreateDialog(false);
    setTemplateName("");
    setTemplateDescription("");
  };

  const favoriteTemplates = templates.filter(t => t.favorite);
  const otherTemplates = templates.filter(t => !t.favorite);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting Templates</h1>
          <p className="text-muted-foreground mt-2">Create and manage reusable meeting templates</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{templates.length}</p>
              <p className="text-xs text-muted-foreground">Total Templates</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{favoriteTemplates.length}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Copy className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {templates.reduce((acc, t) => acc + t.usageCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Times Used</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(templates.reduce((acc, t) => acc + t.usageCount, 0) / templates.length)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Uses/Template</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Favorites Section */}
      {favoriteTemplates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Favorite Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteTemplates
              .filter((template) =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onToggleFavorite={handleToggleFavorite}
                  onDuplicate={handleDuplicateTemplate}
                  onDelete={handleDeleteTemplate}
                />
              ))}
          </div>
        </div>
      )}

      {/* All Templates Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherTemplates
            .filter((template) =>
              template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              template.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onToggleFavorite={handleToggleFavorite}
                onDuplicate={handleDuplicateTemplate}
                onDelete={handleDeleteTemplate}
              />
            ))}
        </div>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No templates found
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Meeting Template</DialogTitle>
            <DialogDescription>Create a reusable template for recurring meetings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="e.g., Weekly Team Sync"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of the meeting purpose"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={!templateName}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

