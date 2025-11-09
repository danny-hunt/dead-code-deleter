import { FunctionUsage, UsagePayload, InstrumentationConfig } from "./types";

/**
 * Global function call tracker
 * Key format: "file:functionName:line"
 */
const callTracker = new Map<string, number>();

/**
 * Configuration loaded from environment variables or defaults
 */
const config: Required<InstrumentationConfig> = {
  platformUrl: process.env.NEXT_PUBLIC_DEAD_CODE_PLATFORM_URL || process.env.DEAD_CODE_PLATFORM_URL || "",
  projectId: process.env.NEXT_PUBLIC_DEAD_CODE_PROJECT_ID || process.env.DEAD_CODE_PROJECT_ID || "default",
  uploadInterval: parseInt(process.env.DEAD_CODE_UPLOAD_INTERVAL || "10000", 10),
  enabled: process.env.DEAD_CODE_ENABLED !== "false",
  debug: process.env.DEAD_CODE_DEBUG === "true",
};

let uploadTimer: NodeJS.Timeout | null = null;
let isInitialized = false;

/**
 * Log debug messages if debug mode is enabled
 */
function debug(...args: any[]) {
  if (config.debug) {
    console.log("[dead-code-deleter]", ...args);
  }
}

/**
 * Track a function call
 * This function is injected into instrumented code by the Babel plugin
 */
export function __trackFn(file: string, name: string, line: number): void {
  if (!config.enabled) return;

  const key = `${file}:${name}:${line}`;
  const currentCount = callTracker.get(key) || 0;
  callTracker.set(key, currentCount + 1);
}

/**
 * Upload collected usage data to the platform
 */
async function uploadUsageData(): Promise<void> {
  if (!config.platformUrl) {
    debug("No platform URL configured, skipping upload");
    return;
  }

  if (callTracker.size === 0) {
    debug("No function calls to upload");
    return;
  }

  // Extract current data and clear tracker
  const functions: FunctionUsage[] = [];
  for (const [key, callCount] of callTracker.entries()) {
    const [file, name, lineStr] = key.split(":");
    functions.push({
      file,
      name,
      line: parseInt(lineStr, 10),
      callCount,
    });
  }
  callTracker.clear();

  const payload: UsagePayload = {
    projectId: config.projectId,
    timestamp: Date.now(),
    functions,
  };

  debug(`Uploading ${functions.length} function usage records`);
  debug(`Target URL: ${config.platformUrl}`);
  debug(`Project ID: ${config.projectId}`);
  debug(`Sample functions:`, functions.slice(0, 3));

  try {
    const response = await fetch(config.platformUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unable to read error response");
      console.error(
        `[dead-code-deleter] Failed to upload usage data:`,
        `\n  Status: ${response.status} ${response.statusText}`,
        `\n  URL: ${config.platformUrl}`,
        `\n  Project ID: ${config.projectId}`,
        `\n  Function count: ${functions.length}`,
        `\n  Response: ${errorText}`
      );
    } else {
      debug("Successfully uploaded usage data");
    }
  } catch (error) {
    console.error(
      `[dead-code-deleter] Error uploading usage data:`,
      `\n  URL: ${config.platformUrl}`,
      `\n  Project ID: ${config.projectId}`,
      `\n  Function count: ${functions.length}`,
      `\n  Error:`,
      error
    );
  }
}

/**
 * Initialize the runtime collector
 * Sets up periodic uploads and cleanup handlers
 */
function initialize(): void {
  if (isInitialized || !config.enabled) return;
  isInitialized = true;

  debug("Initializing instrumentation runtime", {
    platformUrl: config.platformUrl,
    projectId: config.projectId,
    uploadInterval: config.uploadInterval,
  });

  // Start periodic uploads
  uploadTimer = setInterval(() => {
    uploadUsageData().catch((err) => {
      console.error("[dead-code-deleter] Upload failed:", err);
    });
  }, config.uploadInterval);

  // Ensure we upload on process exit (Node.js only, not Edge Runtime)
  const isEdgeRuntime = typeof process !== "undefined" && process.env?.NEXT_RUNTIME === "edge";
  if (typeof process !== "undefined" && !isEdgeRuntime) {
    const cleanup = () => {
      if (uploadTimer) {
        clearInterval(uploadTimer);
        uploadTimer = null;
      }
      // Synchronous upload on exit would be ideal but fetch is async
      // In production, rely on periodic uploads
      debug("Cleaning up instrumentation");
    };

    // TODO: COMMENTING THESE OUT WAS A HACK TO GET THE EXAMPLE WORKING
    // process.on("beforeExit", cleanup);
    // process.on("SIGINT", cleanup);
    // process.on("SIGTERM", cleanup);
  }

  // For browser environments, try to upload before unload
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      // Use sendBeacon for more reliable delivery
      if (navigator.sendBeacon && config.platformUrl && callTracker.size > 0) {
        const functions: FunctionUsage[] = [];
        for (const [key, callCount] of callTracker.entries()) {
          const [file, name, lineStr] = key.split(":");
          functions.push({
            file,
            name,
            line: parseInt(lineStr, 10),
            callCount,
          });
        }

        const payload: UsagePayload = {
          projectId: config.projectId,
          timestamp: Date.now(),
          functions,
        };

        navigator.sendBeacon(config.platformUrl, JSON.stringify(payload));
        callTracker.clear();
      }
    });
  }
}

// Auto-initialize when this module is imported
initialize();

/**
 * Manually trigger an upload (useful for testing or on-demand uploads)
 */
export async function flush(): Promise<void> {
  await uploadUsageData();
}

/**
 * Get current statistics (useful for debugging)
 */
export function getStats() {
  return {
    trackedFunctions: callTracker.size,
    totalCalls: Array.from(callTracker.values()).reduce((sum, count) => sum + count, 0),
    config,
  };
}
