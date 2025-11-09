"use client";

import { ProjectSummary } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProjectSelectorProps {
  projects: ProjectSummary[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onSelectProject,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProject = projects.find((p) => p.projectId === selectedProjectId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left bg-card border border-border rounded-lg hover:bg-accent transition-colors"
      >
        <div className="flex-1">
          {selectedProject ? (
            <div>
              <div className="font-semibold text-foreground">
                {selectedProject.name}
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated {formatTimestamp(selectedProject.lastUpdated)}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">Select a project</div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 transition-transform text-muted-foreground",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && projects.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-auto">
          {projects.map((project) => (
            <button
              key={project.projectId}
              onClick={() => {
                onSelectProject(project.projectId);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0",
                selectedProjectId === project.projectId && "bg-accent"
              )}
            >
              <div className="font-semibold text-foreground">{project.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {project.totalFunctions} functions • {project.deadCodeCount} dead
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Updated {formatTimestamp(project.lastUpdated)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

