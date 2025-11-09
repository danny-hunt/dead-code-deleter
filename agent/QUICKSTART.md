# Quick Start Guide

Get the Dead Code Deleter Agent up and running in 5 minutes.

## Prerequisites Check

Before starting, verify you have the required tools:

```bash
# Check Node.js (need 18+)
node --version

# Check cursor-agent
cursor-agent --help

# Check GitHub CLI
gh --version

# Verify GitHub CLI authentication
gh auth status
```

If any are missing:
- **Node.js**: https://nodejs.org/
- **cursor-agent**: https://www.cursor.com
- **GitHub CLI**: https://cli.github.com/ (then run `gh auth login`)

## Step 1: Install Dependencies

```bash
cd agent
npm install
```

## Step 2: Configure (Optional)

Create a `.env` file if you need custom configuration:

```bash
cp .env.example .env
# Edit .env with your settings
```

Default configuration:
- Platform URL: `http://localhost:3001`
- Project ID: `exampleapp`
- Poll Interval: `5000ms` (5 seconds)

## Step 3: Start Required Services

Ensure the platform service is running:

```bash
# In another terminal
cd ../platform
npm run dev
```

Ensure the exampleapp is running and instrumented:

```bash
# In another terminal
cd ../exampleapp
npm run dev
```

## Step 4: Start the Agent

### Using the startup script (recommended):

```bash
./start.sh
```

### Or directly with npm:

```bash
npm run dev
```

## What Happens Next

1. The agent will start polling the platform every 5 seconds
2. When functions are queued for deletion (via the platform UI), the agent will:
   - Create a new git branch
   - Use cursor-agent to remove the functions and orphaned code
   - Commit the changes
   - Push to GitHub
   - Create a pull request

## Testing the Flow

### 1. Queue a deletion via the platform UI:

```bash
# Open the platform UI
open http://localhost:3000

# Select the exampleapp project
# Click "Queue for Deletion" on any dead code function
```

### 2. Watch the agent logs:

The agent will detect the deletion and process it:

```
[2025-11-09T10:30:05.100Z] Polling http://localhost:3001/api/deletions?projectId=exampleapp
Found 1 function(s) to delete
[2025-11-09T10:30:05.200Z] Processing 1 deletion(s)...
Creating branch: dead-code-removal-1699528205200
...
Pull request created: https://github.com/user/repo/pull/123
```

### 3. Review the PR:

The agent will create a PR with:
- Descriptive title and body
- List of removed functions
- Automated changes tag

## Troubleshooting

### "cursor-agent not found"

```bash
# Verify installation
which cursor-agent

# If not found, install cursor-agent
# Visit https://www.cursor.com for installation instructions
```

### "GitHub CLI not authenticated"

```bash
gh auth login
```

### "Failed to fetch deletions"

Check that the platform is running:

```bash
curl http://localhost:3001/api/deletions?projectId=exampleapp
```

Expected response:
```json
{"deletions": []}
```

### "No deletions found"

1. Verify the exampleapp is instrumented and running
2. Check that functions are actually queued in the platform UI
3. Verify PROJECT_ID matches (default: `exampleapp`)

## Stopping the Agent

Press `Ctrl+C` to stop the agent gracefully.

## Next Steps

- Review the [full README](README.md) for detailed documentation
- Customize the deletion prompt in `src/index.ts`
- Adjust polling interval via environment variables
- Set up monitoring for production use

## Production Deployment

For production use:

1. Build the agent:
   ```bash
   npm run build
   ```

2. Use a process manager (PM2, systemd, etc.):
   ```bash
   # Example with PM2
   npm install -g pm2
   pm2 start dist/index.js --name dead-code-agent
   pm2 save
   pm2 startup
   ```

3. Set up environment variables in your deployment system

4. Monitor the logs:
   ```bash
   pm2 logs dead-code-agent
   ```

