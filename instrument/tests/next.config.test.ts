/**
 * Tests for Next.js configuration wrapper
 */

import withInstrumentation, { createInstrumentedConfig } from "../src/next";

describe("Next.js Config - withInstrumentation", () => {
  test("should return a function", () => {
    const result = withInstrumentation();
    expect(typeof result).toBe("function");
  });

  test("should configure environment variables", () => {
    const wrapper = withInstrumentation({
      platformUrl: "http://example.com/api",
      projectId: "test-project",
      uploadInterval: 5000,
      enabled: true,
      debug: true,
    });

    const config = wrapper({});

    expect(config.env).toMatchObject({
      DEAD_CODE_PLATFORM_URL: "http://example.com/api",
      DEAD_CODE_PROJECT_ID: "test-project",
      DEAD_CODE_UPLOAD_INTERVAL: "5000",
      DEAD_CODE_ENABLED: "true",
      DEAD_CODE_DEBUG: "true",
    });
  });

  test("should use default values", () => {
    const wrapper = withInstrumentation({});
    const config = wrapper({});

    expect(config.env).toMatchObject({
      DEAD_CODE_PROJECT_ID: "default",
      DEAD_CODE_UPLOAD_INTERVAL: "10000",
      DEAD_CODE_ENABLED: "true",
      DEAD_CODE_DEBUG: "false",
    });
  });

  test("should merge with existing env variables", () => {
    const wrapper = withInstrumentation({
      projectId: "test-project",
    });

    const config = wrapper({
      env: {
        CUSTOM_VAR: "custom-value",
      },
    });

    expect(config.env).toMatchObject({
      CUSTOM_VAR: "custom-value",
      DEAD_CODE_PROJECT_ID: "test-project",
    });
  });

  test("should preserve existing webpack config", () => {
    const customWebpack = jest.fn((config) => {
      (config as any).customProp = "custom";
      return config;
    });

    const wrapper = withInstrumentation({
      projectId: "test-project",
    });

    const config = wrapper({
      webpack: customWebpack,
    });

    const mockWebpackConfig: any = { resolve: { alias: {} } };
    const mockOptions = {};
    config.webpack(mockWebpackConfig, mockOptions);

    expect(customWebpack).toHaveBeenCalledWith(mockWebpackConfig, mockOptions);
    expect(mockWebpackConfig.customProp).toBe("custom");
  });

  test("should add webpack alias for runtime", () => {
    const wrapper = withInstrumentation({
      projectId: "test-project",
    });

    const config = wrapper({});

    const mockWebpackConfig = { resolve: { alias: {} } };
    const result = config.webpack(mockWebpackConfig, {});

    expect(result.resolve.alias).toHaveProperty("@dead-code-deleter/instrument");
    expect(result.resolve.alias).toHaveProperty("@dead-code-deleter/instrument/runtime");
  });

  test("should handle missing webpack config", () => {
    const wrapper = withInstrumentation({
      projectId: "test-project",
    });

    const config = wrapper({});

    const mockWebpackConfig = {};
    const result = config.webpack(mockWebpackConfig, {});

    expect(result.resolve).toBeDefined();
    expect(result.resolve.alias).toBeDefined();
  });

  test("should preserve other Next.js config properties", () => {
    const wrapper = withInstrumentation({
      projectId: "test-project",
    });

    const config = wrapper({
      reactStrictMode: true,
      images: {
        domains: ["example.com"],
      },
    });

    expect(config.reactStrictMode).toBe(true);
    expect(config.images).toEqual({
      domains: ["example.com"],
    });
  });
});

describe("Next.js Config - createInstrumentedConfig", () => {
  test("should create config without calling wrapper", () => {
    const config = createInstrumentedConfig({
      platformUrl: "http://example.com/api",
      projectId: "test-project",
    });

    expect(config.env).toMatchObject({
      DEAD_CODE_PLATFORM_URL: "http://example.com/api",
      DEAD_CODE_PROJECT_ID: "test-project",
    });
  });

  test("should merge with nextConfig option", () => {
    const config = createInstrumentedConfig({
      platformUrl: "http://example.com/api",
      projectId: "test-project",
      nextConfig: {
        reactStrictMode: true,
      },
    });

    expect(config.reactStrictMode).toBe(true);
    expect(config.env.DEAD_CODE_PROJECT_ID).toBe("test-project");
  });

  test("should handle empty config", () => {
    const config = createInstrumentedConfig();

    expect(config.env).toBeDefined();
    expect(config.env.DEAD_CODE_PROJECT_ID).toBe("default");
  });
});
