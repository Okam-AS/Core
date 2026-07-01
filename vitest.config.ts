import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const envStub = path.resolve(dirname, "tests/env.stub.ts");

// Core is bundler-agnostic pure TypeScript, so a plain node environment is enough for the units under
// test (currency formatting, phone validation, the TWINT verify poll, the free-order guard, i18n key
// parity). None of them touch the DOM. jsdom/happy-dom would only add cost.
export default defineConfig({
  plugins: [
    {
      // helpers/configuration.ts and pinia/theme.ts do `import getEnv from "../../env"`, which in a
      // consumer app resolves to <app>/env.ts. Standalone in this repo that file is out of tree, so we
      // redirect the exact "../../env" specifier to the in-repo test stub. Scoped to that specifier so
      // nothing else is affected.
      name: "okam-core-env-stub",
      enforce: "pre",
      resolveId(source) {
        if (source === "../../env") return envStub;
        return null;
      },
    },
  ],
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    globals: false,
  },
});
