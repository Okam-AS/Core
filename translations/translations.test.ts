import { describe, it, expect } from "vitest";
import en from "./en";
import de from "./de";
import no from "./no";
import fr from "./fr";
// Aliased: a bare `it` import would shadow vitest's it() test function.
import itLocale from "./it";

// Each locale is a flat default-exported { key: string } map. The $i() lookup in pinia/translation.ts
// falls back to English (then to the raw key) on a miss, so a missing key silently ships English or the
// key name to the user — invisible in review. This test makes the key sets symmetric across all locales
// so any drift (a key added to one file and forgotten in another) fails loudly.
const locales: Record<string, Record<string, string>> = { en, de, no, fr, it: itLocale };

// English is the fallback locale, so it is the reference key set every other locale must match exactly.
const reference = Object.keys(en).sort();

describe("translation key parity across locales", () => {
  it("every locale exports a non-empty key set", () => {
    for (const [name, table] of Object.entries(locales)) {
      expect(Object.keys(table).length, `${name} should have keys`).toBeGreaterThan(0);
    }
  });

  for (const [name, table] of Object.entries(locales)) {
    it(`${name} has exactly the same keys as en`, () => {
      const keys = Object.keys(table).sort();
      const missing = reference.filter((k) => !(k in table)); // in en, absent here
      const extra = keys.filter((k) => !(k in en)); // here, absent in en
      expect(missing, `${name} is missing keys present in en`).toEqual([]);
      expect(extra, `${name} has keys not present in en`).toEqual([]);
    });
  }
});
