/**
 * Integration tests combining babel plugin and runtime
 */

import { transformSync } from "@babel/core";
import instrumentationPlugin from "../src/babel-plugin";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Integration Tests", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.DEAD_CODE_PLATFORM_URL = "http://localhost:3000/api/usage";
    process.env.DEAD_CODE_PROJECT_ID = "integration-test";
    process.env.DEAD_CODE_ENABLED = "true";

    jest.resetModules();
    jest.clearAllMocks();

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: jest.fn().mockResolvedValue(""),
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("should instrument and track function execution", () => {
    // Transform code with babel plugin
    const code = `
      function greet(name) {
        return 'Hello ' + name;
      }
    `;

    const result = transformSync(code, {
      filename: "/test/greet.ts",
      plugins: [instrumentationPlugin],
      parserOpts: {
        sourceType: "module",
      },
    });

    expect(result?.code).toContain("__trackFn(");
    expect(result?.code).toContain('"greet"');

    // Load runtime and execute instrumented code
    const { __trackFn, getStats } = require("../src/runtime");

    // Simulate the instrumented function being called
    __trackFn("/test/greet.ts", "greet", 2);

    const stats = getStats();
    expect(stats.trackedFunctions).toBe(1);
    expect(stats.totalCalls).toBe(1);
  });

  test("should track multiple function calls and upload", async () => {
    const { __trackFn, flush } = require("../src/runtime");

    // Simulate multiple instrumented functions being called
    __trackFn("/src/utils.ts", "formatDate", 5);
    __trackFn("/src/api.ts", "fetchUser", 10);
    __trackFn("/src/utils.ts", "formatDate", 5);
    __trackFn("/src/api.ts", "fetchPosts", 15);

    await flush();

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const callArgs = mockFetch.mock.calls[0];
    const payload = JSON.parse(callArgs[1].body);

    expect(payload.projectId).toBe("integration-test");
    expect(payload.functions).toHaveLength(3);

    // Find the formatDate function
    const formatDateFunc = payload.functions.find((f: any) => f.name === "formatDate");
    expect(formatDateFunc.callCount).toBe(2);
  });

  test("should preserve function behavior after instrumentation", () => {
    const code = `
      function add(a, b) {
        return a + b;
      }
      
      function multiply(x, y) {
        return x * y;
      }
    `;

    const result = transformSync(code, {
      filename: "/test/math.ts",
      plugins: [instrumentationPlugin],
      parserOpts: {
        sourceType: "module",
      },
    });

    // Verify the functions still have their logic
    expect(result?.code).toContain("return a + b");
    expect(result?.code).toContain("return x * y");
  });

  test("should handle errors in instrumented code gracefully", () => {
    const code = `
      function riskyFunction() {
        throw new Error('Something went wrong');
      }
    `;

    const result = transformSync(code, {
      filename: "/test/risky.ts",
      plugins: [instrumentationPlugin],
      parserOpts: {
        sourceType: "module",
      },
    });

    // Tracking call should be before the error
    expect(result?.code).toContain("__trackFn(");
    expect(result?.code).toContain("throw new Error");

    const { __trackFn } = require("../src/runtime");

    // Simulate the instrumented function being called before error
    expect(() => {
      __trackFn("/test/risky.ts", "riskyFunction", 2);
    }).not.toThrow();
  });

  test("full workflow: instrument -> execute -> track -> upload", async () => {
    // Step 1: Instrument code
    const code = `
      export function calculateTotal(items) {
        return items.reduce((sum, item) => sum + item.price, 0);
      }
    `;

    const transformed = transformSync(code, {
      filename: "/src/calculator.ts",
      plugins: [instrumentationPlugin],
      parserOpts: {
        sourceType: "module",
      },
    });

    expect(transformed?.code).toContain("__trackFn(");

    // Step 2: Load runtime
    const { __trackFn, flush, getStats } = require("../src/runtime");

    // Step 3: Simulate function execution
    __trackFn("/src/calculator.ts", "calculateTotal", 2);
    __trackFn("/src/calculator.ts", "calculateTotal", 2);
    __trackFn("/src/calculator.ts", "calculateTotal", 2);

    // Step 4: Verify tracking
    let stats = getStats();
    expect(stats.trackedFunctions).toBe(1);
    expect(stats.totalCalls).toBe(3);

    // Step 5: Upload data
    await flush();

    // Step 6: Verify upload
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/usage",
      expect.objectContaining({
        method: "POST",
      })
    );

    const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(payload.functions[0]).toMatchObject({
      file: "/src/calculator.ts",
      name: "calculateTotal",
      line: 2,
      callCount: 3,
    });

    // Step 7: Verify tracker was cleared
    stats = getStats();
    expect(stats.trackedFunctions).toBe(0);
  });
});
