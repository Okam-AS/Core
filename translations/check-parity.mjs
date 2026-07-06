#!/usr/bin/env node
// Translation key-parity guard (zero-dependency — runs under plain `node`, no test framework).
//
// Each locale file is a flat default-exported `{ key: "value" }` map. The $i() lookup in
// pinia/translation.ts falls back to English and then to the raw key string on a miss, so a
// key added to en/no/de but forgotten elsewhere ships silently (English, or the key name) —
// invisible in review. This guard makes the launch locales' key sets symmetric with en and
// fails the build if they drift.
//
// Launch policy (de-CH launch; see okam i18n decisions 2026-07): en/no/de MUST be complete
// (mismatch => exit 1, blocks the build). fr/it are DEFERRED (Romandie/Ticino not launching
// yet, no culture path selects them) — their gaps are REPORTED but non-blocking. When fr/it
// go live, move them into REQUIRED below and the same guard starts blocking on their gaps too.
//
// Run: node core/translations/check-parity.mjs   (wired as ConsumerWeb `prebuild`).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
const REQUIRED = ["no", "de"]; // must match en exactly or the build fails
const DEFERRED = ["fr", "it"]; // reported only, until these markets launch

// Flat map: top-level (2-space-indented) `identifier:` lines are keys; `//` comments never match.
const keysOf = (loc) => {
  const src = readFileSync(join(dir, `${loc}.ts`), "utf8");
  return new Set([...src.matchAll(/^ {2}([A-Za-z0-9_$]+)\s*:/gm)].map((m) => m[1]));
};

const en = keysOf("en");
const diff = (a, b) => [...a].filter((k) => !b.has(k));

let blocked = false;
for (const loc of [...REQUIRED, ...DEFERRED]) {
  const k = keysOf(loc);
  const missing = diff(en, k); // present in en, absent here
  const extra = diff(k, en); // here, absent in en
  if (missing.length || extra.length) {
    const required = REQUIRED.includes(loc);
    const tag = required ? "ERROR" : "deferred";
    console[required ? "error" : "warn"](
      `[i18n:${loc}] (${tag}) missing ${missing.length}, extra ${extra.length}` +
        (missing.length ? `\n    missing: ${missing.slice(0, 12).join(", ")}${missing.length > 12 ? " …" : ""}` : "") +
        (extra.length ? `\n    extra:   ${extra.slice(0, 12).join(", ")}${extra.length > 12 ? " …" : ""}` : "")
    );
    if (required) blocked = true;
  }
}

if (blocked) {
  console.error("\n[i18n] Launch-locale key parity FAILED (en/no/de must match). Fix before building.");
  process.exit(1);
}
console.log("[i18n] Launch-locale key parity OK (en/no/de). fr/it deferred — see warnings above if any.");
