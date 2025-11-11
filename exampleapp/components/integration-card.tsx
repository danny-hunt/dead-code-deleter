"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: "calendar" | "communication" | "productivity" | "analytics";
  connected: boolean;
  features: string[];
}

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (id: string) => void;
}

export default function IntegrationCard({ integration, onToggle }: IntegrationCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-2xl">
              {integration.logo}
            </div>
            <div>
              <h3 className="font-semibold">{integration.name}</h3>
              <span className="text-xs text-muted-foreground capitalize">{integration.category}</span>
            </div>
          </div>
          {integration.connected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <p className="text-sm text-muted-foreground">{integration.description}</p>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Features:</p>
          <ul className="space-y-1">
            {integration.features.map((feature, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button
          className="w-full"
          variant={integration.connected ? "outline" : "default"}
          onClick={() => onToggle(integration.id)}
        >
          {integration.connected ? "Disconnect" : "Connect"}
        </Button>
      </div>
    </Card>
  );
}

