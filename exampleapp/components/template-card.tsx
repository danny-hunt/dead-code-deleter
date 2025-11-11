"use client";

import { Star, Clock, Copy, Trash2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface TemplateCardProps {
  template: MeetingTemplate;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TemplateCard({
  template,
  onToggleFavorite,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const getTypeColor = () => {
    switch (template.type) {
      case "1-on-1":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "standup":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "planning":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
      case "review":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleFavorite(template.id)}
          >
            <Star
              className={`w-4 h-4 ${
                template.favorite ? "fill-yellow-500 text-yellow-500" : "text-gray-400"
              }`}
            />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor()}`}>
            {template.type}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{template.duration} min</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>{template.usageCount} uses</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Agenda:</p>
          <ul className="space-y-1">
            {template.agenda.slice(0, 3).map((item, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                {item}
              </li>
            ))}
            {template.agenda.length > 3 && (
              <li className="text-xs text-muted-foreground italic">
                +{template.agenda.length - 3} more items...
              </li>
            )}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onDuplicate(template.id)}
          >
            <Copy className="w-3 h-3" />
            Duplicate
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(template.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

