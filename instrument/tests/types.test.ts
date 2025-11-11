/**
 * Tests for type definitions
 */

import {
  FunctionUsage,
  UsagePayload,
  InstrumentationConfig,
  NextConfig,
  DeletionQueueItem,
  DeletionsResponse,
} from '../src/types';

describe('Types - TypeScript Compilation', () => {
  test('FunctionUsage type should be valid', () => {
    const usage: FunctionUsage = {
      file: '/test/file.ts',
      name: 'myFunction',
      line: 10,
      callCount: 5,
    };

    expect(usage.file).toBe('/test/file.ts');
    expect(usage.name).toBe('myFunction');
    expect(usage.line).toBe(10);
    expect(usage.callCount).toBe(5);
  });

  test('UsagePayload type should be valid', () => {
    const payload: UsagePayload = {
      projectId: 'test-project',
      timestamp: Date.now(),
      functions: [
        {
          file: '/test/file.ts',
          name: 'func1',
          line: 10,
          callCount: 3,
        },
      ],
    };

    expect(payload.projectId).toBe('test-project');
    expect(payload.functions).toHaveLength(1);
    expect(typeof payload.timestamp).toBe('number');
  });

  test('InstrumentationConfig type should be valid', () => {
    const config: InstrumentationConfig = {
      platformUrl: 'http://example.com',
      projectId: 'test-project',
      uploadInterval: 5000,
      enabled: true,
      debug: false,
    };

    expect(config.platformUrl).toBe('http://example.com');
    expect(config.projectId).toBe('test-project');
    expect(config.uploadInterval).toBe(5000);
    expect(config.enabled).toBe(true);
    expect(config.debug).toBe(false);
  });

  test('InstrumentationConfig should allow partial config', () => {
    const config: InstrumentationConfig = {
      projectId: 'test-project',
    };

    expect(config.projectId).toBe('test-project');
    expect(config.platformUrl).toBeUndefined();
  });

  test('NextConfig type should be flexible', () => {
    const config: NextConfig = {
      reactStrictMode: true,
      customProperty: 'value',
      nested: {
        prop: 123,
      },
    };

    expect(config.reactStrictMode).toBe(true);
    expect(config.customProperty).toBe('value');
    expect(config.nested.prop).toBe(123);
  });

  test('DeletionQueueItem type should be valid', () => {
    const item: DeletionQueueItem = {
      projectId: 'test-project',
      file: '/test/file.ts',
      name: 'unusedFunction',
      line: 42,
      queuedAt: Date.now(),
    };

    expect(item.projectId).toBe('test-project');
    expect(item.file).toBe('/test/file.ts');
    expect(item.name).toBe('unusedFunction');
    expect(item.line).toBe(42);
    expect(typeof item.queuedAt).toBe('number');
  });

  test('DeletionsResponse type should be valid', () => {
    const response: DeletionsResponse = {
      deletions: [
        {
          projectId: 'test-project',
          file: '/test/file.ts',
          name: 'unusedFunction',
          line: 42,
          queuedAt: Date.now(),
        },
      ],
    };

    expect(response.deletions).toHaveLength(1);
    expect(response.deletions[0].name).toBe('unusedFunction');
  });

  test('empty DeletionsResponse should be valid', () => {
    const response: DeletionsResponse = {
      deletions: [],
    };

    expect(response.deletions).toHaveLength(0);
  });
});

