# Function Analysis Script

This script performs static analysis on the exampleapp codebase to extract all functions and track contributors using git blame.

## Usage

From the root directory:

```bash
npm run analyze
```

This will:
1. Scan all TypeScript/JavaScript files in `exampleapp/`
2. Extract function declarations, arrow functions, class methods, and React components
3. Run git blame on each function to get all contributors
4. Generate `exampleapp/function-metadata.json`

## Output

The script generates `exampleapp/function-metadata.json` with the following structure:

```json
{
  "projectId": "example-app",
  "analyzedAt": 1699564800000,
  "functions": [
    {
      "file": "lib/hooks.ts",
      "name": "useMeetings",
      "line": 15,
      "contributors": [
        { "name": "John Doe", "email": "john@example.com" },
        { "name": "Jane Smith", "email": "jane@example.com" }
      ]
    }
  ]
}
```

## Uploading to Platform

After generating the metadata file, you can upload it to the platform:

### Option 1: Using the upload script (recommended)

```bash
npm run upload-metadata
```

Set `PLATFORM_URL` environment variable if your platform is not at `http://localhost:3001`:
```bash
PLATFORM_URL=http://localhost:3001 npm run upload-metadata
```

### Option 2: Using curl

```bash
curl -X POST http://localhost:3001/api/projects/example-app/metadata \
  -H "Content-Type: application/json" \
  -d @exampleapp/function-metadata.json
```

### Option 3: Using any HTTP client

POST the JSON file to:
- Development: `http://localhost:3001/api/projects/{projectId}/metadata`
- Production: `https://your-platform.com/api/projects/{projectId}/metadata`

**Important:** The metadata must be uploaded to the platform for it to display all functions and contributors. Without metadata, the platform only shows functions that have been called at runtime.

## Requirements

- Node.js 18+
- TypeScript installed (as dev dependency)
- Git repository with commit history
- The exampleapp directory must be within a git repository

## Exclusions

The script uses the same exclusions as the Babel plugin:
- `node_modules/`
- `.next/`
- `dist/`
- `instrument/`
- Files that define `__trackFn`

