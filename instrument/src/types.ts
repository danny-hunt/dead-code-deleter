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
 * Data payload sent to the platform
 */
export interface UsagePayload {
  projectId: string;
  timestamp: number;
  functions: FunctionUsage[];
}

/**
 * Configuration options for the instrumentation
 */
export interface InstrumentationConfig {
  platformUrl?: string;
  projectId?: string;
  uploadInterval?: number; // in milliseconds, default 10000 (10 seconds)
  enabled?: boolean; // default true
  debug?: boolean; // default false
}

/**
 * Next.js config that can be passed to withInstrumentation
 */
export type NextConfig = Record<string, any>;

/**
 * Function queued for deletion
 */
export interface DeletionQueueItem {
  projectId: string;
  file: string;
  name: string;
  line: number;
  queuedAt: number;
}

/**
 * Response from the deletions API endpoint
 */
export interface DeletionsResponse {
  deletions: DeletionQueueItem[];
}
