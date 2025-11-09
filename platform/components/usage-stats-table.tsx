"use client";

import { StoredFunction, SortColumn, SortDirection } from "@/lib/types";
import {
  formatFilePath,
  formatTimestamp,
  formatNumber,
  getUsageLevel,
  getUsageLevelColor,
  getUsageLevelIcon,
} from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, Users, Filter, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UsageStatsTableProps {
  functions: StoredFunction[];
  onSelectFunctions: (selectedKeys: string[]) => void;
  projectId: string;
}

export function UsageStatsTable({ functions, onSelectFunctions, projectId }: UsageStatsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("totalCalls");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [showOnlyMeaningful, setShowOnlyMeaningful] = useState<boolean>(false);
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());

  // Determine if a function is "meaningful" (not weird/generated)
  // Use a whitelist approach - only include clearly meaningful functions
  const isMeaningfulFunction = (func: StoredFunction): boolean => {
    const name = func.name;
    const nameLower = name.toLowerCase();

    // Exclude anonymous/default functions
    if (nameLower === "anonymous" || nameLower === "anon" || nameLower === "default") {
      return false;
    }

    // Exclude functions in generated/test directories
    if (func.file.includes("/.next/") || func.file.includes("/node_modules/")) {
      return false;
    }

    // Exclude HTTP method handlers (API routes) - these are too generic
    const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
    if (httpMethods.includes(name)) {
      return false;
    }

    // Include React components (PascalCase, at least 3 chars)
    if (/^[A-Z][a-zA-Z0-9]{2,}$/.test(name)) {
      return true;
    }

    // Include functions that start with "use" (React hooks) - these are meaningful
    if (/^use[A-Z][a-zA-Z0-9]+$/.test(name)) {
      return true;
    }

    // Include functions that start with common meaningful prefixes
    const meaningfulPrefixes = [
      /^handle[A-Z]/, // handleSubmit, handleSearch, etc.
      /^mark[A-Z]/, // markAsRead, markAllAsRead, etc.
      /^toggle[A-Z]/, // toggleTheme, etc.
      /^fetch[A-Z]/, // fetchData, etc.
      /^create[A-Z]/, // createMeeting, etc.
      /^update[A-Z]/, // updateMeeting, etc.
      /^delete[A-Z]/, // deleteMeeting, etc.
      /^get[A-Z]/, // getMeetings, etc. (but not just "get")
      /^set[A-Z]/, // setState, etc. (but not just "set")
      /^on[A-Z]/, // onClick, onChange, etc.
    ];

    for (const prefix of meaningfulPrefixes) {
      if (prefix.test(name)) {
        return true;
      }
    }

    // Include functions with descriptive camelCase names (at least 6 characters)
    // This filters out generic short names but allows meaningful ones
    if (/^[a-z][a-zA-Z0-9]{5,}$/.test(name)) {
      return true;
    }

    // Exclude everything else (too generic, too short, or weird)
    return false;
  };

  // Filter functions based on meaningful filter
  const filteredFunctions = showOnlyMeaningful ? functions.filter(isMeaningfulFunction) : functions;

  // Sort functions (use filtered functions)
  const sortedFunctions = [...filteredFunctions].sort((a, b) => {
    let comparison = 0;

    switch (sortColumn) {
      case "file":
        comparison = a.file.localeCompare(b.file);
        break;
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "line":
        comparison = a.line - b.line;
        break;
      case "totalCalls":
        comparison = a.totalCalls - b.totalCalls;
        break;
      case "lastSeen":
        comparison = a.lastSeen - b.lastSeen;
        break;
    }

    return sortDirection === "desc" ? -comparison : comparison;
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to asc (except for totalCalls which defaults to asc to show dead code first)
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleToggleSelection = (key: string) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedKeys(newSelected);
    onSelectFunctions(Array.from(newSelected));
  };

  const handleSelectDeadCode = () => {
    // Use filtered functions for selection
    const deadCodeKeys = filteredFunctions
      .filter((f) => f.totalCalls === 0)
      .map((f) => `${f.file}:${f.name}:${f.line}`);
    setSelectedKeys(new Set(deadCodeKeys));
    onSelectFunctions(deadCodeKeys);
  };

  const handleDeleteFunction = async (key: string) => {
    setDeletingKeys((prev) => new Set(prev).add(key));

    try {
      const response = await fetch("/api/agent/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          functions: [key],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to queue function for deletion");
      }

      // Show success feedback (could be improved with a toast notification)
      console.log(`Successfully queued ${key} for deletion`);
    } catch (error) {
      console.error("Error queueing function for deletion:", error);
      alert(error instanceof Error ? error.message : "Failed to queue function for deletion");
    } finally {
      setDeletingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  // Calculate stats based on filtered functions
  const deadCodeCount = filteredFunctions.filter((f) => f.totalCalls === 0).length;
  const lowUsageCount = filteredFunctions.filter((f) => f.totalCalls > 0 && f.totalCalls < 10).length;
  const activeCount = filteredFunctions.filter((f) => f.totalCalls >= 10).length;
  const totalFiltered = filteredFunctions.length;
  const totalUnfiltered = functions.length;

  return (
    <div className="space-y-4">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔴</span>
            <div>
              <div className="text-sm text-muted-foreground">Dead Code</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{deadCodeCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟡</span>
            <div>
              <div className="text-sm text-muted-foreground">Low Usage ({"<"}10)</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowUsageCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟢</span>
            <div>
              <div className="text-sm text-muted-foreground">Active (≥10)</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Selection Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {deadCodeCount > 0 && (
            <button
              onClick={handleSelectDeadCode}
              className="text-sm px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
            >
              Select all dead code ({deadCodeCount})
            </button>
          )}
          {selectedKeys.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedKeys.size} function{selectedKeys.size !== 1 ? "s" : ""} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyMeaningful(!showOnlyMeaningful)}
            className={cn(
              "text-sm px-3 py-1.5 rounded-md transition-colors flex items-center gap-2",
              showOnlyMeaningful
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            <Filter className="h-4 w-4" />
            {showOnlyMeaningful ? "Show All" : "Show Meaningful Only"}
          </button>
          {showOnlyMeaningful && (
            <span className="text-sm text-muted-foreground">
              Showing {totalFiltered} of {totalUnfiltered} functions
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold w-8">{/* Checkbox column */}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold w-8">{/* Icon column */}</th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort("file")}
                >
                  <div className="flex items-center">
                    File
                    <SortIcon column="file" />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Function
                    <SortIcon column="name" />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-colors w-24"
                  onClick={() => handleSort("line")}
                >
                  <div className="flex items-center">
                    Line
                    <SortIcon column="line" />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-colors w-32"
                  onClick={() => handleSort("totalCalls")}
                >
                  <div className="flex items-center">
                    Calls
                    <SortIcon column="totalCalls" />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-colors w-40"
                  onClick={() => handleSort("lastSeen")}
                >
                  <div className="flex items-center">
                    Last Seen
                    <SortIcon column="lastSeen" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold w-32">
                  <div className="flex items-center">Contributors</div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedFunctions.map((func) => {
                const key = `${func.file}:${func.name}:${func.line}`;
                const level = getUsageLevel(func.totalCalls);
                const isSelected = selectedKeys.has(key);

                return (
                  <tr
                    key={key}
                    className={cn(
                      "border-b border-border hover:bg-muted/30 transition-colors",
                      isSelected && "bg-accent"
                    )}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelection(key)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-lg">{getUsageLevelIcon(level)}</span>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono">
                      <div className="max-w-md truncate" title={func.file}>
                        {formatFilePath(func.file)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono">{func.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{func.line}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold",
                          getUsageLevelColor(level)
                        )}
                      >
                        {formatNumber(func.totalCalls)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {func.lastSeen > 0 ? (
                        formatTimestamp(func.lastSeen)
                      ) : (
                        <span className="text-muted-foreground/50">Never</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {func.contributors && func.contributors.length > 0 ? (
                        <div className="flex items-center gap-2 group relative">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground cursor-help">{func.contributors.length}</span>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 pointer-events-none">
                            <div className="bg-popover border border-border rounded-lg shadow-xl p-3 min-w-[200px] max-w-[300px]">
                              <div className="text-xs font-semibold mb-2 text-foreground">Contributors:</div>
                              <div className="space-y-1.5">
                                {func.contributors.map((contributor, idx) => (
                                  <div key={idx} className="text-xs text-muted-foreground">
                                    {contributor.name}
                                    {contributor.email && (
                                      <span className="text-muted-foreground/70 block">{contributor.email}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteFunction(key)}
                        disabled={deletingKeys.has(key)}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          "hover:bg-red-100 dark:hover:bg-red-950/30",
                          "text-red-600 dark:text-red-400",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        title="Queue for deletion"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
