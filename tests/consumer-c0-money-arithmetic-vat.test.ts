import { describe, expect, it } from 'vitest';

import {
  addMoney,
  currencyForMarket,
  formatMoney,
  makeMoney,
  marketForCurrency,
  MoneyError,
  multiplyMoneyByQuantity,
  subtractMoney,
  type Money,
} from '../consumer/c0/domain/v1';

/**
 * The money module unifies the native Intl formatters, the pinned Core C0
 * formatter, and Ali's øre helpers into one minor-unit domain
 * (FRONTEND-PLATFORM-SPEC XXVI.4, money slice S1).
 *
 * It intentionally provides NO client-side VAT. The backend
 * (`OrderModelBuilder`) is the sole VAT authority: it floors the PER-UNIT
 * decimal division `(int)floor((Amount / (1 + Tax/100)) * Quantity)` in C#
 * `decimal`. A gross-only integer split cannot reproduce that — for quantity
 * ≥ 2 the two disagree by a minor unit on most rates, and float64 cannot
 * reproduce the decimal even per unit — so the module offers no `vatFromGross`
 * and the consumer app consumes the server VAT breakdown verbatim.
 */
describe('consumer money — minor-unit construction', () => {
  it('builds a currency-tagged minor amount', () => {
    expect(makeMoney(3650, 'CHF')).toEqual({ minor: 3650, currency: 'CHF' });
    expect(makeMoney(-1250, 'NOK')).toEqual({ minor: -1250, currency: 'NOK' });
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 1.5, 2 ** 53])(
    'rejects a non-safe-integer minor amount %j',
    (minor) => {
      expect(() => makeMoney(minor, 'CHF')).toThrowError(
        expect.objectContaining<Partial<MoneyError>>({
          name: 'MoneyError',
          code: 'invalid-minor-amount',
        }),
      );
    },
  );

  it.each(['USD', 'EUR', 'chf', ''])(
    'rejects an unknown currency %j',
    (currency) => {
      expect(() =>
        makeMoney(100, currency as 'CHF'),
      ).toThrowError(
        expect.objectContaining({ code: 'unknown-currency' }),
      );
    },
  );

  it('maps currencies and markets both ways', () => {
    expect(marketForCurrency('CHF')).toBe('CH');
    expect(marketForCurrency('NOK')).toBe('NO');
    expect(currencyForMarket('CH')).toBe('CHF');
    expect(currencyForMarket('NO')).toBe('NOK');
  });
});

describe('consumer money — arithmetic in minor units', () => {
  const chf = (minor: number): Money => makeMoney(minor, 'CHF');

  it('adds and subtracts same-currency amounts', () => {
    expect(addMoney(chf(3650), chf(620))).toEqual(chf(4270));
    expect(subtractMoney(chf(4270), chf(620))).toEqual(chf(3650));
    expect(subtractMoney(chf(100), chf(150))).toEqual(chf(-50));
  });

  it('multiplies an amount by an integer quantity', () => {
    expect(multiplyMoneyByQuantity(chf(3650), 3)).toEqual(chf(10_950));
    expect(multiplyMoneyByQuantity(chf(3650), 0)).toEqual(chf(0));
  });

  it('fails closed on a currency mismatch', () => {
    expect(() => addMoney(chf(100), makeMoney(100, 'NOK'))).toThrowError(
      expect.objectContaining({ code: 'currency-mismatch' }),
    );
    expect(() =>
      subtractMoney(chf(100), makeMoney(100, 'NOK')),
    ).toThrowError(expect.objectContaining({ code: 'currency-mismatch' }));
  });

  it.each([1.5, -1, Number.NaN, 2 ** 53])(
    'rejects a non-integer quantity %j',
    (quantity) => {
      expect(() => multiplyMoneyByQuantity(chf(100), quantity)).toThrowError(
        expect.objectContaining({ code: 'invalid-quantity' }),
      );
    },
  );
});

describe('consumer money — no client-side VAT (server is the VAT authority)', () => {
  it('exposes no VAT computation on the money module', async () => {
    // The backend flooring is per-unit decimal —
    // `(int)floor((Amount / (1 + Tax/100)) * Quantity)` — which no gross-only
    // integer (or float64 per-unit) split can reproduce for quantity ≥ 2. The
    // module therefore deliberately ships no `vatFromGross`; the app consumes
    // the server breakdown. This guards against the capability reappearing.
    const money = await import('../consumer/c0/domain/v1');
    expect('vatFromGross' in money).toBe(false);
    expect('VatBreakdown' in money).toBe(false);
    expect('Permille' in money).toBe(false);
  });
});

describe('consumer money — the ONE deterministic formatter', () => {
  it.each([
    [0, 'CHF', 'CHF 0.00'],
    [3650, 'CHF', 'CHF 36.50'],
    [123_450, 'CHF', "CHF 1'234.50"],
    [-123_450, 'CHF', "CHF -1'234.50"],
    [0, 'NOK', '0,00 kr'],
    [12_500, 'NOK', '125,00 kr'],
    [123_450, 'NOK', '1 234,50 kr'],
    [-123_450, 'NOK', '-1 234,50 kr'],
  ] as const)('formats %i %s as %s', (minor, currency, expected) => {
    expect(formatMoney(makeMoney(minor, currency))).toBe(expected);
  });

  /**
   * The ratified canon (Sven, 2026-07-20) is byte-exact. These assertions pin
   * the individual glyphs — grouping separator, decimal separator, symbol
   * placement, and crucially a plain ASCII space (never NBSP) — so the render
   * cannot silently drift toward a locale/ICU convention.
   */
  it('pins the Swiss glyphs: ISO code, plain space, apostrophe grouping, period decimal', () => {
    const formatted = formatMoney(makeMoney(1_234_567, 'CHF'));
    expect(formatted).toBe("CHF 12'345.67");
    // No non-breaking space anywhere.
    expect(formatted).not.toContain(' ');
    expect(formatted).not.toContain(' ');
    // The separator after the ISO code is a plain ASCII space (U+0020).
    expect(formatted.charCodeAt(3)).toBe(0x20);
    // Thousands are grouped with a straight apostrophe (U+0027), decimal is a period.
    expect(formatted).toContain("'");
    expect(formatted.split('.')[1]).toBe('67');
  });

  it('pins the Norwegian glyphs: plain-space grouping, comma decimal, kr symbol (not the ISO code)', () => {
    const formatted = formatMoney(makeMoney(1_234_567, 'NOK'));
    expect(formatted).toBe('12 345,67 kr');
    expect(formatted).not.toContain(' ');
    expect(formatted).not.toContain(' ');
    expect(formatted).not.toContain('NOK');
    expect(formatted.endsWith(' kr')).toBe(true);
    // The thousands separator (index 2 of "12 345,67 kr") is a plain ASCII space.
    expect(formatted.charCodeAt(2)).toBe(0x20);
    expect(formatted.split(',')[1]).toBe('67 kr');
  });

  it('is market-fixed: the render depends only on the currency, taking no locale', () => {
    // formatMoney's only input is the currency-tagged Money — there is no
    // content-locale parameter for fr-CH / it-CH to diverge through.
    expect(formatMoney).toHaveLength(1);
    expect(formatMoney(makeMoney(123_450, 'CHF'))).toBe(
      formatMoney(makeMoney(123_450, 'CHF')),
    );
  });
});
