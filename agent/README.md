# Dead Code Deleter Agent

An automated agent service that polls the dead-code-deleter platform for function deletion requests and executes them using cursor-agent.

## Overview

This agent:

1. Polls the platform's `/api/deletions` endpoint every 5 seconds
2. When deletion requests are found, uses `cursor-agent` to remove the functions and any orphaned functionality
3. Creates a pull request with the changes using the GitHub CLI

## Prerequisites

- Node.js 18 or higher
- [cursor-agent](https://www.cursor.com) installed and available in your PATH
- [GitHub CLI (gh)](https://cli.github.com/) installed and authenticated
- Platform service running (typically on http://localhost:3001)
- Exampleapp instrumented and reporting to the platform

## Installation

```bash
cd agent
npm install
```

## Configuration

The agent can be configured using environment variables:

- `PLATFORM_URL` - URL of the platform service (default: `http://localhost:3001`)
- `PROJECT_ID` - Project ID to poll for deletions (default: `exampleapp`)
- `POLL_INTERVAL` - Polling interval in milliseconds (default: `5000`)
- `EXAMPLEAPP_PATH` - Path to the exampleapp directory (default: `../exampleapp`)
- `WORKSPACE_ROOT` - Path to the workspace root for git operations (default: `..`)

## Usage

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

Build the TypeScript code:

```bash
npm run build
```

Run the built agent:

```bash
npm start
```

### With Custom Configuration

```bash
PLATFORM_URL=http://localhost:3001 \
PROJECT_ID=exampleapp \
POLL_INTERVAL=10000 \
npm run dev
```

## How It Works

### 1. Polling

The agent continuously polls the platform's deletions endpoint:

```
GET /api/deletions?projectId=exampleapp
```

### 2. Processing Deletions

When deletions are found, the agent:

1. Creates a new Git branch: `dead-code-removal-{timestamp}`
2. Generates a detailed prompt for cursor-agent with:
   - List of functions to delete
   - Instructions to remove orphaned code
   - Verification requirements
3. Executes `cursor-agent --print` with the prompt
4. Commits the changes with a descriptive message
5. Pushes the branch to the remote repository

### 3. Creating Pull Requests

The agent uses the GitHub CLI to create a PR with:

- Descriptive title listing the removed functions
- Detailed body explaining what was removed and why
- Automatic labeling as an automated change

## Example Output

```
[2025-11-09T10:30:00.000Z] Dead Code Deleter Agent started
Platform URL: http://localhost:3001
Project ID: exampleapp
Poll Interval: 5000ms

[2025-11-09T10:30:00.100Z] Polling http://localhost:3001/api/deletions?projectId=exampleapp
[2025-11-09T10:30:00.150Z] No deletions found, continuing to poll...

[2025-11-09T10:30:05.100Z] Polling http://localhost:3001/api/deletions?projectId=exampleapp
Found 2 function(s) to delete
[2025-11-09T10:30:05.200Z] Processing 2 deletion(s)...

Creating branch: dead-code-removal-1699528205200
Executing cursor-agent...
[cursor-agent output...]

Committing changes...
Pushing branch to remote...
Creating pull request...
Pull request created: https://github.com/user/repo/pull/123

[2025-11-09T10:30:45.000Z] Successfully processed deletions and created PR
```

## Error Handling

The agent includes robust error handling:

- **Network errors**: Logged and the agent continues polling
- **cursor-agent failures**: Error details are captured and logged
- **Git/GitHub errors**: Agent attempts to return to main branch
- **Process errors**: Fatal errors exit with code 1

## Security Considerations

- The agent requires GitHub CLI authentication (`gh auth login`)
- Ensure you're authenticated with the correct GitHub account
- Review PRs before merging to ensure correct deletions
- The agent only operates on the configured project directory

## Monitoring

Monitor the agent's output for:

- Successful polls (should occur every 5 seconds)
- Deletion processing events
- Error messages
- PR creation confirmations

## Troubleshooting

### cursor-agent not found

Ensure cursor-agent is installed and in your PATH:

```bash
which cursor-agent
```

### GitHub CLI not authenticated

Run:

```bash
gh auth login
```

### Platform not responding

Check that the platform service is running:

```bash
cd ../platform
npm run dev
```

### No deletions being processed

Verify that:

1. The exampleapp is instrumented and running
2. Functions have been marked for deletion via the platform UI
3. The PROJECT_ID matches the configured project

## Development

The agent is written in TypeScript and uses:

- Native Node.js `child_process` for spawning cursor-agent
- Native `fetch` for API calls (Node.js 18+)
- Native `exec` for Git/GitHub CLI commands

To modify the agent behavior:

1. Edit `src/index.ts`
2. Run `npm run dev` to test changes
3. Build with `npm run build` when ready for production

## License

MIT
