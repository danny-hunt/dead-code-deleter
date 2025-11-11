import { transformSync } from '@babel/core';
import instrumentationPlugin from '../src/babel-plugin';

describe('Babel Plugin - Basic Function Instrumentation', () => {
  function transform(code: string, filename = '/test/sample.ts') {
    const result = transformSync(code, {
      filename,
      plugins: [instrumentationPlugin],
      parserOpts: {
        sourceType: 'module',
      },
    });
    return result?.code || '';
  }

  test('should add import statement for __trackFn', () => {
    const code = `
      function myFunction() {
        return 'hello';
      }
    `;
    const result = transform(code);
    expect(result).toContain('import { __trackFn } from "@dead-code-deleter/instrument";');
  });

  test('should instrument named function declarations', () => {
    const code = `
      function greet(name) {
        return 'Hello ' + name;
      }
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
    expect(result).toContain('"greet"');
  });

  test('should instrument arrow functions with names', () => {
    const code = `
      const myArrowFunc = () => {
        return 42;
      };
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
    expect(result).toContain('"myArrowFunc"');
  });

  test('should instrument function expressions', () => {
    const code = `
      const myFunc = function() {
        return 'test';
      };
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
    expect(result).toContain('"myFunc"');
  });

  test('should convert arrow function expression bodies to block statements', () => {
    const code = `
      const add = (a, b) => a + b;
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
    expect(result).toContain('return a + b');
  });

  test('should not duplicate imports if already present', () => {
    const code = `
      import { __trackFn } from "@dead-code-deleter/instrument";
      function myFunction() {
        return 'hello';
      }
    `;
    const result = transform(code);
    const importCount = (result.match(/import.*__trackFn/g) || []).length;
    expect(importCount).toBe(1);
  });

  test('should not instrument already instrumented functions', () => {
    const code = `
      function myFunction() {
        __trackFn('/test/sample.ts', 'myFunction', 2);
        return 'hello';
      }
    `;
    const result = transform(code);
    const trackCount = (result.match(/__trackFn/g) || []).length;
    // Should have import + existing call, not duplicate
    expect(trackCount).toBeLessThanOrEqual(2);
  });
});

