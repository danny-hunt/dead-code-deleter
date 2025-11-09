# Dead Code Platform

A Next.js platform application that receives function usage data from instrumented codebases, stores it in Vercel Blob Storage, and provides a UI to view usage statistics and trigger dead code removal.

## Features

- 📊 **Real-time Monitoring** - Receives usage data from instrumented apps every 10 seconds
- 📈 **Usage Statistics** - View function-by-function usage metrics
- 🔴 **Dead Code Detection** - Automatically identifies functions with zero calls
- 🎯 **Multi-Project Support** - Monitor multiple codebases from a single dashboard
- 🚀 **Agent Integration** - Trigger automated dead code removal (coming soon)
- 🌙 **Dark Mode** - Full dark mode support

## Prerequisites

- Node.js 18+
- Vercel account (for Blob Storage)
- Instrumented codebase(s) using `@dead-code-deleter/instrument`

## Setup

### 1. Install Dependencies

```bash
cd platform
npm install
```

### 2. Configure Vercel Blob Storage

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new Blob Store or use an existing one
3. Get your `BLOB_READ_WRITE_TOKEN`

### 3. Set Environment Variables

Create a `.env.local` file in the platform directory:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

See `.env.local.example` for reference.

### 4. Run Development Server

```bash
npm run dev
```

The platform will be available at [http://localhost:3001](http://localhost:3001)

## Usage

### Connecting Instrumented Apps

To send usage data to this platform, configure your instrumented apps to point to:

```
http://localhost:3001/api/usage
```

Or in production:

```
https://your-platform-domain.com/api/usage
```

Example instrumentation config in your app:

```typescript
// next.config.ts
withInstrumentation({
  platformUrl: "http://localhost:3001/api/usage",
  projectId: "my-app",
  debug: true,
  uploadInterval: 10000,
})(nextConfig);
```

### Viewing Usage Statistics

1. Open the platform in your browser
2. Your instrumented projects will appear automatically after they send their first data
3. Select a project from the dropdown
4. View function usage statistics:
   - 🔴 Red: Dead code (0 calls)
   - 🟡 Yellow: Low usage (1-9 calls)
   - 🟢 Green: Active (10+ calls)
5. Sort by any column (file, function, line, calls, last seen)
6. Select functions to remove

### Triggering Dead Code Removal

1. Select dead code functions from the table (or use "Select all dead code" button)
2. Click "Remove Selected Dead Code"
3. Currently shows a stub message - agent integration coming soon

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────┐
│     Instrumented Apps (exampleapp)         │
│  - Tracks function calls every 10s          │
│  - POSTs to /api/usage                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼ HTTP POST every 10s
┌─────────────────────────────────────────────┐
│          Dead Code Platform                 │
│  ┌─────────────────────────────────────┐   │
│  │  /api/usage                          │   │
│  │  - Receives usage data               │   │
│  │  - Aggregates call counts            │   │
│  │  - Stores in Vercel Blob             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Vercel Blob Storage                │   │
│  │  - projects/index.json               │   │
│  │  - projects/{id}/usage.json          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Next.js UI                          │   │
│  │  - Project selector                  │   │
│  │  - Usage stats table                 │   │
│  │  - Agent trigger                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Storage Format

**Project Index** (`projects/index.json`):
```json
{
  "projects": [
    {
      "projectId": "example-app",
      "name": "example-app",
      "lastUpdated": 1699564820000,
      "totalFunctions": 42,
      "deadCodeCount": 5
    }
  ]
}
```

**Project Usage** (`projects/{projectId}/usage.json`):
```json
{
  "projectId": "example-app",
  "lastUpdated": 1699564820000,
  "functions": {
    "/path/to/file.ts:functionName:10": {
      "file": "/path/to/file.ts",
      "name": "functionName",
      "line": 10,
      "totalCalls": 42,
      "lastSeen": 1699564820000,
      "firstSeen": 1699564800000
    }
  }
}
```

## API Routes

### `POST /api/usage`

Receives usage data from instrumented apps.

**Request Body:**
```json
{
  "projectId": "example-app",
  "timestamp": 1699564820000,
  "functions": [
    {
      "file": "/path/to/file.ts",
      "name": "functionName",
      "line": 10,
      "callCount": 5
    }
  ]
}
```

### `GET /api/projects`

Returns list of all projects.

**Response:**
```json
{
  "projects": [
    {
      "projectId": "example-app",
      "name": "example-app",
      "lastUpdated": 1699564820000,
      "totalFunctions": 42,
      "deadCodeCount": 5
    }
  ]
}
```

### `GET /api/projects/[projectId]`

Returns usage statistics for a specific project.

**Query Params:**
- `sort`: "file" | "name" | "line" | "totalCalls" | "lastSeen"
- `order`: "asc" | "desc"

### `POST /api/agent/trigger`

Trigger dead code removal (stub).

**Request Body:**
```json
{
  "projectId": "example-app",
  "functions": ["file:name:line", ...]
}
```

## Project Structure

```
platform/
├── app/
│   ├── page.tsx              # Main dashboard UI
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       ├── usage/route.ts    # Receive instrumentation data
│       ├── projects/route.ts # List projects
│       ├── projects/[projectId]/route.ts  # Get project stats
│       └── agent/trigger/route.ts         # Trigger agent (stub)
├── components/
│   ├── project-selector.tsx  # Project dropdown
│   ├── usage-stats-table.tsx # Function usage table
│   ├── agent-trigger.tsx     # Dead code removal button
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── storage.ts            # Vercel Blob operations
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
└── ...config files
```

## Development

### Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS, shadcn/ui
- **Storage:** Vercel Blob Storage
- **Icons:** Lucide React
- **Date Formatting:** date-fns

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com/new)
3. Add environment variable: `BLOB_READ_WRITE_TOKEN`
4. Deploy

The platform will automatically create and manage Blob storage.

### Other Platforms

1. Set up Vercel Blob Storage separately
2. Configure `BLOB_READ_WRITE_TOKEN`
3. Build: `npm run build`
4. Deploy `.next` folder to any Node.js hosting

## Testing

### With Example App

1. Start the platform:
   ```bash
   cd platform
   npm run dev
   ```

2. In another terminal, start the instrumented exampleapp:
   ```bash
   cd ../exampleapp
   npm run dev
   ```

3. Use the exampleapp (click around, navigate pages)

4. View the platform at http://localhost:3001 to see usage data

5. After ~10 seconds, you should see:
   - "example-app" project appear
   - Function usage statistics
   - Dead code identified

## Future Enhancements

- [ ] Real cursor-agent integration for automated PR creation
- [ ] Historical usage trends and charts
- [ ] Authentication and user management
- [ ] Real database (PostgreSQL) instead of Blob storage
- [ ] Configurable dead code thresholds
- [ ] Code ownership tracking
- [ ] Exclusion rules for certain files/functions
- [ ] Slack/Discord notifications
- [ ] Export reports (CSV, PDF)

## Troubleshooting

### No projects appearing

1. Check that instrumented app is running
2. Verify `platformUrl` in instrumented app config
3. Check browser console for errors
4. Verify `BLOB_READ_WRITE_TOKEN` is set correctly

### CORS errors

The `/api/usage` endpoint has CORS enabled. If you still see errors:
- Check that the request is being sent with correct headers
- Verify the platformUrl in your instrumented app

### Storage errors

- Verify your Vercel Blob token is valid
- Check Vercel dashboard for Blob store limits
- Ensure token has read/write permissions

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
