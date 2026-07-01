// Test-only stub for the app-owned "../../env" module.
//
// Core is vendored into each consumer app at <app>/core, so its `import getEnv from "../../env"`
// (helpers/configuration.ts, pinia/theme.ts) resolves to the app's own env.ts. Standalone in this
// repo there is no such file, so vitest.config.ts aliases the "../../env" specifier to this stub.
// Values are deliberately test-safe (never production) and only need to be non-crashing — the
// money-critical logic under test does not depend on any real API base URL or Stripe key.
const values: Record<string, string> = {
  IS_PRODUCTION: "false",
  API_BASE_URL: "https://okamtest.example.invalid",
  IS_NATIVESCRIPT: "false",
  VERSION: "0.0.0-test",
  STRIPE_PUBLISHABLE_KEY: "pk_test_stub",
  PLATFORM_FILE_SUFFIX: ".test",
  SELECTED_THEME: "okam",
};

export default (name: string): string => values[name] ?? "";
