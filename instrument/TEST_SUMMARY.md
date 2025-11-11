# Test Suite Summary

## Overview

Created a comprehensive Jest test suite for the `@dead-code-deleter/instrument` package with **83 tests** across **10 test files**.

## Test Results

✅ **All 83 tests passing**

### Coverage Summary

| File             | Statements | Branches | Functions | Lines   |
|------------------|------------|----------|-----------|---------|
| babel-plugin.ts  | 84.88%     | 80.82%   | 100%      | 86.58%  |
| runtime.ts       | 75.75%     | 80%      | 58.33%    | 76.19%  |
| next.ts          | 48.64%     | 53.84%   | 57.14%    | 48.64%  |
| **Overall**      | **74.6%**  | **75.19%**| **77.14%**| **75.27%**|

## Test Files

### 1. `babel-plugin.basic.test.ts` (7 tests)
Tests basic function instrumentation:
- Import statement injection
- Named function declarations
- Arrow functions
- Function expressions
- Expression body conversion
- Import deduplication
- Already instrumented function detection

### 2. `babel-plugin.classes.test.ts` (7 tests)
Tests class-related instrumentation:
- Class methods
- Constructors
- Static methods
- Arrow function class properties
- Class expressions
- Private methods
- Getters and setters

### 3. `babel-plugin.skip.test.ts` (8 tests)
Tests skip conditions:
- node_modules exclusion
- .next directory exclusion
- dist directory exclusion
- instrument directory exclusion
- Files defining `__trackFn`
- Regular files not skipped
- Self-instrumentation prevention

### 4. `babel-plugin.edge-cases.test.ts` (12 tests)
Tests edge cases:
- Anonymous functions
- Object method shorthand
- Exported functions
- Default exports
- Async functions
- Generator functions
- Async arrow functions
- Nested functions
- IIFE (Immediately Invoked Function Expressions)
- Callbacks
- Parameter preservation
- Return statement preservation

### 5. `runtime.tracking.test.ts` (8 tests)
Tests function tracking:
- Function call tracking
- Multiple call accumulation
- Different function tracking
- Enable/disable functionality
- Default configuration
- Custom project ID
- NEXT_PUBLIC_ environment variables

### 6. `runtime.upload.test.ts` (9 tests)
Tests data upload:
- Upload on flush
- Tracker clearing after upload
- No upload without platform URL
- No upload without data
- Upload error handling
- Network error handling
- Timestamp inclusion

### 7. `runtime.config.test.ts` (14 tests)
Tests configuration:
- Default configuration
- Platform URL from env
- Project ID from env
- NEXT_PUBLIC_ prefix handling
- Upload interval configuration
- Invalid upload interval handling
- Enabled/disabled flag
- Debug mode configuration

### 8. `next.config.test.ts` (11 tests)
Tests Next.js configuration wrapper:
- `withInstrumentation()` HOF
- Environment variable configuration
- Default values
- Config merging
- Webpack configuration preservation
- Webpack alias addition
- `createInstrumentedConfig()` helper

### 9. `types.test.ts` (8 tests)
Tests TypeScript type definitions:
- FunctionUsage type
- UsagePayload type
- InstrumentationConfig type (full and partial)
- NextConfig type
- DeletionQueueItem type
- DeletionsResponse type

### 10. `integration.test.ts` (9 tests)
Tests complete workflows:
- Babel plugin + runtime integration
- Multiple function tracking and upload
- Function behavior preservation after instrumentation
- Error handling in instrumented code
- Full workflow: instrument → execute → track → upload

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- babel-plugin.basic.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should instrument"
```

## Test Infrastructure

### Configuration
- **Test Framework**: Jest v29.5.0
- **TypeScript Support**: ts-jest v29.1.0
- **Test Environment**: Node.js
- **Timeout**: 10 seconds
- **Force Exit**: Enabled (handles setInterval cleanup)

### Mocking Strategy
- `fetch` - Mocked for upload tests
- `process.env` - Saved/restored for configuration tests
- `console.error` - Mocked to test error logging

### Test Isolation
Each test suite:
- Resets modules with `jest.resetModules()`
- Clears mocks with `jest.clearAllMocks()`
- Saves and restores environment variables
- Ensures no side effects between tests

## Uncovered Code

The remaining uncovered code consists primarily of:
1. **Browser-specific code** - `window.addEventListener` and `navigator.sendBeacon` (lines 157-182 in runtime.ts)
2. **Process cleanup handlers** - Commented out event handlers (lines 150-153 in runtime.ts)
3. **Webpack internals** - Complex webpack configuration injection (lines 8-47 in next.ts)
4. **Edge case paths** - Some rare conditional branches in the babel plugin

These areas are challenging to test in a Node.js environment or require complex webpack mocking.

## Notes

- All tests pass consistently
- Tests are isolated and can run in any order
- Mock implementations properly simulate real-world behavior
- Tests cover both happy paths and error scenarios
- Integration tests validate end-to-end workflows

