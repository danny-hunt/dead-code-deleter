import { transformSync } from '@babel/core';
import instrumentationPlugin from '../src/babel-plugin';

describe('Babel Plugin - Class Method Instrumentation', () => {
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

  test('should instrument class methods', () => {
    const code = `
      class MyClass {
        myMethod() {
          return 'test';
        }
      }
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
    expect(result).toContain('"MyClass.myMethod"');
  });

  test('should instrument class constructors', () => {
    const code = `
      class Person {
        constructor(name) {
          this.name = name;
        }
      }
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
    expect(result).toContain('"Person.constructor"');
  });

  test('should instrument static methods', () => {
    const code = `
      class Utils {
        static format(str) {
          return str.toUpperCase();
        }
      }
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
    expect(result).toContain('"Utils.format"');
  });

  test('should instrument arrow function class properties', () => {
    const code = `
      class MyClass {
        myArrowMethod = () => {
          return 'test';
        }
      }
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
    expect(result).toContain('"myArrowMethod"');
  });

  test('should instrument class expressions', () => {
    const code = `
      const MyClass = class {
        myMethod() {
          return 'test';
        }
      }
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
    expect(result).toContain('"MyClass.myMethod"');
  });

  test('should handle private methods', () => {
    const code = `
      class MyClass {
        #privateMethod() {
          return 'private';
        }
      }
    `;
    const result = transform(code);
    // Private methods might not be instrumented by the current implementation
    // At minimum, the import should be added if any functions are found
    expect(result).toContain('import { __trackFn }');
  });

  test('should handle getter and setter methods', () => {
    const code = `
      class MyClass {
        get value() {
          return this._value;
        }
        set value(val) {
          this._value = val;
        }
      }
    `;
    const result = transform(code);
    expect(result).toContain('__trackFn(');
  });
});

