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
  vatFromGross,
  type Money,
} from '../consumer/c0/domain/v1';

/**
 * The money module unifies the native Intl formatters, the pinned Core C0
 * formatter, Ali's øre helpers, and the backend per-line-floor VAT rule into
 * one minor-unit domain (FRONTEND-PLATFORM-SPEC XXVI.4, money slice S1).
 *
 * The VAT oracle is the backend `OrderModelBuilder` per-line-floor rule
 * (`ModelBuilders/OrderModelBuilder.cs`): `Tax` is a C# `decimal`, `Amount`
 * and `Quantity` are `int`, so `basis = (int)Math.Floor(Amount / (1 + Tax/100)
 * * Quantity)` and `vat = totalAmount - basis` run in EXACT decimal. Expressing
 * the rate in integer per-mille keeps the same computation in exact integer
 * arithmetic, which reproduces the decimal result byte-for-byte for every
 * representable consumer amount. Each row below was cross-checked against the
 * decimal formula.
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

describe('consumer VAT — backend per-line-floor oracle', () => {
  it.each([
    // [grossMinor, ratePermille, expectedNet, expectedVat]
    [1000, 81, 925, 75], // CH standard 8.1%
    [3650, 81, 3376, 274],
    [12_500, 81, 11_563, 937],
    [100_000, 81, 92_506, 7494],
    [890, 26, 867, 23], // CH reduced 2.6%
    [10_000, 26, 9746, 254],
    [3650, 38, 3516, 134], // CH accommodation 3.8%
    [1000, 250, 800, 200], // NO standard 25%
    [12_500, 250, 10_000, 2500],
    [10_000, 150, 8695, 1305], // NO reduced 15%
    [10_000, 120, 8928, 1072], // NO low 12%
    [1, 250, 0, 1],
    [0, 81, 0, 0],
  ] as const)(
    'splits gross %i at %i‰ into net %i + vat %i',
    (grossMinor, ratePermille, expectedNet, expectedVat) => {
      const breakdown = vatFromGross(makeMoney(grossMinor, 'CHF'), ratePermille);
      expect(breakdown.net.minor).toBe(expectedNet);
      expect(breakdown.vat.minor).toBe(expectedVat);
      // The backend invariant: basis + amount === totalAmount.
      expect(breakdown.net.minor + breakdown.vat.minor).toBe(grossMinor);
      expect(breakdown.gross).toEqual(makeMoney(grossMinor, 'CHF'));
      expect(breakdown.ratePermille).toBe(ratePermille);
    },
  );

  it('carries the sign through a credit line, never dropping the bucket', () => {
    const breakdown = vatFromGross(makeMoney(-1000, 'NOK'), 250);
    expect(breakdown.net.minor).toBe(-800);
    expect(breakdown.vat.minor).toBe(-200);
    expect(breakdown.net.minor + breakdown.vat.minor).toBe(-1000);
  });

  it('treats a zero rate as all-net', () => {
    const breakdown = vatFromGross(makeMoney(4200, 'NOK'), 0);
    expect(breakdown.net.minor).toBe(4200);
    expect(breakdown.vat.minor).toBe(0);
  });

  it.each([-1, 1.5, Number.NaN])(
    'rejects a malformed per-mille rate %j',
    (ratePermille) => {
      expect(() =>
        vatFromGross(makeMoney(1000, 'CHF'), ratePermille),
      ).toThrowError(expect.objectContaining({ code: 'invalid-vat-rate' }));
    },
  );

  it('rejects an unsupported VAT mode', () => {
    expect(() =>
      vatFromGross(makeMoney(1000, 'CHF'), 81, 'per-unit' as 'line-floor'),
    ).toThrowError(expect.objectContaining({ code: 'invalid-vat-rate' }));
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
