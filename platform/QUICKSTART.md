# Quick Start Guide

## Prerequisites

- Node.js 18+
- Vercel account for Blob Storage
- An instrumented codebase (see `/instrument` directory)

## Setup Steps

### 1. Install Dependencies

```bash
cd platform
npm install
```

### 2. Get Vercel Blob Storage Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new Blob Store (or use existing)
3. Copy the `BLOB_READ_WRITE_TOKEN`

### 3. Configure Environment

Create `.env.local` in the platform directory:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

### 4. Start Development Server

```bash
npm run dev
```

The platform will be available at [http://localhost:3001](http://localhost:3001)

## Testing with Example App

### 1. Start Platform

```bash
cd platform
npm run dev
```

Keep this running on port 3001.

### 2. Start Instrumented Example App

In a new terminal:

```bash
cd ../exampleapp
npm run dev
```

This will run on port 3000 with instrumentation enabled.

### 3. Generate Usage Data

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click around the example app (dashboard, meetings, analytics, etc.)
3. Wait ~10 seconds for the first data upload

### 4. View Platform

1. Open [http://localhost:3001](http://localhost:3001)
2. You should see the "example-app" project appear
3. Click on it to view function usage statistics
4. Functions with 0 calls are highlighted in red (dead code)

## Features to Try

- **Sort Functions**: Click column headers to sort by file, name, calls, etc.
- **Select Dead Code**: Use "Select all dead code" button
- **Trigger Agent**: Click "Remove Selected Dead Code" (shows stub message for now)
- **Auto-Refresh**: Data refreshes automatically every 15 seconds

## Troubleshooting

### No projects appearing?

- Check that exampleapp is running and configured correctly
- Verify `BLOB_READ_WRITE_TOKEN` is set in `.env.local`
- Check browser console for errors
- Verify exampleapp's `next.config.ts` points to `http://localhost:3001/api/usage`

### Build errors?

```bash
# Clean and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Type errors?

```bash
npx tsc --noEmit
```

## Next Steps

1. **Deploy to Vercel**: See README.md for deployment instructions
2. **Instrument Your Own App**: Follow `/instrument/README.md`
3. **Review Dead Code**: Use the platform to identify unused functions
4. **Agent Integration**: Coming soon - automated PR creation for code removal

## API Endpoints

- `POST /api/usage` - Receive usage data from instrumented apps
- `GET /api/projects` - List all projects
- `GET /api/projects/[id]` - Get project details
- `POST /api/agent/trigger` - Trigger dead code removal (stub)

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

## Support

For issues or questions, see the main README.md or open an issue in the repository.

