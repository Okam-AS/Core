import { describe, expect, it } from 'vitest';

import {
  formatMoneyMinor,
  getConsumerMarketProfile,
  isConsumerLocale,
  isConsumerMarket,
  MarketLocaleError,
  MoneyError,
  parseConsumerLocale,
  parseConsumerMarket,
  resolveConsumerLocale,
  roundCashAmountMinor,
  roundMinorToIncrement,
} from '../consumer/c0/domain/v1';
import {
  normalizePhoneNumber,
  normalizeVerificationCode,
  parsePhoneNumber,
  PhoneInputError,
  type PhoneInput,
} from '../consumer/c0/application/v1';

describe('consumer phone normalization v1', () => {
  it.each([
    {
      name: 'Norwegian national number',
      input: { market: 'NO', value: '999 99 999' },
      expected: '+4799999999',
    },
    {
      name: 'Norwegian E.164 number',
      input: { market: 'NO', value: '+47 (999) 99-999' },
      expected: '+4799999999',
    },
    {
      name: 'Norwegian 00 international number',
      input: { market: 'NO', value: '0047 999 99 999' },
      expected: '+4799999999',
    },
    {
      name: 'Swiss national number without trunk prefix',
      input: { market: 'CH', value: '79 123 45 67' },
      expected: '+41791234567',
    },
    {
      name: 'Swiss national number with trunk prefix',
      input: { market: 'CH', value: '(079) 123 45 67' },
      expected: '+41791234567',
    },
    {
      name: 'Swiss E.164 number',
      input: { market: 'CH', value: '+41 79 123 45 67' },
      expected: '+41791234567',
    },
    {
      name: 'Swiss 00 international number',
      input: { market: 'CH', value: '0041 79 123 45 67' },
      expected: '+41791234567',
    },
  ] satisfies ReadonlyArray<{
    name: string;
    input: PhoneInput;
    expected: string;
  }>)('$name matches the current native C0 contract', ({ input, expected }) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
    expect(parsePhoneNumber(input)).toEqual({
      ok: true,
      value: expected,
    });
  });

  it.each([
    {
      name: 'empty input',
      input: { market: 'CH', value: ' ' },
    },
    {
      name: 'letters',
      input: { market: 'NO', value: 'call 99999999' },
    },
    {
      name: 'foreign calling code in Norwegian market',
      input: { market: 'NO', value: '+41 79 123 45 67' },
    },
    {
      name: 'foreign calling code in Swiss market',
      input: { market: 'CH', value: '+47 999 99 999' },
    },
    {
      name: 'Norwegian lower boundary',
      input: { market: 'NO', value: '40 000 000' },
    },
    {
      name: 'short Norwegian number',
      input: { market: 'NO', value: '999 99 99' },
    },
    {
      name: 'Swiss national number with too few digits',
      input: { market: 'CH', value: '079 123 45 6' },
    },
    {
      name: 'Swiss national number with an extra zero',
      input: { market: 'CH', value: '0079 123 45 67' },
    },
  ] satisfies ReadonlyArray<{
    name: string;
    input: PhoneInput;
  }>)('rejects $name', ({ input }) => {
    expect(parsePhoneNumber(input)).toEqual({
      ok: false,
      code: 'invalid-phone',
      message: 'Enter a valid phone number for the selected market.',
    });
    expect(() => normalizePhoneNumber(input)).toThrowError(
      expect.objectContaining({
        name: 'PhoneInputError',
        code: 'invalid-phone',
      }),
    );
  });

  it('keeps the native threshold stricter than the legacy Pinia validator', () => {
    expect(parsePhoneNumber({ market: 'NO', value: '40 000 000' }).ok).toBe(
      false,
    );
    expect(parsePhoneNumber({ market: 'NO', value: '40 000 001' })).toEqual({
      ok: true,
      value: '+4740000001',
    });
  });

  it.each([
    [' 123456 ', '123456'],
    ['000000', '000000'],
  ])('normalizes a six-digit verification code', (input, expected) => {
    expect(normalizeVerificationCode(input)).toBe(expected);
  });

  it.each(['', '12345', '1234567', '12 34 56', 'abcdef'])(
    'rejects malformed verification code %j',
    (input) => {
      expect(() => normalizeVerificationCode(input)).toThrowError(
        expect.objectContaining({
          name: 'PhoneInputError',
          code: 'invalid-code',
        }),
      );
    },
  );

  it('exports a stable typed input error', () => {
    const error = new PhoneInputError('invalid-phone', 'Invalid phone');
    expect(error).toMatchObject({
      name: 'PhoneInputError',
      code: 'invalid-phone',
      message: 'Invalid phone',
    });
  });

  it('fails closed when an untyped caller supplies an unknown market', () => {
    expect(() =>
      normalizePhoneNumber({
        market: 'SE' as PhoneInput['market'],
        value: '99999999',
      }),
    ).toThrowError(
      expect.objectContaining({
        name: 'MarketLocaleError',
        code: 'unknown-market',
      }),
    );
  });
});

describe('explicit market and locale contracts v1', () => {
  it.each([
    ['CH', 'de', 'de-CH'],
    ['CH', 'en', 'en-CH'],
    ['CH', 'fr', 'fr-CH'],
    ['CH', 'it', 'it-CH'],
    ['NO', 'en', 'en-NO'],
    ['NO', 'no', 'nb-NO'],
  ] as const)(
    'resolves %s/%s to %s',
    (market, locale, expectedLocaleTag) => {
      expect(resolveConsumerLocale({ market, locale })).toBe(
        expectedLocaleTag,
      );
    },
  );

  it.each([
    ['CH', 'no'],
    ['NO', 'de'],
    ['NO', 'fr'],
    ['NO', 'it'],
  ] as const)('rejects unsupported %s/%s pairs', (market, locale) => {
    expect(() => resolveConsumerLocale({ market, locale })).toThrowError(
      expect.objectContaining<Partial<MarketLocaleError>>({
        name: 'MarketLocaleError',
        code: 'unsupported-locale',
      }),
    );
  });

  it.each(['en', 'de', 'fr', 'it', 'no'] as const)(
    'accepts the %s translation catalog',
    (locale) => {
      expect(isConsumerLocale(locale)).toBe(true);
      expect(parseConsumerLocale(locale)).toBe(locale);
    },
  );

  it.each(['CH', 'NO'] as const)('accepts the %s market', (market) => {
    expect(isConsumerMarket(market)).toBe(true);
    expect(parseConsumerMarket(market)).toBe(market);
  });

  it.each(['ch', 'SE', '', null, 47])('rejects unknown market %j', (market) => {
    expect(isConsumerMarket(market)).toBe(false);
    expect(() => parseConsumerMarket(market)).toThrowError(
      expect.objectContaining({
        code: 'unknown-market',
      }),
    );
  });

  it('fails closed when an untyped locale pair contains an unknown value', () => {
    expect(() =>
      resolveConsumerLocale({
        market: 'SE' as 'CH',
        locale: 'en',
      }),
    ).toThrowError(
      expect.objectContaining({
        code: 'unknown-market',
      }),
    );
    expect(() =>
      resolveConsumerLocale({
        market: 'CH',
        locale: 'nb' as 'en',
      }),
    ).toThrowError(
      expect.objectContaining({
        code: 'unknown-locale',
      }),
    );
  });

  it.each(['EN', 'nb', 'de-DE', '', null, 1])(
    'rejects unknown locale %j',
    (locale) => {
      expect(isConsumerLocale(locale)).toBe(false);
      expect(() => parseConsumerLocale(locale)).toThrowError(
        expect.objectContaining({
          code: 'unknown-locale',
        }),
      );
    },
  );

  it('keeps money, cash rounding, phone, and defaults explicit per market', () => {
    expect(getConsumerMarketProfile('CH')).toEqual({
      currency: 'CHF',
      fractionDigits: 2,
      cashRoundingMinor: 5,
      callingCode: '+41',
      defaultLocale: 'de',
      supportedLocales: ['de', 'fr', 'it', 'en'],
    });
    expect(getConsumerMarketProfile('NO')).toEqual({
      currency: 'NOK',
      fractionDigits: 2,
      cashRoundingMinor: 100,
      callingCode: '+47',
      defaultLocale: 'no',
      supportedLocales: ['no', 'en'],
    });
  });
});

describe('deterministic money contracts v1', () => {
  it.each([
    ['CH', 0, 'CHF 0.00'],
    ['CH', 1, 'CHF 0.01'],
    ['CH', 123_450, "CHF 1'234.50"],
    ['CH', -123_450, "CHF -1'234.50"],
    ['NO', 0, '0,00 kr'],
    ['NO', 1, '0,01 kr'],
    ['NO', 123_450, '1 234,50 kr'],
    ['NO', -123_450, '-1 234,50 kr'],
  ] as const)('formats %s %i as %s', (market, amountMinor, expected) => {
    expect(formatMoneyMinor(amountMinor, market)).toBe(expected);
  });

  it.each([
    [102, 'CH', 100],
    [103, 'CH', 105],
    [-102, 'CH', -100],
    [-103, 'CH', -105],
    [149, 'NO', 100],
    [150, 'NO', 200],
    [-149, 'NO', -100],
    [-150, 'NO', -200],
  ] as const)(
    'cash-rounds %i minor units for %s to %i',
    (amountMinor, market, expected) => {
      expect(roundCashAmountMinor(amountMinor, market)).toBe(expected);
    },
  );

  it.each([
    [4, 10, 0],
    [5, 10, 10],
    [-4, 10, 0],
    [-5, 10, -10],
    [12_345, 1, 12_345],
  ] as const)(
    'rounds %i to increment %i as %i with symmetric ties',
    (amountMinor, incrementMinor, expected) => {
      expect(roundMinorToIncrement(amountMinor, incrementMinor)).toBe(expected);
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 1.5, 2 ** 53])(
    'rejects malformed minor amount %j',
    (amountMinor) => {
      expect(() => formatMoneyMinor(amountMinor, 'CH')).toThrowError(
        expect.objectContaining<Partial<MoneyError>>({
          name: 'MoneyError',
          code: 'invalid-minor-amount',
        }),
      );
      expect(() => roundMinorToIncrement(amountMinor, 5)).toThrowError(
        expect.objectContaining({
          code: 'invalid-minor-amount',
        }),
      );
    },
  );

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects malformed rounding increment %j',
    (incrementMinor) => {
      expect(() => roundMinorToIncrement(100, incrementMinor)).toThrowError(
        expect.objectContaining({
          code: 'invalid-rounding-increment',
        }),
      );
    },
  );
});
