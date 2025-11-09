# @dead-code-deleter/instrument

Automatic TypeScript/JavaScript function usage tracking for dead code detection in Next.js applications.

## Features

- 🔄 **Zero-config** - Just wrap your Next.js config and you're done
- 🎯 **Automatic instrumentation** - All functions tracked at build-time via Babel
- 📊 **Lightweight tracking** - Only tracks call counts, not arguments or return values
- ⚡ **Performance optimized** - Minimal runtime overhead
- 🌐 **Full Next.js support** - Works for both server and client code
- 📤 **Batch uploads** - Sends usage data every 10 seconds

## Installation

```bash
npm install @dead-code-deleter/instrument
```

## Quick Start

### For Next.js with TypeScript config

Wrap your `next.config.ts`:

```typescript
import withInstrumentation from "@dead-code-deleter/instrument/next";

export default withInstrumentation({
  platformUrl: "https://your-platform.com/api/usage",
  projectId: "my-project",
})();
```

### For Next.js with JavaScript config

Wrap your `next.config.js`:

```javascript
const withInstrumentation = require("@dead-code-deleter/instrument/next");

module.exports = withInstrumentation({
  platformUrl: "https://your-platform.com/api/usage",
  projectId: "my-project",
})();
```

### If you have existing Next.js config

```typescript
import withInstrumentation from "@dead-code-deleter/instrument/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // your existing config
  reactStrictMode: true,
  // ... other options
};

export default withInstrumentation({
  platformUrl: "https://your-platform.com/api/usage",
  projectId: "my-project",
})(nextConfig);
```

## Configuration Options

```typescript
interface InstrumentationConfig {
  platformUrl?: string; // URL to send usage data to
  projectId?: string; // Project identifier (default: 'default')
  uploadInterval?: number; // Upload interval in ms (default: 10000)
  enabled?: boolean; // Enable/disable instrumentation (default: true)
  debug?: boolean; // Enable debug logging (default: false)
}
```

## What Gets Tracked

The instrumentation automatically tracks:

- ✅ Function declarations
- ✅ Arrow functions
- ✅ Class methods
- ✅ React components
- ✅ API route handlers
- ✅ Anonymous functions (labeled as "anonymous")

For each function call, it tracks:

- Function name
- File path
- Line number
- Call count since last upload

## Data Format

Data is uploaded in the following format:

```typescript
{
  projectId: "my-project",
  timestamp: 1699564800000,
  functions: [
    {
      file: "/path/to/file.ts",
      name: "myFunction",
      line: 42,
      callCount: 15
    },
    // ... more functions
  ]
}
```

## Environment Variables

You can also configure via environment variables:

```bash
DEAD_CODE_PLATFORM_URL=https://your-platform.com/api/usage
DEAD_CODE_PROJECT_ID=my-project
DEAD_CODE_UPLOAD_INTERVAL=10000
DEAD_CODE_ENABLED=true
DEAD_CODE_DEBUG=false
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run watch
```

## How It Works

1. **Build-time transformation**: A Babel plugin instruments your code by injecting `__trackFn()` calls at the start of each function
2. **Runtime collection**: The runtime collector maintains a map of function calls in memory
3. **Periodic upload**: Every 10 seconds, accumulated data is sent to your platform
4. **Clean shutdown**: On process exit (Node.js) or page unload (browser), remaining data is uploaded

## Performance Impact

- **Build time**: Minimal increase (Babel transformation)
- **Runtime**: ~1-2μs per function call overhead
- **Memory**: ~100 bytes per unique function
- **Network**: One HTTP request every 10 seconds with batched data

## License

MIT
