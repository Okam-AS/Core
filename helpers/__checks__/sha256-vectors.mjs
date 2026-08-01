#!/usr/bin/env node
// Proves core/helpers/sha256.ts agrees with Node's own SHA-256, byte for byte.
//
// The digest is a money contract: it is what the Meals funding reservation pins as its QuoteHash,
// so an implementation that is subtly wrong would not fail anywhere — it would just make one
// client's quotes unmatchable by another's. This check is the only thing standing between "we
// wrote a hash function" and "we wrote SHA-256".
//
// Run:  node core/helpers/__checks__/sha256-vectors.mjs      (needs Node >= 22.6 for .ts imports)

import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Core's own imports are extensionless (a bundler resolves them), which plain ESM cannot follow.
// So the modules under test are bundled exactly as an app would bundle them, with the host app's
// esbuild, and the result is imported as a data URL. Bundling the real files is the point: a check
// that re-implemented the resolution would not be checking the shipped code.
const here = dirname(fileURLToPath(import.meta.url));
const esbuild = await createRequire(join(here, "noop.cjs"))("esbuild");
const built = await esbuild.build({
  entryPoints: [join(here, "..", "meals-quote-hash.ts")],
  bundle: true,
  write: false,
  format: "esm",
  platform: "neutral"
});
const { sha256Hex } = await import("data:text/javascript;base64," +
  Buffer.from(await esbuild.build({ entryPoints: [join(here, "..", "sha256.ts")], bundle: true, write: false, format: "esm", platform: "neutral" })
    .then(r => r.outputFiles[0].text)).toString("base64"));
const { mealsQuoteCanonicalForm, mealsQuoteHash } =
  await import("data:text/javascript;base64," + Buffer.from(built.outputFiles[0].text).toString("base64"));

const CASES = [
  "",
  "abc",
  "a",
  "The quick brown fox jumps over the lazy dog",
  // 55, 56 and 64 bytes: the padding-block boundaries, where a length field spills into a new block.
  "x".repeat(55),
  "x".repeat(56),
  "x".repeat(64),
  "x".repeat(1000),
  // Non-ASCII: two-byte, three-byte and a surrogate pair (four-byte) code point.
  "kaffe kr 49,50 — Ørjan æøå",
  "日本語のメニュー",
  "burger 🍔 meny"
];

let failures = 0;
for (const value of CASES) {
  const expected = createHash("sha256").update(value, "utf8").digest("hex");
  const actual = sha256Hex(value);
  if (actual !== expected) {
    failures++;
    console.error(`MISMATCH for ${JSON.stringify(value.slice(0, 40))}\n  node: ${expected}\n  core: ${actual}`);
  }
}

// The canonical form is part of the contract too: item order must not change the hash.
const cart = {
  storeId: 7,
  items: [
    { quantity: 2, product: { id: "B2", amount: 12900, productVariants: [] } },
    {
      quantity: 1,
      product: {
        id: "A1",
        amount: 4950,
        productVariants: [{ options: [{ id: "O2", selected: true }, { id: "O1", selected: true }, { id: "O3", selected: false }] }]
      }
    }
  ]
};
const reordered = { storeId: 7, items: [cart.items[1], cart.items[0]] };
if (mealsQuoteHash(cart, "NOK", 30800) !== mealsQuoteHash(reordered, "NOK", 30800)) {
  failures++;
  console.error("MISMATCH: reordering cart lines changed the quote hash");
}
if (mealsQuoteHash(cart, "NOK", 30800) === mealsQuoteHash(cart, "NOK", 30900)) {
  failures++;
  console.error("MISMATCH: a changed cart total did not change the quote hash");
}
if (!mealsQuoteCanonicalForm(cart, "nok", 30800).includes("\nNOK\n")) {
  failures++;
  console.error("MISMATCH: currency is not uppercased in the canonical form");
}

console.log(failures === 0
  ? `sha256 + quote-hash contract OK (${CASES.length} vectors + 4 canonical-form properties)`
  : `${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
