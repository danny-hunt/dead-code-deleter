/**
 * Tests for runtime configuration
 */

global.fetch = jest.fn();

describe('Runtime - Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should use default configuration', () => {
    delete process.env.DEAD_CODE_PLATFORM_URL;
    delete process.env.DEAD_CODE_PROJECT_ID;
    delete process.env.DEAD_CODE_ENABLED;
    delete process.env.DEAD_CODE_DEBUG;

    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.platformUrl).toBe('');
    expect(stats.config.projectId).toBe('default');
    expect(stats.config.uploadInterval).toBe(10000);
    expect(stats.config.enabled).toBe(true);
    expect(stats.config.debug).toBe(false);
  });

  test('should load platform URL from env', () => {
    process.env.DEAD_CODE_PLATFORM_URL = 'http://example.com/api';
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.platformUrl).toBe('http://example.com/api');
  });

  test('should prefer NEXT_PUBLIC_ prefixed platform URL', () => {
    process.env.DEAD_CODE_PLATFORM_URL = 'http://example.com/api';
    process.env.NEXT_PUBLIC_DEAD_CODE_PLATFORM_URL = 'http://public.example.com/api';
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.platformUrl).toBe('http://public.example.com/api');
  });

  test('should load project ID from env', () => {
    process.env.DEAD_CODE_PROJECT_ID = 'my-project-123';
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.projectId).toBe('my-project-123');
  });

  test('should prefer NEXT_PUBLIC_ prefixed project ID', () => {
    process.env.DEAD_CODE_PROJECT_ID = 'private-project';
    process.env.NEXT_PUBLIC_DEAD_CODE_PROJECT_ID = 'public-project';
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.projectId).toBe('public-project');
  });

  test('should load upload interval from env', () => {
    process.env.DEAD_CODE_UPLOAD_INTERVAL = '5000';
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.uploadInterval).toBe(5000);
  });

  test('should handle invalid upload interval', () => {
    process.env.DEAD_CODE_UPLOAD_INTERVAL = 'invalid';
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.uploadInterval).toBe(NaN);
  });

  test('should respect enabled flag', () => {
    process.env.DEAD_CODE_ENABLED = 'false';
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.enabled).toBe(false);
  });

  test('should be enabled by default', () => {
    delete process.env.DEAD_CODE_ENABLED;
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.enabled).toBe(true);
  });

  test('should enable debug mode from env', () => {
    process.env.DEAD_CODE_DEBUG = 'true';
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.debug).toBe(true);
  });

  test('should disable debug mode by default', () => {
    delete process.env.DEAD_CODE_DEBUG;
    
    const { getStats } = require('../src/runtime');
    const stats = getStats();

    expect(stats.config.debug).toBe(false);
  });
});

