# Dead Code Deleter Agent - Implementation Summary

## Overview

This directory contains a standalone TypeScript Node.js service that automates the deletion of dead code identified by the platform.

## Architecture

```
agent/
├── src/
│   └── index.ts          # Main agent service
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── start.sh             # Startup script with checks
├── README.md            # Comprehensive documentation
├── QUICKSTART.md        # Quick start guide
└── IMPLEMENTATION.md    # This file
```

## Core Components

### 1. Polling Service (`fetchDeletions`)

- Polls `GET /api/deletions?projectId=exampleapp` every 5 seconds
- Returns list of `DeletionQueueItem[]`
- Handles network errors gracefully

### 2. Deletion Processor (`processDeletions`)

Orchestrates the entire deletion workflow:

1. **Branch Creation** - Creates `dead-code-removal-{timestamp}`
2. **Prompt Generation** - Generates detailed instructions for cursor-agent
3. **Agent Execution** - Calls `cursor-agent --print {prompt}`
4. **Change Commitment** - Stages and commits with descriptive message
5. **PR Creation** - Uses `gh pr create` to open a pull request

### 3. Cursor Agent Integration (`executeCursorAgent`)

- Spawns cursor-agent as a child process
- Streams output to console in real-time
- Captures both stdout and stderr
- Handles process errors and exit codes

### 4. GitHub Integration

- **Branch Management** - Creates branches via `git checkout -b`
- **Commits** - Stages all changes and commits with detailed message
- **Push** - Pushes branch to origin
- **PR Creation** - Uses GitHub CLI to create pull request with:
  - Descriptive title
  - Detailed body with function list
  - Automatic labeling

## Data Flow

```
Platform (deletions API)
         ↓
    [Poll every 5s]
         ↓
  Agent receives DeletionQueueItem[]
         ↓
   Generate prompt
         ↓
  cursor-agent --print
         ↓
   Git operations
         ↓
   GitHub PR creation
         ↓
    PR ready for review
```

## Types

### DeletionQueueItem
```typescript
{
  projectId: string;     // e.g., "exampleapp"
  file: string;          // e.g., "app/api/analytics/route.ts"
  name: string;          // e.g., "handleAnalytics"
  line: number;          // e.g., 42
  queuedAt: number;      // Unix timestamp
}
```

### DeletionsResponse
```typescript
{
  deletions: DeletionQueueItem[];
}
```

## Environment Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PLATFORM_URL` | `http://localhost:3001` | Platform API URL |
| `PROJECT_ID` | `exampleapp` | Project to monitor |
| `POLL_INTERVAL` | `5000` | Polling interval (ms) |
| `EXAMPLEAPP_PATH` | `../exampleapp` | Path to exampleapp |
| `WORKSPACE_ROOT` | `..` | Git workspace root |

## Dependencies

### Production
- `node-fetch@^3.3.2` - HTTP client (built into Node.js 18+)

### Development
- `typescript@^5.3.3` - TypeScript compiler
- `tsx@^4.7.0` - TypeScript execution and watch mode
- `@types/node@^20.10.0` - Node.js type definitions

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `tsc` | Compile TypeScript to JavaScript |
| `start` | `node dist/index.js` | Run compiled agent |
| `dev` | `tsx src/index.ts` | Run with auto-reload |
| `watch` | `tsx watch src/index.ts` | Run with file watching |

## Error Handling

### Network Errors
- Logged and polling continues
- No crash on temporary network issues

### Cursor Agent Failures
- Full error details captured
- Process returns to main branch
- Error logged with context

### Git/GitHub Errors
- Attempts to restore clean state
- Detailed error messages
- Process cleanup on failure

### Fatal Errors
- Exit with code 1
- Full error stack trace
- Appropriate logging

## Prompt Engineering

The agent generates sophisticated prompts for cursor-agent:

```typescript
`Please remove the following dead code functions from the exampleapp/ directory 
and any orphaned functionality that becomes unused as a result:

  - functionName in file/path.ts (line 42)

Instructions:
1. Delete each of the listed functions
2. Remove any imports, types, or helper functions that are only used by these deleted functions
3. Clean up any unused variables or constants
4. Remove any routes or API endpoints that only exist to call these functions
5. Update any documentation that references these functions
6. Ensure the code still compiles and all remaining functionality works correctly`
```

This prompt:
- Clearly identifies functions to delete
- Provides cleanup instructions
- Ensures compilation verification
- Guides cursor-agent to handle orphaned code

## Integration Points

### With Platform
- **Endpoint**: `GET /api/deletions?projectId={projectId}`
- **Dequeues**: Removes items from queue after fetching
- **Idempotent**: Safe to call repeatedly

### With Exampleapp
- **Target**: Functions in `exampleapp/` directory
- **Scope**: All subdirectories (app/, components/, lib/)
- **Verification**: Ensures app builds after changes

### With Cursor Agent
- **Command**: `cursor-agent --print {prompt}`
- **Working Directory**: Workspace root
- **Output**: Real-time streaming to console

### With GitHub
- **CLI**: `gh pr create`
- **Authentication**: Requires `gh auth login`
- **Remote**: Pushes to `origin` remote

## Monitoring & Observability

### Logs

All actions are logged with timestamps:

```
[2025-11-09T10:30:00.000Z] Polling http://localhost:3001/api/deletions?projectId=exampleapp
[2025-11-09T10:30:00.150Z] No deletions found, continuing to poll...
[2025-11-09T10:30:05.100Z] Processing 2 deletion(s)...
```

### Key Events
- Polling attempts
- Deletions found
- Branch creation
- Cursor agent execution
- Commit creation
- PR creation
- Errors

### Metrics to Monitor
- Poll frequency
- Deletion processing time
- Success/failure rate
- PR creation rate
- Error frequency

## Security Considerations

1. **GitHub Authentication**
   - Requires `gh auth` with appropriate repo permissions
   - Uses user's GitHub credentials
   - PRs created under authenticated user

2. **File Access**
   - Only operates within configured workspace
   - No arbitrary file system access
   - Limited to git-tracked files

3. **Code Execution**
   - Cursor agent executes in sandboxed environment
   - Changes are committed to branch (not main)
   - PRs require review before merge

4. **API Access**
   - Platform API calls are read-only
   - Dequeue operation is atomic
   - No authentication required (local development)

## Testing Strategy

### Manual Testing
1. Start platform service
2. Start exampleapp with instrumentation
3. Queue functions for deletion via platform UI
4. Observe agent processing and PR creation

### Integration Testing
1. Mock platform API responses
2. Verify branch creation
3. Test cursor-agent integration
4. Validate PR creation

### Error Testing
1. Test with invalid project ID
2. Test with platform down
3. Test with cursor-agent failure
4. Test with GitHub CLI not authenticated

## Future Enhancements

### Potential Improvements
1. **Batch Processing** - Process multiple batches in parallel
2. **Retry Logic** - Exponential backoff for transient failures
3. **Health Checks** - Expose health endpoint for monitoring
4. **Metrics** - Prometheus/StatsD integration
5. **Notifications** - Slack/email notifications on PR creation
6. **Dry Run Mode** - Preview changes without committing
7. **Custom Prompts** - Configurable cursor-agent prompts
8. **Multi-Project** - Monitor multiple projects simultaneously
9. **Approval Flow** - Require approval before processing deletions
10. **Rollback** - Automatic rollback on build failure

### Production Readiness
- [ ] Add proper logging framework (Winston/Pino)
- [ ] Add health check endpoint
- [ ] Add metrics collection
- [ ] Add graceful shutdown handling
- [ ] Add Docker container support
- [ ] Add Kubernetes manifests
- [ ] Add CI/CD pipeline
- [ ] Add integration tests
- [ ] Add monitoring dashboards
- [ ] Add alerting rules

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
# Build
npm run build

# Run with process manager
pm2 start dist/index.js --name dead-code-agent
```

### Docker (Future)
```bash
docker build -t dead-code-agent .
docker run -e PLATFORM_URL=https://platform.example.com dead-code-agent
```

## Maintenance

### Logs
- Monitor for error patterns
- Track processing times
- Review PR creation success rate

### Updates
- Keep dependencies updated
- Update cursor-agent as new versions release
- Monitor for GitHub CLI changes

### Monitoring
- Set up alerts for repeated failures
- Track polling health
- Monitor PR merge rate

## Support

For issues or questions:
1. Check the [README](README.md) for troubleshooting
2. Review the [QUICKSTART](QUICKSTART.md) guide
3. Check logs for error details
4. Verify prerequisites (cursor-agent, gh CLI)

## License

MIT

