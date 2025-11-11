/**
 * Tests for runtime tracking functionality
 */

// Mock fetch before importing runtime
global.fetch = jest.fn();

describe("Runtime - Function Tracking", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };

    // Clear environment
    delete process.env.DEAD_CODE_PLATFORM_URL;
    delete process.env.DEAD_CODE_PROJECT_ID;
    delete process.env.DEAD_CODE_ENABLED;
    delete process.env.DEAD_CODE_DEBUG;

    // Clear module cache to get fresh runtime
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  test("should track function calls", () => {
    process.env.DEAD_CODE_ENABLED = "true";
    const { __trackFn, getStats } = require("../src/runtime");

    __trackFn("/test/file.ts", "myFunction", 10);

    const stats = getStats();
    expect(stats.trackedFunctions).toBe(1);
    expect(stats.totalCalls).toBe(1);
  });

  test("should accumulate multiple calls to same function", () => {
    process.env.DEAD_CODE_ENABLED = "true";
    const { __trackFn, getStats } = require("../src/runtime");

    __trackFn("/test/file.ts", "myFunction", 10);
    __trackFn("/test/file.ts", "myFunction", 10);
    __trackFn("/test/file.ts", "myFunction", 10);

    const stats = getStats();
    expect(stats.trackedFunctions).toBe(1);
    expect(stats.totalCalls).toBe(3);
  });

  test("should track different functions separately", () => {
    process.env.DEAD_CODE_ENABLED = "true";
    const { __trackFn, getStats } = require("../src/runtime");

    __trackFn("/test/file1.ts", "func1", 10);
    __trackFn("/test/file2.ts", "func2", 20);
    __trackFn("/test/file1.ts", "func3", 30);

    const stats = getStats();
    expect(stats.trackedFunctions).toBe(3);
    expect(stats.totalCalls).toBe(3);
  });

  test("should not track when disabled", () => {
    process.env.DEAD_CODE_ENABLED = "false";
    const { __trackFn, getStats } = require("../src/runtime");

    __trackFn("/test/file.ts", "myFunction", 10);

    const stats = getStats();
    expect(stats.trackedFunctions).toBe(0);
    expect(stats.totalCalls).toBe(0);
  });

  test("should track with default config", () => {
    // No env vars set, should use defaults
    const { __trackFn, getStats } = require("../src/runtime");

    __trackFn("/test/file.ts", "myFunction", 10);

    const stats = getStats();
    expect(stats.config.enabled).toBe(true);
    expect(stats.trackedFunctions).toBe(1);
  });

  test("should use custom project ID", () => {
    process.env.DEAD_CODE_PROJECT_ID = "my-custom-project";
    const { getStats } = require("../src/runtime");

    const stats = getStats();
    expect(stats.config.projectId).toBe("my-custom-project");
  });

  test("should use NEXT_PUBLIC_ prefixed env vars", () => {
    process.env.NEXT_PUBLIC_DEAD_CODE_PROJECT_ID = "public-project";
    const { getStats } = require("../src/runtime");

    const stats = getStats();
    expect(stats.config.projectId).toBe("public-project");
  });
});
