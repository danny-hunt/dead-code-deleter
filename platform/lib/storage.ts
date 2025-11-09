import { put, list } from "@vercel/blob";
import { ProjectIndex, ProjectUsage, ProjectSummary, UsagePayload, StoredFunction } from "./types";
import { getFunctionKey } from "./utils";
import { promises as fs } from "fs";
import path from "path";

// Blob paths
const PROJECT_INDEX_PATH = "projects/index.json";
const getProjectUsagePath = (projectId: string) => `projects/${projectId}/usage.json`;

// Local storage directory for development
const LOCAL_STORAGE_DIR = path.join(process.cwd(), ".local-storage");

/**
 * Check if we should use local storage (development mode)
 */
function useLocalStorage(): boolean {
  return !process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Ensure local storage directory exists
 */
async function ensureLocalStorageDir(): Promise<void> {
  try {
    await fs.mkdir(LOCAL_STORAGE_DIR, { recursive: true });
    await fs.mkdir(path.join(LOCAL_STORAGE_DIR, "projects"), { recursive: true });
  } catch (error) {
    console.error("Error creating local storage directory:", error);
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
 * List files in local storage
 */
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
    if (useLocalStorage()) {
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
  if (useLocalStorage()) {
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
    if (useLocalStorage()) {
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
  if (useLocalStorage()) {
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

  // Aggregate function call data
  for (const func of functions) {
    const key = getFunctionKey(func.file, func.name, func.line);

    if (usage.functions[key]) {
      // Update existing function
      usage.functions[key].totalCalls += func.callCount;
      if (func.callCount > 0) {
        usage.functions[key].lastSeen = timestamp;
      }
    } else {
      // New function
      const newFunc: StoredFunction = {
        file: func.file,
        name: func.name,
        line: func.line,
        totalCalls: func.callCount,
        lastSeen: timestamp,
        firstSeen: timestamp,
      };
      usage.functions[key] = newFunc;
    }
  }

  usage.lastUpdated = timestamp;

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
