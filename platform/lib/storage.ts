import { put, list } from "@vercel/blob";
import { ProjectIndex, ProjectUsage, ProjectSummary, UsagePayload, StoredFunction, FunctionMetadataFile } from "./types";
import { getFunctionKey } from "./utils";
import { promises as fs } from "fs";
import path from "path";

// Blob paths
const PROJECT_INDEX_PATH = "projects/index.json";
const getProjectUsagePath = (projectId: string) => `projects/${projectId}/usage.json`;
const getProjectMetadataPath = (projectId: string) => `projects/${projectId}/metadata.json`;

// Check if we're running in a serverless environment (Vercel, AWS Lambda, etc.)
function isServerlessEnvironment(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.FUNCTION_NAME ||
    process.env.NETLIFY
  );
}

// Local storage directory for development
// Use /tmp on serverless platforms, local directory otherwise
const LOCAL_STORAGE_DIR = isServerlessEnvironment()
  ? path.join("/tmp", ".local-storage")
  : path.join(process.cwd(), ".local-storage");

/**
 * Check if we should use local storage (development mode)
 */
function shouldUseLocalStorage(): boolean {
  return !process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Ensure local storage directory exists
 */
async function ensureLocalStorageDir(): Promise<void> {
  if (isServerlessEnvironment() && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN must be configured for serverless deployments. " +
      "Local storage is only available for local development. " +
      "Please set the BLOB_READ_WRITE_TOKEN environment variable."
    );
  }

  try {
    await fs.mkdir(LOCAL_STORAGE_DIR, { recursive: true });
    await fs.mkdir(path.join(LOCAL_STORAGE_DIR, "projects"), { recursive: true });
  } catch (error) {
    console.error("Error creating local storage directory:", error);
    throw new Error(
      `Failed to create local storage directory at ${LOCAL_STORAGE_DIR}. ` +
      `This may indicate insufficient permissions or an unsupported environment.`
    );
  }
}

/**
 * Read from local filesystem
 */
async function readLocalFile(filePath: string): Promise<string | null> {
  try {
    const fullPath = path.join(LOCAL_STORAGE_DIR, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    return content;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * Write to local filesystem
 */
async function writeLocalFile(filePath: string, content: string): Promise<void> {
  await ensureLocalStorageDir();
  const fullPath = path.join(LOCAL_STORAGE_DIR, filePath);
  const dir = path.dirname(fullPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, content, "utf-8");
}

/**
 * List files in local storage (currently unused, but kept for future debugging)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function listLocalFiles(prefix: string): Promise<string[]> {
  try {
    await ensureLocalStorageDir();
    const fullPath = path.join(LOCAL_STORAGE_DIR, prefix);
    const files = await fs.readdir(fullPath, { recursive: true });
    return files.map((f) => path.join(prefix, f.toString()));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

/**
 * Get the project index (list of all projects)
 */
export async function getProjectIndex(): Promise<ProjectIndex> {
  try {
    // Use local storage if no token configured
    if (shouldUseLocalStorage()) {
      console.log("[Local Storage] Reading project index");
      const content = await readLocalFile(PROJECT_INDEX_PATH);
      if (!content) {
        return { projects: [] };
      }
      return JSON.parse(content) as ProjectIndex;
    }

    // Use Vercel Blob Storage
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error("BLOB_READ_WRITE_TOKEN not configured");
    }

    // List all blobs to find the index
    const { blobs } = await list({
      token,
      prefix: "projects/",
    });

    const indexBlob = blobs.find((b) => b.pathname === PROJECT_INDEX_PATH);

    if (!indexBlob) {
      // No index exists yet, return empty
      return { projects: [] };
    }

    // Fetch the index
    const response = await fetch(indexBlob.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch project index: ${response.statusText}`);
    }

    const data = await response.json();
    return data as ProjectIndex;
  } catch (error) {
    console.error("Error fetching project index:", error);
    // Return empty index on error
    return { projects: [] };
  }
}

/**
 * Update the project index with a new or updated project
 */
export async function updateProjectIndex(projectId: string, updates: Partial<ProjectSummary>): Promise<void> {
  const index = await getProjectIndex();

  // Find existing project or create new entry
  const existingIndex = index.projects.findIndex((p) => p.projectId === projectId);

  if (existingIndex >= 0) {
    // Update existing project
    index.projects[existingIndex] = {
      ...index.projects[existingIndex],
      ...updates,
    };
  } else {
    // Add new project
    const newProject: ProjectSummary = {
      projectId,
      name: projectId, // Default to projectId as name
      lastUpdated: Date.now(),
      totalFunctions: 0,
      deadCodeCount: 0,
      ...updates,
    };
    index.projects.push(newProject);
  }

  const content = JSON.stringify(index, null, 2);

  // Use local storage if no token configured
  if (shouldUseLocalStorage()) {
    console.log("[Local Storage] Writing project index");
    await writeLocalFile(PROJECT_INDEX_PATH, content);
    return;
  }

  // Save to Vercel Blob
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN not configured");
  }

  await put(PROJECT_INDEX_PATH, content, {
    token,
    access: "public",
    contentType: "application/json",
  });
}

/**
 * Get usage data for a specific project
 */
export async function getProjectUsage(projectId: string): Promise<ProjectUsage | null> {
  try {
    const filePath = getProjectUsagePath(projectId);

    // Use local storage if no token configured
    if (shouldUseLocalStorage()) {
      console.log(`[Local Storage] Reading usage data for ${projectId}`);
      const content = await readLocalFile(filePath);
      if (!content) {
        return null;
      }
      return JSON.parse(content) as ProjectUsage;
    }

    // Use Vercel Blob Storage
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error("BLOB_READ_WRITE_TOKEN not configured");
    }

    // List blobs to find the usage file
    const { blobs } = await list({
      token,
      prefix: `projects/${projectId}/`,
    });

    const usageBlob = blobs.find((b) => b.pathname === filePath);

    if (!usageBlob) {
      // No usage data exists yet
      return null;
    }

    // Fetch the usage data
    const response = await fetch(usageBlob.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch project usage: ${response.statusText}`);
    }

    const data = await response.json();
    return data as ProjectUsage;
  } catch (error) {
    console.error(`Error fetching project usage for ${projectId}:`, error);
    return null;
  }
}

/**
 * Save project usage data to storage
 */
async function saveProjectUsage(projectId: string, usage: ProjectUsage): Promise<void> {
  const filePath = getProjectUsagePath(projectId);
  const content = JSON.stringify(usage, null, 2);

  // Use local storage if no token configured
  if (shouldUseLocalStorage()) {
    console.log(`[Local Storage] Writing usage data for ${projectId}`);
    await writeLocalFile(filePath, content);
    return;
  }

  // Save to Vercel Blob
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN not configured");
  }

  await put(filePath, content, {
    token,
    access: "public",
    contentType: "application/json",
  });
}

/**
 * Normalize file path to match metadata format (relative paths)
 */
function normalizeFilePathForStorage(filePath: string): string {
  if (!filePath) return "";
  
  let normalized = filePath.replace(/\\/g, "/");
  
  // Remove absolute path prefixes - find the last occurrence of project directories
  const projectDirs = ["app", "components", "lib", "src", "pages", "utils"];
  for (const dir of projectDirs) {
    const pattern = new RegExp(`.*/${dir}/(.*)$`);
    const match = normalized.match(pattern);
    if (match) {
      return `${dir}/${match[1]}`;
    }
  }
  
  // If path starts with exampleapp/, remove that prefix
  if (normalized.includes("exampleapp/")) {
    const exampleappIndex = normalized.indexOf("exampleapp/");
    normalized = normalized.substring(exampleappIndex + "exampleapp/".length);
  }
  
  // Remove leading slashes
  normalized = normalized.replace(/^\/+/, "");
  
  return normalized;
}

/**
 * Update project usage with new data from instrumentation
 * This aggregates incoming call counts with existing totals
 */
export async function updateProjectUsage(payload: UsagePayload): Promise<void> {
  const { projectId, timestamp, functions } = payload;

  // Get existing usage data or create new
  let usage = await getProjectUsage(projectId);

  if (!usage) {
    usage = {
      projectId,
      lastUpdated: timestamp,
      functions: {},
    };
  }

  // Store original function count for logging
  const originalFunctionCount = Object.keys(usage.functions).length;
  let updatedCount = 0;
  let newCount = 0;

  // Aggregate function call data
  // Normalize file paths to match metadata format for consistent matching
  for (const func of functions) {
    // Normalize the file path for storage (to match metadata format)
    const normalizedFile = normalizeFilePathForStorage(func.file);
    const key = getFunctionKey(normalizedFile, func.name, func.line);

    if (usage.functions[key]) {
      // Update existing function
      usage.functions[key].totalCalls += func.callCount;
      if (func.callCount > 0) {
        usage.functions[key].lastSeen = timestamp;
      }
      updatedCount++;
      
      // Log if we detect a potential issue (calls going backwards)
      if (func.callCount < 0) {
        console.warn(`[Usage Update] Negative call count for ${key}: ${func.callCount}`);
      }
    } else {
      // New function - store with normalized path
      const newFunc: StoredFunction = {
        file: normalizedFile, // Store normalized path to match metadata
        name: func.name,
        line: func.line,
        totalCalls: func.callCount,
        lastSeen: timestamp,
        firstSeen: timestamp,
      };
      usage.functions[key] = newFunc;
      newCount++;
    }
  }

  usage.lastUpdated = timestamp;

  // Log update summary
  const finalFunctionCount = Object.keys(usage.functions).length;
  console.log(`[Usage Update] Project: ${projectId}, Functions: ${originalFunctionCount} -> ${finalFunctionCount} (${updatedCount} updated, ${newCount} new), Total incoming: ${functions.length}`);

  // Save updated usage data
  await saveProjectUsage(projectId, usage);

  // Calculate statistics
  const totalFunctions = Object.keys(usage.functions).length;
  const deadCodeCount = Object.values(usage.functions).filter((f) => f.totalCalls === 0).length;

  // Update project index
  await updateProjectIndex(projectId, {
    lastUpdated: timestamp,
    totalFunctions,
    deadCodeCount,
  });
}

/**
 * Save project metadata from static analysis
 */
export async function saveProjectMetadata(metadata: FunctionMetadataFile): Promise<void> {
  const filePath = getProjectMetadataPath(metadata.projectId);
  const content = JSON.stringify(metadata, null, 2);

  // Use local storage if no token configured
  if (useLocalStorage()) {
    console.log(`[Local Storage] Writing metadata for ${metadata.projectId}`);
    await writeLocalFile(filePath, content);
    return;
  }

  // Save to Vercel Blob
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN not configured");
  }

  await put(filePath, content, {
    token,
    access: "public",
    contentType: "application/json",
  });
}

/**
 * Get project metadata from static analysis
 */
export async function getProjectMetadata(projectId: string): Promise<FunctionMetadataFile | null> {
  try {
    const filePath = getProjectMetadataPath(projectId);

    // Use local storage if no token configured
    if (useLocalStorage()) {
      console.log(`[Local Storage] Reading metadata for ${projectId}`);
      const content = await readLocalFile(filePath);
      if (!content) {
        // In development, try to read directly from exampleapp directory as fallback
        try {
          // Try multiple possible paths relative to platform directory
          const platformDir = process.cwd();
          const possiblePaths = [
            path.join(platformDir, "..", "exampleapp", "function-metadata.json"),
            path.resolve(platformDir, "..", "exampleapp", "function-metadata.json"),
            // Also try absolute path from workspace root
            path.resolve(platformDir, "..", "..", "exampleapp", "function-metadata.json"),
          ];
          
          for (const exampleappPath of possiblePaths) {
            try {
              const fallbackContent = await fs.readFile(exampleappPath, "utf-8");
              const metadata = JSON.parse(fallbackContent) as FunctionMetadataFile;
              if (metadata.projectId === projectId) {
                console.log(`[Local Storage] Found metadata in exampleapp directory (fallback): ${exampleappPath}`);
                return metadata;
              }
            } catch (pathError) {
              // Try next path
              continue;
            }
          }
        } catch (fallbackError) {
          // Ignore fallback errors
        }
        return null;
      }
      return JSON.parse(content) as FunctionMetadataFile;
    }

    // Use Vercel Blob Storage
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error("BLOB_READ_WRITE_TOKEN not configured");
    }

    // List blobs to find the metadata file
    const { blobs } = await list({
      token,
      prefix: `projects/${projectId}/`,
    });

    const metadataBlob = blobs.find((b) => b.pathname === filePath);

    if (!metadataBlob) {
      // No metadata exists yet
      return null;
    }

    // Fetch the metadata
    const response = await fetch(metadataBlob.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch project metadata: ${response.statusText}`);
    }

    const data = await response.json();
    return data as FunctionMetadataFile;
  } catch (error) {
    console.error(`Error fetching project metadata for ${projectId}:`, error);
    return null;
  }
}

/**
 * Delete a project and all its data
 * (For future use - not currently exposed in API)
 */
export async function deleteProject(): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN not configured");
  }

  // Note: @vercel/blob doesn't have a direct delete method
  // We would need to implement this differently or use Vercel API
  // For now, this is a placeholder
  console.warn("Delete functionality not yet implemented");
}
