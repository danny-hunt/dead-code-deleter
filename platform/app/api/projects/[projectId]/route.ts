import { NextRequest, NextResponse } from "next/server";
import { getProjectUsage, getProjectMetadata } from "@/lib/storage";
import { ProjectDetailsResponse, StoredFunction } from "@/lib/types";
import { getFunctionKey } from "@/lib/utils";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

/**
 * GET /api/projects/[projectId]
 * Returns function usage stats for a specific project
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { projectId } = await context.params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Fetch metadata (static analysis - contains ALL functions)
    const metadata = await getProjectMetadata(projectId);
    console.log(`[Project Details] Metadata for ${projectId}:`, metadata ? `${metadata.functions.length} functions` : 'not found');

    // Fetch usage data (runtime tracking - only functions that were called)
    const usage = await getProjectUsage(projectId);
    console.log(`[Project Details] Usage for ${projectId}:`, usage ? `${Object.keys(usage.functions).length} functions` : 'not found');

    // If no metadata exists, fall back to usage-only mode
    if (!metadata) {
      if (!usage) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Convert functions object to array (usage-only mode)
      const functionsArray: StoredFunction[] = Object.values(usage.functions);
      
      // Get query parameters for sorting
      const searchParams = request.nextUrl.searchParams;
      const sortBy = searchParams.get("sort") || "totalCalls";
      const order = searchParams.get("order") || "asc";

      // Sort functions
      const sortedFunctions = [...functionsArray].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
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
          default:
            comparison = a.totalCalls - b.totalCalls;
        }
        return order === "desc" ? -comparison : comparison;
      });

      return NextResponse.json({
        projectId: usage.projectId,
        lastUpdated: usage.lastUpdated,
        functions: sortedFunctions,
      }, { status: 200 });
    }

    // Normalize file paths for matching (remove leading slashes, normalize separators)
    // Goal: Both metadata and usage paths should normalize to the same format
    // Metadata: "app/api/route.ts" -> "app/api/route.ts"
    // Usage: "/path/to/exampleapp/app/api/route.ts" -> "app/api/route.ts"
    const normalizePath = (filePath: string): string => {
      if (!filePath) return "";
      
      let normalized = filePath.replace(/\\/g, "/");
      
      // Remove absolute path prefixes - find the last occurrence of project directories
      // Try to extract path starting from common project directories (excluding exampleapp prefix)
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
    };

    // Create a map of usage data by function key for quick lookup
    // Use normalized paths for matching, but also try multiple normalization strategies
    const usageMap = new Map<string, StoredFunction>();
    const usageMapByOriginal = new Map<string, StoredFunction>(); // Also store by original key for debugging
    
    if (usage) {
      for (const func of Object.values(usage.functions)) {
        const normalizedFile = normalizePath(func.file);
        const normalizedKey = getFunctionKey(normalizedFile, func.name, func.line);
        const originalKey = getFunctionKey(func.file, func.name, func.line);
        
        usageMap.set(normalizedKey, func);
        usageMapByOriginal.set(originalKey, func);
        
        // Debug: log first few to see what we're getting
        if (usageMap.size <= 3) {
          console.log(`[Path Matching] Usage: "${func.file}" -> normalized: "${normalizedFile}"`);
        }
      }
      console.log(`[Path Matching] Total usage functions: ${usageMap.size}`);
    }

    // Start with ALL functions from metadata, merge in usage data
    let matchedCount = 0;
    let unmatchedCount = 0;
    let debugCount = 0;
    
    const functionsArray: StoredFunction[] = metadata.functions.map(metaFunc => {
      const normalizedFile = normalizePath(metaFunc.file);
      const key = getFunctionKey(normalizedFile, metaFunc.name, metaFunc.line);
      const usageFunc = usageMap.get(key);
      
      // Debug first few metadata paths
      if (debugCount < 3) {
        console.log(`[Path Matching] Metadata: "${metaFunc.file}" -> normalized: "${normalizedFile}", key: "${key}"`);
        debugCount++;
      }

      if (usageFunc) {
        // Function has usage data - merge metadata with usage
        matchedCount++;
        return {
          ...usageFunc,
          contributors: metaFunc.contributors,
        };
      } else {
        // Function has no usage data (0 calls, never called) - create from metadata
        unmatchedCount++;
        return {
          file: metaFunc.file,
          name: metaFunc.name,
          line: metaFunc.line,
          totalCalls: 0,
          lastSeen: 0,
          firstSeen: 0,
          contributors: metaFunc.contributors,
        };
      }
    });
    
    console.log(`[Path Matching] Matched: ${matchedCount}, Unmatched: ${unmatchedCount} out of ${functionsArray.length} total functions`);

    // Get query parameters for sorting
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get("sort") || "totalCalls";
    const order = searchParams.get("order") || "asc";

    // Sort functions
    const sortedFunctions = [...functionsArray].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
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
        default:
          comparison = a.totalCalls - b.totalCalls;
      }

      return order === "desc" ? -comparison : comparison;
    });

    // Use the most recent timestamp from either metadata or usage
    const lastUpdated = Math.max(
      metadata.analyzedAt,
      usage?.lastUpdated || 0
    );

    const response: ProjectDetailsResponse = {
      projectId: metadata.projectId,
      lastUpdated,
      functions: sortedFunctions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching project details:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch project details",
      },
      { status: 500 }
    );
  }
}

