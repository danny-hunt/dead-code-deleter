<!-- 8d92447f-7fb4-42d4-ac79-57d6c7e73632 22f752f3-b2e9-4790-860b-1fff2a2041cb -->
# NextJS Dead Code Platform Application

## Overview

Create a NextJS TypeScript application that receives function usage data from instrumented codebases, stores it in Vercel Blob Storage, and provides a UI to view usage statistics and trigger dead code removal.

## Instrumentation Data Format

Based on the implemented instrumentation library in `/instrument`, the platform will receive POST requests with this exact payload:

```typescript
{
  projectId: string,        // e.g., "example-app"
  timestamp: number,        // Unix timestamp in milliseconds
  functions: [
    {
      file: string,         // Full file path, e.g., "/Users/danny/src/dead-code-deleter/exampleapp/lib/api-client.ts"
      name: string,         // Function name, e.g., "getMeetings" or "Dashboard.handleClick"
      line: number,         // Line number where function is defined
      callCount: number     // Number of calls since last upload (10 second intervals)
    }
  ]
}
```

### Real-World Example Payload

```typescript
{
  "projectId": "example-app",
  "timestamp": 1699564820000,
  "functions": [
    {
      "file": "/Users/danny/src/dead-code-deleter/exampleapp/components/dashboard.tsx",
      "name": "Dashboard",
      "line": 12,
      "callCount": 45
    },
    {
      "file": "/Users/danny/src/dead-code-deleter/exampleapp/lib/api-client.ts",
      "name": "getMeetings",
      "line": 23,
      "callCount": 12
    },
    {
      "file": "/Users/danny/src/dead-code-deleter/exampleapp/lib/utils.ts",
      "name": "formatDate",
      "line": 8,
      "callCount": 0
    }
  ]
}
```

### Instrumentation Behavior

- **Upload frequency**: Every 10 seconds (configurable via `uploadInterval`)
- **Both client and server**: Tracks functions in both browser and Node.js code
- **Cumulative counts**: Each upload sends call counts since last upload, which platform must aggregate
- **Browser unload**: Uses `navigator.sendBeacon` for reliable delivery when page closes
- **Function naming**: 
  - Regular functions: `"functionName"`
  - Class methods: `"ClassName.methodName"`
  - Anonymous functions: `"anonymous"`
  - Default exports: `"default"`

### Configuration (Set in instrumented apps)

```typescript
// exampleapp/next.config.ts
withInstrumentation({
  platformUrl: "http://localhost:3001/api/usage",  // Where to send data
  projectId: "example-app",                         // Project identifier
  debug: true,                                       // Enable debug logging
  uploadInterval: 10000,                            // Upload every 10 seconds
})
```

## Architecture

### Data Flow
1. Instrumented apps POST usage data to `/api/usage` every 10 seconds
2. Platform receives data, fetches existing project blob from Vercel Blob Storage
3. Platform aggregates new call counts with existing totals (sums them)
4. Platform updates project blob and project index
5. UI fetches project list and usage stats via API routes
6. User can trigger agent jobs (stubbed for now)

### Data Storage Strategy

Since Vercel Blob is object storage (not a database), we'll use this structure:

**Project Index** (`projects/index.json`):
```typescript
{
  projects: [
    {
      projectId: string,
      name: string,
      lastUpdated: number,
      totalFunctions: number
    }
  ]
}
```

**Project Usage Data** (`projects/{projectId}/usage.json`):
```typescript
{
  projectId: string,
  lastUpdated: number,
  functions: {
    // Key format: "file:functionName:line"
    "/path/to/file.ts:functionName:10": {
      file: string,
      name: string,
      line: number,
      totalCalls: number,      // Cumulative sum of all callCounts received
      lastSeen: number,        // Timestamp of last time this function was called
      firstSeen: number        // Timestamp of first time we saw this function
    }
  }
}
```

### Aggregation Logic

When receiving new data:
1. Parse incoming functions array
2. For each function, create key: `${file}:${name}:${line}`
3. Fetch existing project usage blob
4. For each function:
   - If exists: `totalCalls += callCount`, update `lastSeen`
   - If new: Create entry with `totalCalls = callCount`, set `firstSeen` and `lastSeen`
5. Save updated blob

## Implementation

### 1. API Routes

**`app/api/usage/route.ts` (POST)**
- Receives instrumentation data from client apps
- Validates payload:
  ```typescript
  interface UsagePayload {
    projectId: string;
    timestamp: number;
    functions: Array<{
      file: string;
      name: string;
      line: number;
      callCount: number;
    }>;
  }
  ```
- Calls `storage.updateProjectUsage(payload)` to aggregate data
- Returns `{ success: true }` or error
- Handles CORS for cross-origin requests

**`app/api/projects/route.ts` (GET)**
- Returns list of all instrumented projects
- Reads from `projects/index.json` blob
- Response: `{ projects: ProjectSummary[] }`

**`app/api/projects/[projectId]/route.ts` (GET)**
- Returns function usage stats for specific project
- Query params:
  - `sort`: "calls" | "name" | "file" (default: "calls")
  - `order`: "asc" | "desc" (default: "asc" for calls to show dead code first)
- Fetches project blob, converts to array, sorts
- Response: 
  ```typescript
  {
    projectId: string,
    lastUpdated: number,
    functions: Array<{
      file: string,
      name: string,
      line: number,
      totalCalls: number,
      lastSeen: number,
      firstSeen: number
    }>
  }
  ```

**`app/api/agent/trigger/route.ts` (POST)**
- Stub for cursor-agent integration
- Accepts: `{ projectId: string, functions: string[] }` (array of keys)
- Returns mock response: `{ status: "stub", message: "Agent integration coming soon" }`
- TODO: Will integrate with cursor-agent to create PRs removing dead code

### 2. Frontend UI

**Single Page Application (`app/page.tsx`)**

Layout:
```
┌─────────────────────────────────────────┐
│  Dead Code Platform                     │
│  ┌─────────────────────────────────┐   │
│  │ Project: [Dropdown Selector]    │   │
│  │ Last Updated: 2 minutes ago     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔴 Dead Code (0 calls): 12      │   │
│  │ 🟡 Low Usage (<10): 8           │   │
│  │ 🟢 Active (≥10): 45             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [Trigger Dead Code Removal]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Functions Table (sortable)            │
│  ┌──────────┬──────────┬─────┬───────┐│
│  │ File     │ Function │ Line│ Calls ││
│  ├──────────┼──────────┼─────┼───────┤│
│  │ utils.ts │formatDate│  8  │  0   🔴││
│  │ api.ts   │oldFetch  │  45 │  3   🟡││
│  │ page.tsx │Dashboard │  12 │  156 🟢││
│  └──────────┴──────────┴─────┴───────┘│
└─────────────────────────────────────────┘
```

Components needed:
- **ProjectSelector** (`components/project-selector.tsx`)
  - Fetches projects from `/api/projects`
  - Dropdown to switch between projects
  - Shows last updated time
  
- **UsageStatsTable** (`components/usage-stats-table.tsx`)
  - Fetches function data from `/api/projects/[projectId]`
  - Displays all functions with file path, name, line, total calls
  - Sortable columns (click header to sort)
  - Color coding:
    - 🔴 Red: 0 calls (dead code)
    - 🟡 Yellow: 1-9 calls (low usage)
    - 🟢 Green: 10+ calls (active)
  - File path truncation (show relative path from project root)
  - Click to select functions for removal
  
- **AgentTrigger** (`components/agent-trigger.tsx`)
  - Button to trigger dead code removal
  - Accepts selected functions from table
  - POSTs to `/api/agent/trigger`
  - Shows stub message for now
  - TODO: Will show agent progress and PR link
  
- **EmptyState** (inline in page)
  - Shows when no projects exist
  - Instructions to set up instrumentation

### 3. Dependencies & Setup

**Required packages:**
```json
{
  "dependencies": {
    "@vercel/blob": "^0.23.0",
    "next": "15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

**Environment variables:**
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_token_here
```

Can reuse shadcn/ui components from exampleapp (copy components/ui folder).

### 4. Project Structure

```
platform/
├── app/
│   ├── page.tsx              # Main UI - project selector + stats table
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # TailwindCSS styles
│   ├── favicon.ico
│   └── api/
│       ├── usage/
│       │   └── route.ts      # POST - Receive instrumentation data
│       ├── projects/
│       │   ├── route.ts      # GET - List all projects
│       │   └── [projectId]/
│       │       └── route.ts  # GET - Get project usage stats
│       └── agent/
│           └── trigger/
│               └── route.ts  # POST - Trigger agent (stub)
├── components/
│   ├── project-selector.tsx
│   ├── usage-stats-table.tsx
│   ├── agent-trigger.tsx
│   └── ui/                   # Copy from exampleapp
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   ├── storage.ts            # Vercel Blob operations
│   ├── types.ts              # TypeScript types (match instrumentation)
│   └── utils.ts              # Utility functions (cn, formatters)
├── .env.local                # BLOB_READ_WRITE_TOKEN
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json           # shadcn/ui config
└── README.md
```

### 5. Key Implementation Details

**Storage operations** (`lib/storage.ts`):

```typescript
// Get list of all projects
export async function getProjectIndex(): Promise<ProjectIndex>

// Add or update project in index
export async function updateProjectIndex(projectId: string): Promise<void>

// Get usage data for a project
export async function getProjectUsage(projectId: string): Promise<ProjectUsage | null>

// Merge new usage data with existing (aggregation logic)
export async function updateProjectUsage(payload: UsagePayload): Promise<void>
```

Aggregation logic example:
```typescript
async function updateProjectUsage(payload: UsagePayload) {
  const existing = await getProjectUsage(payload.projectId) || { functions: {} };
  
  for (const func of payload.functions) {
    const key = `${func.file}:${func.name}:${func.line}`;
    
    if (existing.functions[key]) {
      // Update existing function
      existing.functions[key].totalCalls += func.callCount;
      if (func.callCount > 0) {
        existing.functions[key].lastSeen = payload.timestamp;
      }
    } else {
      // New function
      existing.functions[key] = {
        file: func.file,
        name: func.name,
        line: func.line,
        totalCalls: func.callCount,
        lastSeen: payload.timestamp,
        firstSeen: payload.timestamp
      };
    }
  }
  
  existing.lastUpdated = payload.timestamp;
  await saveProjectUsage(payload.projectId, existing);
}
```

**Types** (`lib/types.ts`):
```typescript
// Match instrumentation library format exactly
export interface FunctionUsage {
  file: string;
  name: string;
  line: number;
  callCount: number;
}

export interface UsagePayload {
  projectId: string;
  timestamp: number;
  functions: FunctionUsage[];
}

// Internal storage format
export interface StoredFunction {
  file: string;
  name: string;
  line: number;
  totalCalls: number;
  lastSeen: number;
  firstSeen: number;
}

export interface ProjectUsage {
  projectId: string;
  lastUpdated: number;
  functions: {
    [key: string]: StoredFunction;  // key: "file:name:line"
  };
}

export interface ProjectSummary {
  projectId: string;
  name: string;
  lastUpdated: number;
  totalFunctions: number;
  deadCodeCount: number;
}

export interface ProjectIndex {
  projects: ProjectSummary[];
}
```

**Utilities** (`lib/utils.ts`):
```typescript
// Format file paths for display (remove absolute path, show relative)
export function formatFilePath(fullPath: string, projectId: string): string

// Format timestamps
export function formatTimestamp(timestamp: number): string

// Classify usage level
export function getUsageLevel(calls: number): 'dead' | 'low' | 'active'

// Tailwind cn helper
export function cn(...inputs: ClassValue[]): string
```

## Testing

Use the exampleapp as the first test case:

1. **Start platform**: `cd platform && npm run dev` (port 3001)
2. **Start instrumented app**: `cd exampleapp && npm run dev` (port 3000)
3. **Generate traffic**: Click around the exampleapp
4. **Verify uploads**: Check platform receives data every 10 seconds
5. **Check UI**: View function usage stats in platform dashboard
6. **Test sorting**: Sort by calls, file name, etc.
7. **Test agent stub**: Click trigger button, see stub message

### Expected test data from exampleapp

After using the exampleapp, platform should show:
- Project: "example-app"
- ~40-50 functions tracked
- High usage: API client functions, page components
- Low/zero usage: Unused utility functions, commented-out code
- Both client-side (components) and server-side (API routes) functions

## Future Enhancements (Not in scope)

- Authentication/authorization
- Real database (PostgreSQL or similar)
- Actual cursor-agent integration for PR creation
- Historical trends and time-series analytics
- Configurable thresholds for "dead" vs "low" usage
- Data retention policies and archival
- Multi-user collaboration
- Code ownership tracking
- Exclusion rules (don't track certain files/functions)
- Dead code heat map visualization
- Integration with GitHub/GitLab

### To-dos

- [ ] Initialize Next.js app in `/platform` with TypeScript, install dependencies (@vercel/blob, etc)
- [ ] Create types in `lib/types.ts` matching instrumentation library format exactly
- [ ] Build storage helpers in `lib/storage.ts` for Vercel Blob operations (get/update project index and usage)
- [ ] Build `/api/usage` POST endpoint to receive and aggregate instrumentation data
- [ ] Build `/api/projects` GET endpoint to list all projects
- [ ] Build `/api/projects/[projectId]` GET endpoint to fetch and return sorted usage stats
- [ ] Create stubbed `/api/agent/trigger` POST endpoint for future cursor-agent integration
- [ ] Copy UI components from exampleapp (button, card, etc.) and set up Tailwind
- [ ] Build ProjectSelector component with dropdown and last-updated display
- [ ] Build UsageStatsTable component with sorting, color coding, and selection
- [ ] Build AgentTrigger component with stub message
- [ ] Assemble main page (`app/page.tsx`) with all components
- [ ] Add loading states, error handling, and empty states throughout
- [ ] Test with instrumented exampleapp and verify data flow end-to-end

