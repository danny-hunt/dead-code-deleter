import { transformSync } from "@babel/core";
import instrumentationPlugin from "../src/babel-plugin";

describe("Babel Plugin - Edge Cases", () => {
  function transform(code: string, filename = "/test/sample.ts") {
    const result = transformSync(code, {
      filename,
      plugins: [instrumentationPlugin],
      parserOpts: {
        sourceType: "module",
      },
    });
    return result?.code || "";
  }

  test("should handle anonymous functions", () => {
    const code = `
      setTimeout(function() {
        console.log('test');
      }, 1000);
    `;
    const result = transform(code);
    expect(result).toContain("__trackFn(");
    expect(result).toContain('"anonymous"');
  });

  test("should handle object method shorthand", () => {
    const code = `
      const obj = {
        myMethod() {
          return 'test';
        }
      };
    `;
    const result = transform(code);
    // Object methods are function expressions, should be instrumented
    // They might be transformed to regular functions or stay as shorthand
    expect(result).toContain("import { __trackFn }");
  });

  test("should handle exported functions", () => {
    const code = `
      export function exportedFunc() {
        return 'exported';
      }
    `;
    const result = transform(code);
    expect(result).toContain("__trackFn(");
    expect(result).toContain('"exportedFunc"');
  });

  test("should handle default export functions", () => {
    const code = `
      export default function() {
        return 'default';
      }
    `;
    const result = transform(code);
    expect(result).toContain("__trackFn(");
    // Default exports without a name might be treated as anonymous
    // The actual name depends on the getFunctionName implementation
  });

  test("should handle async functions", () => {
    const code = `
      async function fetchData() {
        return await fetch('/api/data');
      }
    `;
    const result = transform(code);
    expect(result).toContain("__trackFn(");
    expect(result).toContain('"fetchData"');
  });

  test("should handle generator functions", () => {
    const code = `
      function* myGenerator() {
        yield 1;
        yield 2;
      }
    `;
    const result = transform(code);
    expect(result).toContain("__trackFn(");
    expect(result).toContain('"myGenerator"');
  });

  test("should handle async arrow functions", () => {
    const code = `
      const fetchData = async () => {
        return await fetch('/api/data');
      };
    `;
    const result = transform(code);
    expect(result).toContain("__trackFn(");
    expect(result).toContain('"fetchData"');
  });

  test("should handle nested functions", () => {
    const code = `
      function outer() {
        function inner() {
          return 'nested';
        }
        return inner();
      }
    `;
    const result = transform(code);
    expect(result).toContain('"outer"');
    expect(result).toContain('"inner"');
    const trackCalls = (result.match(/__trackFn\(/g) || []).length;
    expect(trackCalls).toBe(2);
  });

  test("should handle IIFE (Immediately Invoked Function Expression)", () => {
    const code = `
      (function() {
        console.log('IIFE');
      })();
    `;
    const result = transform(code);
    expect(result).toContain("__trackFn(");
  });

  test("should handle callbacks", () => {
    const code = `
      [1, 2, 3].map(function(n) {
        return n * 2;
      });
    `;
    const result = transform(code);
    expect(result).toContain("__trackFn(");
  });

  test("should preserve function parameters", () => {
    const code = `
      function add(a, b) {
        return a + b;
      }
    `;
    const result = transform(code);
    expect(result).toContain("function add(a, b)");
  });

  test("should preserve return statements", () => {
    const code = `
      function getValue() {
        return 42;
      }
    `;
    const result = transform(code);
    expect(result).toContain("return 42");
  });
});
