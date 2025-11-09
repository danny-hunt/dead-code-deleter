<!-- 378e48dc-1d31-4a5d-8ed4-882d74eccc93 20e84a3c-4779-47ab-ba48-e46ea54cf3a0 -->
# NextJS TypeScript Instrumentation Library

## Overview

Create a zero-config instrumentation library that instruments TypeScript code at build-time using a Babel plugin, with automatic runtime collection and upload of function usage data.

## User Setup (Target Experience)

Users will only need to:

1. Install the package:
```bash
npm install @dead-code-deleter/instrument
```

2. Add one line to `next.config.js`:
```javascript
const withInstrumentation = require('@dead-code-deleter/instrument/next');

module.exports = withInstrumentation({
  platformUrl: 'https://your-platform.com/api/usage'
});
```


That's it! The instrumentation will automatically work for both frontend and backend code.

## Implementation Structure

### 1. Babel Transformer Plugin (`src/babel-plugin.ts`)

- Visits all function declarations, arrow functions, and class methods
- Injects a tracking call at the start of each function: `__trackFn('filename', 'functionName', lineNumber)`
- Skips node_modules and instrumentation library itself
- Handles edge cases (anonymous functions, async functions, generators)

### 2. Runtime Collector (`src/runtime.ts`)

- Provides the `__trackFn()` function that gets injected
- Maintains an in-memory Map of function calls: `{ 'file:function:line': callCount }`
- Batches data and uploads every 10 seconds
- Uses `fetch` (works in both Node.js 18+ and browser)
- Auto-initializes on import, no user action needed

### 3. Next.js Plugin (`src/next.ts`)

- Wraps user's Next.js config
- Injects the Babel plugin into both server and client webpack configs
- Auto-imports the runtime collector globally
- Passes platform URL as environment variable

### 4. Package Structure

```
instrument/
├── package.json
├── tsconfig.json
├── src/
│   ├── babel-plugin.ts      # AST transformer
│   ├── runtime.ts            # Data collector & uploader
│   ├── next.ts               # Next.js config wrapper
│   └── types.ts              # TypeScript definitions
└── dist/                     # Compiled output
```

## Key Technical Decisions

**Why Babel over SWC?** While Next.js uses SWC by default, Babel plugins are more stable and easier to implement. Next.js still supports Babel when `.babelrc` is present.

**Why build-time over runtime?** Much better performance and coverage - every function is automatically instrumented without manual wrapping.

**Data format uploaded:**

```typescript
{
  projectId: string,
  timestamp: number,
  functions: [
    { file: string, name: string, line: number, callCount: number }
  ]
}
```

## Example Output

When a user runs their NextJS app, the instrumentation will automatically track calls like:

- `pages/api/users.ts:getUsers:5` - called 23 times
- `components/Header.tsx:Header:12` - called 45 times
- `lib/utils.ts:formatDate:8` - called 0 times (dead code!)

The data uploads silently in the background without impacting app performance.

### To-dos

- [ ] Initialize package.json with TypeScript, Babel dependencies, and build configuration
- [ ] Implement Babel transformer plugin to inject tracking calls into all functions
- [ ] Build runtime collector that batches function calls and uploads to platform every 10s
- [ ] Create Next.js config wrapper that integrates the Babel plugin seamlessly
- [ ] Set up example app demonstrating the instrumentation in action