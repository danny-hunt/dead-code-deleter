import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { UsageLevel } from "./types";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format file path for display
 * Removes absolute path and shows relative path from project root
 */
export function formatFilePath(fullPath: string): string {
  // Try to extract relative path from common project structures
  const patterns = [
    /.*\/(app|components|lib|src|pages|utils)\//,
    /.*\/([^\/]+\/){0,2}([^\/]+\.[^\/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = fullPath.match(pattern);
    if (match) {
      const index = fullPath.indexOf(match[1] || match[0]);
      if (index !== -1) {
        return fullPath.substring(index);
      }
    }
  }

  // If no pattern matches, just return the filename
  const parts = fullPath.split("/");
  if (parts.length >= 2) {
    return parts.slice(-2).join("/");
  }

  return fullPath;
}

/**
 * Format timestamp as relative time
 */
export function formatTimestamp(timestamp: number): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

/**
 * Format timestamp as absolute date/time
 */
export function formatAbsoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Classify usage level based on call count
 */
export function getUsageLevel(calls: number): UsageLevel {
  if (calls === 0) return "dead";
  if (calls < 10) return "low";
  return "active";
}

/**
 * Get color class for usage level
 */
export function getUsageLevelColor(level: UsageLevel): string {
  switch (level) {
    case "dead":
      return "text-red-600 bg-red-50";
    case "low":
      return "text-yellow-600 bg-yellow-50";
    case "active":
      return "text-green-600 bg-green-50";
  }
}

/**
 * Get icon for usage level
 */
export function getUsageLevelIcon(level: UsageLevel): string {
  switch (level) {
    case "dead":
      return "🔴";
    case "low":
      return "🟡";
    case "active":
      return "🟢";
  }
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Generate a unique key for a function
 */
export function getFunctionKey(file: string, name: string, line: number): string {
  return `${file}:${name}:${line}`;
}

/**
 * Parse a function key back into components
 */
export function parseFunctionKey(key: string): {
  file: string;
  name: string;
  line: number;
} | null {
  const lastColonIndex = key.lastIndexOf(":");
  if (lastColonIndex === -1) return null;

  const line = parseInt(key.substring(lastColonIndex + 1), 10);
  if (isNaN(line)) return null;

  const remainingKey = key.substring(0, lastColonIndex);
  const secondLastColonIndex = remainingKey.lastIndexOf(":");
  if (secondLastColonIndex === -1) return null;

  const file = remainingKey.substring(0, secondLastColonIndex);
  const name = remainingKey.substring(secondLastColonIndex + 1);

  return { file, name, line };
}

