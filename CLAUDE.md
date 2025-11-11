# Dead Code Deleter - Claude Development Guide

This is a monorepo for an automated dead code detection and removal system with four main components: instrumentation library, platform dashboard, automated agent, and example application.

## Project Overview

- **instrument/** - Babel-based instrumentation library that tracks function usage in Next.js apps
- **platform/** - Next.js dashboard for viewing usage stats and triggering deletions (runs on port 3001)
- **agent/** - Automated service that polls platform and creates PRs to remove dead code
- **exampleapp/** - Example Next.js app (MeetingFlow) instrumented for testing (runs on port 3000)
- **scripts/** - Utility scripts for analyzing and uploading metadata

## Common Bash Commands

### Root Level
- `npm run analyze` - Analyze functions in the codebase using scripts/analyze-functions.ts
- `npm run upload-metadata` - Upload function metadata to the platform
- `npm run agent` - Start the agent in dev mode (watches for changes)
- `npm run agent:build` - Build the agent for production
- `npm run agent:start` - Start the built agent in production mode

### Instrument Package
- `cd instrument && npm run build` - Build the instrumentation library
- `cd instrument && npm run watch` - Watch mode for development
- `cd instrument && npm test` - Run all Jest tests
- `cd instrument && npm run test:watch` - Run tests in watch mode
- `cd instrument && npm run test:coverage` - Generate test coverage report

### Platform
- `cd platform && npm run dev` - Start platform dev server on port 3001
- `cd platform && npm run build` - Build platform for production
- `cd platform && npm run start` - Start production platform server
- `cd platform && npm run lint` - Run ESLint on platform code

### Example App
- `cd exampleapp && npm run dev` - Start example app on port 3000
- `cd exampleapp && npm run build` - Build example app for production
- `cd exampleapp && npm run lint` - Run ESLint on example app

### Git Workflow
- `gh pr create --title "Your PR title" --body "Description" --base main` - Create PR using GitHub CLI

## Core Files & Structure

### Instrumentation Library (instrument/)
- `src/babel-plugin.ts` - Babel plugin that injects tracking calls into functions
- `src/runtime.ts` - Runtime collector that tracks function calls and uploads data
- `src/next.ts` - Next.js wrapper for easy integration
- `src/types.ts` - TypeScript type definitions
- `tests/` - Comprehensive test suite for babel plugin and runtime

### Platform (platform/)
- `app/api/usage/route.ts` - Receives function usage data from instrumented apps
- `app/api/projects/route.ts` - Lists all tracked projects
- `app/api/projects/[projectId]/route.ts` - Get usage stats for a project
- `app/api/deletions/route.ts` - Deletion requests endpoint (polled by agent)
- `app/api/agent/trigger/route.ts` - Triggers agent to create deletion PR
- `lib/storage.ts` - Vercel Blob storage operations
- `components/usage-stats-table.tsx` - Main table showing function usage

### Agent (agent/)
- `src/index.ts` - Main agent loop that polls platform and executes deletions using cursor-agent

### Example App (exampleapp/)
- `next.config.ts` - Uses `withInstrumentation()` wrapper to enable tracking
- `instrumentation.ts` - Next.js instrumentation hook
- `components/pages/` - Page components (Dashboard, Meetings, Calendar, etc.)
- `lib/db.ts` - In-memory database for demo purposes

## Code Style Guidelines

### TypeScript
- Use ES modules (import/export) syntax, not CommonJS (require)
- Always define explicit types for function parameters and return values
- Use interfaces for object shapes, types for unions/intersections
- Destructure imports when possible (e.g., `import { foo } from 'bar'`)

### React/Next.js
- Use functional components with TypeScript
- Prefer named exports for components
- Use async/await for API calls, not .then()
- API routes should return proper HTTP status codes and JSON responses

### Error Handling
- Always include error handling in API routes
- Return descriptive error messages with appropriate status codes
- Log errors with context (file, function, line if available)

### Naming Conventions
- Components: PascalCase (e.g., `UsageStatsTable`)
- Files: kebab-case (e.g., `usage-stats-table.tsx`)
- Functions/variables: camelCase (e.g., `trackFunction`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_POLL_INTERVAL`)

## Testing

### Running Tests
- Tests are in the `instrument/tests/` directory
- Run `cd instrument && npm test` to run all tests
- Tests cover: babel plugin transformations, runtime tracking, uploads, edge cases

### Test Organization
- `babel-plugin.basic.test.ts` - Basic babel transformations
- `babel-plugin.classes.test.ts` - Class and method instrumentation
- `babel-plugin.edge-cases.test.ts` - Edge cases and error handling
- `babel-plugin.skip.test.ts` - Files/patterns that should skip instrumentation
- `runtime.*.test.ts` - Runtime tracking behavior

### Writing Tests
- Use descriptive test names that explain what's being tested
- Include both positive and negative test cases
- Mock external dependencies (fetch, timers, etc.)
- Test edge cases thoroughly

## Development Workflow

### Initial Setup
1. Install dependencies at root: `npm install`
2. Build instrumentation library: `cd instrument && npm install && npm run build`
3. Install platform deps: `cd ../platform && npm install`
4. Install exampleapp deps: `cd ../exampleapp && npm install`
5. Install agent deps: `cd ../agent && npm install`

### Full System Testing
1. Set up Vercel Blob token in `platform/.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
   ```
2. Start platform: `cd platform && npm run dev` (port 3001)
3. Start exampleapp: `cd exampleapp && npm run dev` (port 3000)
4. Use exampleapp (click around to generate usage data)
5. Wait 10 seconds for data to upload
6. View platform at http://localhost:3001
7. Optionally start agent: `cd agent && npm run dev`

### Making Changes

#### To Instrument Package
1. Make changes in `instrument/src/`
2. Run tests: `npm test`
3. Build: `npm run build`
4. If testing with exampleapp, rebuild exampleapp: `cd ../exampleapp && npm run build`

#### To Platform
1. Make changes in `platform/`
2. Platform will auto-reload in dev mode
3. Check browser console and terminal for errors

#### To Agent
1. Make changes in `agent/src/`
2. Agent will auto-reload in dev mode
3. Check terminal output for polling and execution logs

## Environment Variables

### Platform (platform/.env.local)
- `BLOB_READ_WRITE_TOKEN` - REQUIRED. Vercel Blob storage token for persisting usage data

### Agent (optional, has defaults)
- `PLATFORM_URL` - Platform URL (default: http://localhost:3001)
- `PROJECT_ID` - Project to monitor (default: exampleapp)
- `POLL_INTERVAL` - Polling interval in ms (default: 5000)
- `EXAMPLEAPP_PATH` - Path to exampleapp (default: ../exampleapp)
- `WORKSPACE_ROOT` - Path for git operations (default: ..)

### Instrumentation (configured in code, not env vars)
- See `instrument/src/types.ts` for `InstrumentationConfig` interface
- Usually configured in Next.js config via `withInstrumentation()`

## Prerequisites & Tools

### Required Tools
- Node.js 18+ (required for native fetch API)
- npm (package management)
- TypeScript 5+ (language)

### Recommended Tools
- `gh` CLI - GitHub CLI for creating PRs (required for agent)
- `cursor-agent` - Cursor's AI agent CLI (required for agent to function)
- `tsx` - TypeScript execution (used for dev scripts and agent)

### Checking Tool Installation
```bash
node --version    # Should be 18+
gh --version      # Required for agent
gh auth status    # Should be authenticated
cursor-agent --version  # Required for agent
```

## Important Notes

### Babel Plugin Behavior
- The babel plugin instruments ALL functions by default
- It SKIPS files in node_modules, .next, dist, and other build directories
- It injects `__trackFn(file, name, line)` calls at the start of each function
- Anonymous functions are tracked with name "anonymous"
- Class constructors are tracked with name "constructor"

### Data Flow
1. Instrumented app calls functions → Runtime tracks them in memory
2. Every 10 seconds → Runtime batches and POSTs to platform `/api/usage`
3. Platform aggregates data → Stores in Vercel Blob as JSON
4. Platform UI displays stats → User can select dead code to remove
5. Agent polls `/api/deletions` → Creates branch and uses cursor-agent to remove code
6. Agent creates PR → Developer reviews and merges

### Platform Storage Structure
- `projects/index.json` - List of all projects with metadata
- `projects/{projectId}/usage.json` - Function usage data for each project
- `projects/{projectId}/deletions.json` - Pending deletion requests

### Common Issues
- **"No projects appearing"** - Check that exampleapp is running and wait 10 seconds for first upload
- **"Agent not finding deletions"** - Verify platform is running and deletion requests exist
- **"cursor-agent not found"** - Install cursor-agent and ensure it's in PATH
- **"GitHub auth error"** - Run `gh auth login` and authenticate
- **"BLOB_READ_WRITE_TOKEN missing"** - Platform requires this env var to persist data

## Debugging Tips

### Instrumentation Issues
- Add `debug: true` to instrumentation config to see tracking logs
- Check that functions are being instrumented: `cd instrument && npm test`
- Verify babel plugin is applied: check compiled .next output

### Platform Issues
- Check browser Network tab for failed API calls
- Check terminal for server errors
- Verify Vercel Blob token is valid and has read/write permissions

### Agent Issues
- Run agent with verbose logging to see cursor-agent output
- Check that platform URL is correct and accessible
- Verify exampleapp path is correct
- Check git status - agent needs clean working directory

## Architecture Decisions

### Why Babel Plugin?
- Build-time instrumentation = zero runtime overhead for non-called functions
- Automatic = no manual tracking code needed
- Works with TypeScript via babel-typescript preset

### Why Vercel Blob?
- Simple key-value storage, no database needed for MVP
- Good enough for demo/prototype
- Can be replaced with PostgreSQL/MySQL later

### Why In-Memory for Exampleapp?
- Demo purposes, no need for real persistence
- Simplifies setup (no database required)
- Shows that the instrumentation works regardless of backend

### Why Polling Agent?
- Simple, no webhooks or event bus needed
- Easy to debug and monitor
- Can be upgraded to push-based later

## Future Improvements

- Add authentication to platform
- Replace Blob storage with PostgreSQL
- Make agent push-based instead of polling
- Add historical usage trends
- Support multiple languages beyond TypeScript/JavaScript
- Add configurable dead code thresholds
- Support monorepos with multiple instrumented packages

## Getting Help

- Check README.md files in each subdirectory for detailed docs
- See `API_DOCUMENTATION.md` in exampleapp for API reference
- See `IMPLEMENTATION_STATUS.md` in instrument for implementation details
- See test files for usage examples

## IMPORTANT: When Making Changes

1. **Always run tests** after modifying instrument package
2. **Rebuild instrument** before testing changes in exampleapp
3. **Check both terminals** when running platform + exampleapp
4. **Wait 10 seconds** after interactions before checking platform (upload interval)
5. **Review agent logs** to see what cursor-agent is doing
6. **Don't commit** the agent's branches - they're meant for PR creation

## Repository Etiquette

- Keep commits focused and atomic
- Write descriptive commit messages
- Don't commit node_modules or build artifacts (.next, dist)
- Don't commit .env.local files (sensitive tokens)
- Run linters before committing
- Add tests for new features in instrument package
- Update relevant README when adding features

