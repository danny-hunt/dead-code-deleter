# Instrumentation Tests

This directory contains comprehensive tests for the `@dead-code-deleter/instrument` package.

## Test Structure

Tests are organized into multiple files by functionality:

### Babel Plugin Tests

- **babel-plugin.basic.test.ts** - Tests basic function instrumentation

  - Import statement injection
  - Named function declarations
  - Arrow functions
  - Function expressions
  - Expression body conversion

- **babel-plugin.classes.test.ts** - Tests class-related instrumentation

  - Class methods
  - Constructors
  - Static methods
  - Arrow function class properties
  - Private methods
  - Getters and setters

- **babel-plugin.skip.test.ts** - Tests skip conditions

  - node_modules exclusion
  - .next directory exclusion
  - dist directory exclusion
  - instrument directory exclusion
  - Files defining \_\_trackFn
  - Self-instrumentation prevention

- **babel-plugin.edge-cases.test.ts** - Tests edge cases
  - Anonymous functions
  - Object method shorthand
  - Exported functions
  - Default exports
  - Async functions
  - Generator functions
  - Nested functions
  - IIFE (Immediately Invoked Function Expressions)
  - Callbacks

### Runtime Tests

- **runtime.tracking.test.ts** - Tests function tracking

  - Function call tracking
  - Call count accumulation
  - Multiple function tracking
  - Enable/disable functionality
  - Configuration defaults

- **runtime.upload.test.ts** - Tests data upload

  - Upload on flush
  - Tracker clearing after upload
  - Upload error handling
  - Network error handling
  - Timestamp inclusion

- **runtime.config.test.ts** - Tests configuration
  - Default configuration
  - Environment variable loading
  - NEXT*PUBLIC* prefix handling
  - Upload interval configuration
  - Debug mode configuration

### Integration Tests

- **integration.test.ts** - Tests complete workflows
  - Babel plugin + runtime integration
  - Multiple function tracking and upload
  - Function behavior preservation
  - Full workflow: instrument -> execute -> track -> upload

### Next.js Tests

- **next.config.test.ts** - Tests Next.js configuration wrapper
  - withInstrumentation HOF
  - Environment variable configuration
  - Webpack configuration
  - Config merging
  - createInstrumentedConfig helper

### Type Tests

- **types.test.ts** - Tests TypeScript type definitions
  - FunctionUsage type
  - UsagePayload type
  - InstrumentationConfig type
  - DeletionQueueItem type
  - DeletionsResponse type

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

## Coverage

The tests aim for high coverage of:

- Babel plugin transformation logic
- Runtime tracking and upload functionality
- Configuration handling
- Next.js integration
- Edge cases and error scenarios

## Mocking

Tests use Jest mocks for:

- `fetch` - Mocked for upload tests
- `process.env` - Saved and restored for configuration tests
- `console.error` - Mocked to test error logging

## Test Isolation

Each test suite:

- Resets modules with `jest.resetModules()` before each test
- Clears mocks with `jest.clearAllMocks()`
- Saves and restores environment variables
- Ensures no side effects between tests
