import { transformSync } from "@babel/core";
import instrumentationPlugin from "../src/babel-plugin";

describe("Babel Plugin - Skip Conditions", () => {
  function transform(code: string, filename: string) {
    const result = transformSync(code, {
      filename,
      plugins: [instrumentationPlugin],
      parserOpts: {
        sourceType: "module",
      },
    });
    return result?.code || "";
  }

  test("should skip files in node_modules", () => {
    const code = `
      function myFunction() {
        return 'hello';
      }
    `;
    const result = transform(code, "/project/node_modules/some-package/index.js");
    // Should not add import when skipped
    expect(result).not.toContain("import { __trackFn }");
  });

  test("should skip files in .next directory", () => {
    const code = `
      function myFunction() {
        return 'hello';
      }
    `;
    const result = transform(code, "/project/.next/server/pages/index.js");
    expect(result).not.toContain("import { __trackFn }");
  });

  test("should skip files in dist directory", () => {
    const code = `
      function myFunction() {
        return 'hello';
      }
    `;
    const result = transform(code, "/project/dist/index.js");
    expect(result).not.toContain("import { __trackFn }");
  });

  test("should skip files in instrument directory", () => {
    const code = `
      function myFunction() {
        return 'hello';
      }
    `;
    const result = transform(code, "/project/instrument/src/runtime.ts");
    expect(result).not.toContain("import { __trackFn }");
  });

  test("should skip files that define __trackFn", () => {
    const code = `
      export function __trackFn(file, name, line) {
        console.log('tracking');
      }
      
      function myFunction() {
        return 'hello';
      }
    `;
    const result = transform(code, "/test/runtime.ts");
    // Should not instrument the file
    expect(result).not.toContain("import");
  });

  test("should skip files with const __trackFn declaration", () => {
    const code = `
      const __trackFn = () => {};
      
      function myFunction() {
        return 'hello';
      }
    `;
    const result = transform(code, "/test/custom.ts");
    expect(result).not.toContain("import");
  });

  test("should not skip regular files", () => {
    const code = `
      function myFunction() {
        return 'hello';
      }
    `;
    const result = transform(code, "/project/src/utils.ts");
    expect(result).toContain("import { __trackFn }");
    expect(result).toContain("__trackFn(");
  });

  test("should not instrument __trackFn function itself", () => {
    const code = `
      function regularFunc() {
        return 'test';
      }
      
      function __trackFn() {
        return 'track';
      }
    `;
    const result = transform(code, "/test/sample.ts");
    // regularFunc should be instrumented, but __trackFn should not
    // Look for tracking calls in the body (not just the name)
    expect(result).toContain('__trackFn("/test/sample.ts", "regularFunc"');
    // __trackFn function should not call itself
    expect(result).not.toContain('__trackFn("/test/sample.ts", "__trackFn"');
  });
});
