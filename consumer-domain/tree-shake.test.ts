import { build } from "esbuild";
import { describe, expect, it } from "vitest";

describe("consumer-domain package tree shaking", () => {
  it("bundles a phone-only package consumer without money or manifest implementations", async () => {
    const result = await build({
      stdin: {
        contents: [
          'import { normalizePhoneNumberV1 } from "@okam/core/consumer-domain/v1";',
          'globalThis.__phone = normalizePhoneNumberV1({ market: "CH", value: "0761234567" });',
        ].join("\n"),
        loader: "ts",
        resolveDir: process.cwd(),
      },
      bundle: true,
      format: "esm",
      minify: false,
      platform: "neutral",
      treeShaking: true,
      write: false,
    });

    const output = result.outputFiles[0]?.text ?? "";
    expect(output).toContain("normalizePhoneNumberV1");
    expect(output).not.toContain("manifest_missing");
    expect(output).not.toContain("amountMinor must be a safe integer");
    expect(output.length).toBeLessThan(4_000);
  });
});
