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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UsageStatsTableProps {
  functions: StoredFunction[];
  onSelectFunctions: (selectedKeys: string[]) => void;
}

export function UsageStatsTable({
  functions,
  onSelectFunctions,
}: UsageStatsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("totalCalls");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Sort functions
  const sortedFunctions = [...functions].sort((a, b) => {
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
    const deadCodeKeys = functions
      .filter((f) => f.totalCalls === 0)
      .map((f) => `${f.file}:${f.name}:${f.line}`);
    setSelectedKeys(new Set(deadCodeKeys));
    onSelectFunctions(deadCodeKeys);
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const deadCodeCount = functions.filter((f) => f.totalCalls === 0).length;
  const lowUsageCount = functions.filter(
    (f) => f.totalCalls > 0 && f.totalCalls < 10
  ).length;
  const activeCount = functions.filter((f) => f.totalCalls >= 10).length;

  return (
    <div className="space-y-4">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔴</span>
            <div>
              <div className="text-sm text-muted-foreground">Dead Code</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {deadCodeCount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟡</span>
            <div>
              <div className="text-sm text-muted-foreground">Low Usage ({"<"}10)</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {lowUsageCount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟢</span>
            <div>
              <div className="text-sm text-muted-foreground">Active (≥10)</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activeCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Actions */}
      {deadCodeCount > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectDeadCode}
            className="text-sm px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
          >
            Select all dead code ({deadCodeCount})
          </button>
          {selectedKeys.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedKeys.size} function{selectedKeys.size !== 1 ? "s" : ""} selected
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold w-8">
                  {/* Checkbox column */}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold w-8">
                  {/* Icon column */}
                </th>
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
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {func.line}
                    </td>
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
                      {formatTimestamp(func.lastSeen)}
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

