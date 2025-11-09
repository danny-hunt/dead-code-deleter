"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

interface AgentTriggerProps {
  projectId: string;
  selectedFunctions: string[];
  disabled?: boolean;
}

export function AgentTrigger({
  projectId,
  selectedFunctions,
  disabled,
}: AgentTriggerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleTrigger = async () => {
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch("/api/agent/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          functions: selectedFunctions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Agent triggered successfully");
        setIsError(false);
      } else {
        setMessage(data.message || "Failed to trigger agent");
        setIsError(true);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to trigger agent"
      );
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleTrigger}
        disabled={disabled || selectedFunctions.length === 0 || isLoading}
        variant="destructive"
        className="w-full md:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Selected Dead Code ({selectedFunctions.length})
          </>
        )}
      </Button>

      {message && (
        <div
          className={`p-4 rounded-lg border ${
            isError
              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200"
              : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200"
          }`}
        >
          <p className="text-sm">{message}</p>
        </div>
      )}

      {selectedFunctions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Select functions from the table above to remove them.
        </p>
      )}
    </div>
  );
}

