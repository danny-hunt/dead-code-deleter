/**
 * Tests for runtime upload functionality
 */

// Mock fetch before importing runtime
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Runtime - Data Upload', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    
    process.env.DEAD_CODE_PLATFORM_URL = 'http://localhost:3000/api/usage';
    process.env.DEAD_CODE_PROJECT_ID = 'test-project';
    process.env.DEAD_CODE_ENABLED = 'true';
    process.env.DEAD_CODE_UPLOAD_INTERVAL = '1000';
    
    jest.resetModules();
    jest.clearAllMocks();
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: jest.fn().mockResolvedValue(''),
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should upload data when flush is called', async () => {
    const { __trackFn, flush } = require('../src/runtime');

    __trackFn('/test/file.ts', 'myFunction', 10);
    __trackFn('/test/file.ts', 'otherFunction', 20);
    
    await flush();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/usage',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const callArgs = mockFetch.mock.calls[0];
    const payload = JSON.parse(callArgs[1].body);
    
    expect(payload.projectId).toBe('test-project');
    expect(payload.functions).toHaveLength(2);
    expect(payload.functions[0]).toMatchObject({
      file: '/test/file.ts',
      name: 'myFunction',
      line: 10,
      callCount: 1,
    });
  });

  test('should clear tracker after successful upload', async () => {
    const { __trackFn, flush, getStats } = require('../src/runtime');

    __trackFn('/test/file.ts', 'myFunction', 10);
    expect(getStats().trackedFunctions).toBe(1);
    
    await flush();
    
    const stats = getStats();
    expect(stats.trackedFunctions).toBe(0);
    expect(stats.totalCalls).toBe(0);
  });

  test('should not upload when no platform URL is configured', async () => {
    delete process.env.DEAD_CODE_PLATFORM_URL;
    const { __trackFn, flush } = require('../src/runtime');

    __trackFn('/test/file.ts', 'myFunction', 10);
    await flush();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('should not upload when no data is tracked', async () => {
    const { flush } = require('../src/runtime');

    await flush();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('should handle upload errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: jest.fn().mockResolvedValue('Error message'),
    });

    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const { __trackFn, flush } = require('../src/runtime');

    __trackFn('/test/file.ts', 'myFunction', 10);
    await flush();

    expect(mockFetch).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    
    consoleError.mockRestore();
  });

  test('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const { __trackFn, flush } = require('../src/runtime');

    __trackFn('/test/file.ts', 'myFunction', 10);
    await flush();

    expect(mockFetch).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    
    consoleError.mockRestore();
  });

  test('should include timestamp in payload', async () => {
    const { __trackFn, flush } = require('../src/runtime');

    const beforeTime = Date.now();
    __trackFn('/test/file.ts', 'myFunction', 10);
    await flush();
    const afterTime = Date.now();

    const callArgs = mockFetch.mock.calls[0];
    const payload = JSON.parse(callArgs[1].body);
    
    expect(payload.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(payload.timestamp).toBeLessThanOrEqual(afterTime);
  });
});

