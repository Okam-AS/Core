import { describe, expect, it } from 'vitest';

import de from './de';
import en from './en';
import fr from './fr';
import itLocale from './it';
import no from './no';

const locales: Record<string, Record<string, string>> = {
  en,
  de,
  no,
  fr,
  it: itLocale,
};

const reference = Object.keys(en).sort();

describe('translation key parity across locales', () => {
  it('exports a non-empty key set from every locale', () => {
    for (const [name, table] of Object.entries(locales)) {
      expect(Object.keys(table).length, `${name} should have keys`).toBeGreaterThan(0);
    }
  });

  for (const [name, table] of Object.entries(locales)) {
    it(`${name} has exactly the same keys as en`, () => {
      const keys = Object.keys(table).sort();
      const missing = reference.filter((key) => !(key in table));
      const extra = keys.filter((key) => !(key in en));

      expect(missing, `${name} is missing keys present in en`).toEqual([]);
      expect(extra, `${name} has keys not present in en`).toEqual([]);
    });

    it(`${name} preserves the interpolation contract of en`, () => {
      for (const key of reference) {
        const expected = [...en[key].matchAll(/\{[^}]+\}/g)]
          .map(([placeholder]) => placeholder)
          .sort();
        const actual = [...table[key].matchAll(/\{[^}]+\}/g)]
          .map(([placeholder]) => placeholder)
          .sort();

        expect(actual, `${name}.${key} placeholders`).toEqual(expected);
      }
    });
  }
});
