/**
 * Types for the Dead Code Platform
 * These match the instrumentation library format exactly
 */

// ============================================================================
// Instrumentation Library Types (Incoming Data Format)
// ============================================================================

/**
 * Function usage data tracked by the instrumentation
 */
export interface FunctionUsage {
  file: string;
  name: string;
  line: number;
  callCount: number;
}

/**
 * Data payload sent from instrumented apps to the platform
 */
export interface UsagePayload {
  projectId: string;
  timestamp: number;
  functions: FunctionUsage[];
}

// ============================================================================
// Platform Storage Types (Internal Data Format)
// ============================================================================

/**
 * Stored function with aggregated usage data
 */
export interface StoredFunction {
  file: string;
  name: string;
  line: number;
  totalCalls: number;
  lastSeen: number;
  firstSeen: number;
}

/**
 * Project usage data stored in blob
 * Key format: "file:name:line"
 */
export interface ProjectUsage {
  projectId: string;
  lastUpdated: number;
  functions: {
    [key: string]: StoredFunction;
  };
}

/**
 * Project summary for the index
 */
export interface ProjectSummary {
  projectId: string;
  name: string;
  lastUpdated: number;
  totalFunctions: number;
  deadCodeCount: number;
}

/**
 * Project index stored in blob
 */
export interface ProjectIndex {
  projects: ProjectSummary[];
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Response from /api/projects
 */
export interface ProjectsResponse {
  projects: ProjectSummary[];
}

/**
 * Response from /api/projects/[projectId]
 */
export interface ProjectDetailsResponse {
  projectId: string;
  lastUpdated: number;
  functions: StoredFunction[];
}

/**
 * Response from /api/usage (POST)
 */
export interface UsageUploadResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Response from /api/agent/trigger (POST)
 */
export interface AgentTriggerResponse {
  status: string;
  message: string;
  jobId?: string;
}

// ============================================================================
// UI Types
// ============================================================================

/**
 * Usage level classification
 */
export type UsageLevel = "dead" | "low" | "active";

/**
 * Sort column options for the usage stats table
 */
export type SortColumn = "file" | "name" | "line" | "totalCalls" | "lastSeen";

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

