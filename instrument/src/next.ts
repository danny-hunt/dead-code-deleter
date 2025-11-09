import { NextConfig, InstrumentationConfig } from "./types";

/**
 * Webpack configuration modification to inject Babel plugin
 */
function addBabelPlugin(config: any) {
  // Find or create the babel-loader rule
  const rules = config.module?.rules || [];

  for (const rule of rules) {
    // Handle nested rules
    if (rule.oneOf) {
      for (const oneOfRule of rule.oneOf) {
        if (oneOfRule.use?.loader?.includes("babel-loader")) {
          injectBabelPlugin(oneOfRule.use);
        }
      }
    }

    if (rule.use?.loader?.includes("babel-loader")) {
      injectBabelPlugin(rule.use);
    }
  }

  return config;
}

/**
 * Inject our Babel plugin into the babel-loader options
 */
function injectBabelPlugin(use: any) {
  if (!use.options) {
    use.options = {};
  }
  if (!use.options.plugins) {
    use.options.plugins = [];
  }

  // Add our plugin if not already present
  const pluginPath = require.resolve("./babel-plugin");
  const hasPlugin = use.options.plugins.some((plugin: any) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    return pluginName === pluginPath || pluginName === "@dead-code-deleter/instrument/babel-plugin";
  });

  if (!hasPlugin) {
    use.options.plugins.push(pluginPath);
  }
}

/**
 * Higher-order function that wraps Next.js config with instrumentation
 */
export default function withInstrumentation(
  config: InstrumentationConfig & { nextConfig?: NextConfig } = {}
): (nextConfig?: NextConfig) => NextConfig {
  const {
    platformUrl,
    projectId = "default",
    uploadInterval = 10000,
    enabled = true,
    debug = false,
    nextConfig: configNextConfig,
  } = config;

  return function (userNextConfig: NextConfig = {}): NextConfig {
    // Merge user's Next config with the one passed to withInstrumentation
    const baseConfig = configNextConfig || userNextConfig;

    return {
      ...baseConfig,

      // Set environment variables for runtime configuration
      env: {
        ...baseConfig.env,
        ...(platformUrl && { DEAD_CODE_PLATFORM_URL: platformUrl }),
        DEAD_CODE_PROJECT_ID: projectId,
        DEAD_CODE_UPLOAD_INTERVAL: uploadInterval.toString(),
        DEAD_CODE_ENABLED: enabled.toString(),
        DEAD_CODE_DEBUG: debug.toString(),
      },

      // Modify webpack configuration
      webpack: (webpackConfig: any, options: any) => {
        // Call user's webpack function if it exists
        let config = webpackConfig;
        if (typeof baseConfig.webpack === "function") {
          config = baseConfig.webpack(webpackConfig, options);
        }

        // Add webpack alias to ensure the runtime can be resolved
        const runtimePath = require.resolve("./runtime");

        if (!config.resolve) {
          config.resolve = {};
        }
        if (!config.resolve.alias) {
          config.resolve.alias = {};
        }

        // Map the package import to the actual runtime file
        config.resolve.alias["@dead-code-deleter/instrument"] = runtimePath;
        config.resolve.alias["@dead-code-deleter/instrument/runtime"] = runtimePath;

        // Note: We don't inject the runtime into webpack entries here because
        // it causes issues with Edge Runtime. Instead, the runtime should be
        // imported via instrumentation.ts which properly checks the runtime type.

        return config;
      },
    };
  };
}

/**
 * Alternative export for TypeScript config files
 */
export function createInstrumentedConfig(config: InstrumentationConfig & { nextConfig?: NextConfig } = {}): NextConfig {
  return withInstrumentation(config)();
}
