"use client";

import { useState, useEffect } from "react";
import { ProjectSummary, StoredFunction } from "@/lib/types";
import { ProjectSelector } from "@/components/project-selector";
import { UsageStatsTable } from "@/components/usage-stats-table";
import { AgentTrigger } from "@/components/agent-trigger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Code2 } from "lucide-react";

export default function Home() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [functions, setFunctions] = useState<StoredFunction[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);

  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingFunctions, setIsLoadingFunctions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchProjects, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch functions when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchFunctions(selectedProjectId);
      // Poll for updates every 15 seconds
      const interval = setInterval(() => fetchFunctions(selectedProjectId), 15000);
      return () => clearInterval(interval);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data.projects);

      // Auto-select first project if none selected
      if (!selectedProjectId && data.projects.length > 0) {
        setSelectedProjectId(data.projects[0].projectId);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchFunctions = async (projectId: string) => {
    setIsLoadingFunctions(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}?sort=totalCalls&order=asc`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }
      const data = await response.json();
      setFunctions(data.functions);
      setError(null);
    } catch (err) {
      console.error("Error fetching functions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load project details"
      );
    } finally {
      setIsLoadingFunctions(false);
    }
  };

  const handleRefresh = () => {
    fetchProjects();
    if (selectedProjectId) {
      fetchFunctions(selectedProjectId);
    }
  };

  // Loading state
  if (isLoadingProjects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Empty state - no projects
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Code2 className="h-8 w-8" />
              Dead Code Platform
            </h1>
            <p className="text-muted-foreground">
              Monitor and remove dead code from your applications
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>No Projects Yet</CardTitle>
              <CardDescription>
                Get started by instrumenting your first application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  To start monitoring your codebase:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    Install the instrumentation library:
                    <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                      npm install @dead-code-deleter/instrument
                    </code>
                  </li>
                  <li>
                    Add instrumentation to your Next.js config:
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
{`const withInstrumentation = require('@dead-code-deleter/instrument/next');

module.exports = withInstrumentation({
  platformUrl: '${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/api/usage',
  projectId: 'my-app',
})(nextConfig);`}
                    </pre>
                  </li>
                  <li>Run your application and start using it</li>
                  <li>Return here to view usage statistics</li>
                </ol>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main interface
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Code2 className="h-8 w-8" />
            Dead Code Platform
          </h1>
          <p className="text-muted-foreground">
            Monitor and remove dead code from your applications
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-800 dark:text-red-200">
                Error
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Project Selector */}
        <div className="mb-6">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
        </div>

        {/* Loading state for functions */}
        {isLoadingFunctions && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading function data...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoadingFunctions && selectedProjectId && (
          <div className="space-y-6">
            {/* Usage Stats Table */}
            <Card>
              <CardHeader>
                <CardTitle>Function Usage Statistics</CardTitle>
                <CardDescription>
                  All functions tracked in this project. Functions with 0 calls are
                  candidates for removal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsageStatsTable
                  functions={functions}
                  onSelectFunctions={setSelectedFunctions}
                />
              </CardContent>
            </Card>

            {/* Agent Trigger */}
            <Card>
              <CardHeader>
                <CardTitle>Remove Dead Code</CardTitle>
                <CardDescription>
                  Trigger an automated process to remove selected functions from your
                  codebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentTrigger
                  projectId={selectedProjectId}
                  selectedFunctions={selectedFunctions}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

