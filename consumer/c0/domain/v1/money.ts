import {
  getConsumerMarketProfile,
  type ConsumerCurrency,
  type ConsumerMarket,
} from './market';

export type MoneyErrorCode =
  | 'invalid-minor-amount'
  | 'invalid-rounding-increment'
  | 'invalid-quantity'
  | 'invalid-vat-rate'
  | 'currency-mismatch'
  | 'unknown-currency';

export class MoneyError extends Error {
  override readonly name = 'MoneyError';

  constructor(
    readonly code: MoneyErrorCode,
    message: string,
  ) {
    super(message);
  }
}

function assertMinorAmount(amountMinor: number): void {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new MoneyError(
      'invalid-minor-amount',
      'Money amounts must be safe integers in minor units.',
    );
  }
}

function assertRoundingIncrement(incrementMinor: number): void {
  if (!Number.isSafeInteger(incrementMinor) || incrementMinor <= 0) {
    throw new MoneyError(
      'invalid-rounding-increment',
      'Money rounding increments must be positive safe integers.',
    );
  }
}

function groupWholeAmount(value: string, separator: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/gu, separator);
}

/**
 * Formats exact minor units using the market contract rather than runtime
 * locale data, keeping Hermes, browsers, Node, receipts, and snapshots equal.
 */
export function formatMoneyMinor(
  amountMinor: number,
  market: ConsumerMarket,
): string {
  assertMinorAmount(amountMinor);

  const profile = getConsumerMarketProfile(market);
  const absoluteMinor = Math.abs(amountMinor);
  const factor = 10 ** profile.fractionDigits;
  const whole = Math.floor(absoluteMinor / factor).toString();
  const fraction = (absoluteMinor % factor)
    .toString()
    .padStart(profile.fractionDigits, '0');
  const sign = amountMinor < 0 ? '-' : '';

  if (market === 'CH') {
    return `CHF ${sign}${groupWholeAmount(whole, "'")}.${fraction}`;
  }

  return `${sign}${groupWholeAmount(whole, ' ')},${fraction} kr`;
}

/**
 * Rounds to an integer minor-unit increment. Exact half increments round away
 * from zero, so refunds and charges are symmetric.
 */
export function roundMinorToIncrement(
  amountMinor: number,
  incrementMinor: number,
): number {
  assertMinorAmount(amountMinor);
  assertRoundingIncrement(incrementMinor);

  const sign = amountMinor < 0 ? -1 : 1;
  const absoluteMinor = Math.abs(amountMinor);
  const lower = Math.floor(absoluteMinor / incrementMinor) * incrementMinor;
  const remainder = absoluteMinor - lower;
  const roundedAbsolute =
    remainder * 2 >= incrementMinor ? lower + incrementMinor : lower;
  if (roundedAbsolute === 0) {
    return 0;
  }
  const rounded = sign * roundedAbsolute;

  if (!Number.isSafeInteger(rounded)) {
    throw new MoneyError(
      'invalid-minor-amount',
      'Rounded money amount exceeds the safe integer range.',
    );
  }

  return rounded;
}

export function roundCashAmountMinor(
  amountMinor: number,
  market: ConsumerMarket,
): number {
  return roundMinorToIncrement(
    amountMinor,
    getConsumerMarketProfile(market).cashRoundingMinor,
  );
}

/**
 * A currency-tagged integer minor-unit amount — the single money value carried
 * across the consumer domain. Arithmetic stays in integer minor units to keep
 * receipts, snapshots, and the backend byte-equal; formatting happens only at
 * the edge via {@link formatMoney}.
 */
export type Money = Readonly<{
  minor: number;
  currency: ConsumerCurrency;
}>;

/**
 * A VAT rate expressed in integer per-mille (‰). Consumer markets use rates the
 * decimal-percent world cannot represent exactly (Swiss 8.1 / 2.6 / 3.8); ten
 * times the percent is always a whole number (81 / 26 / 38, Norwegian 250 / 150
 * / 120), so per-mille keeps the whole VAT computation in exact integer math.
 */
export type Permille = number;

/**
 * The consumer-market VAT breakdown of one gross line, mirroring the backend
 * `TaxDetail`: `net + vat === gross`, with the sign carried through so a credit
 * line stays a signed, never-dropped bucket.
 */
export type VatBreakdown = Readonly<{
  gross: Money;
  net: Money;
  vat: Money;
  ratePermille: Permille;
}>;

const CURRENCY_TO_MARKET: Readonly<Record<ConsumerCurrency, ConsumerMarket>> = {
  CHF: 'CH',
  NOK: 'NO',
};

function assertConsumerCurrency(
  currency: string,
): asserts currency is ConsumerCurrency {
  if (!Object.prototype.hasOwnProperty.call(CURRENCY_TO_MARKET, currency)) {
    throw new MoneyError(
      'unknown-currency',
      `Unknown consumer currency: ${currency}`,
    );
  }
}

/** The charging market that owns a currency — never guessed from device state. */
export function marketForCurrency(
  currency: ConsumerCurrency,
): ConsumerMarket {
  assertConsumerCurrency(currency);
  return CURRENCY_TO_MARKET[currency];
}

/** The currency a market charges in, taken from the single market contract. */
export function currencyForMarket(market: ConsumerMarket): ConsumerCurrency {
  return getConsumerMarketProfile(market).currency;
}

/** Constructs a validated minor-unit money value (safe-integer minor units). */
export function makeMoney(
  minor: number,
  currency: ConsumerCurrency,
): Money {
  assertMinorAmount(minor);
  assertConsumerCurrency(currency);
  return { minor, currency };
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new MoneyError(
      'currency-mismatch',
      `Cannot combine ${a.currency} with ${b.currency}.`,
    );
  }
}

function combineMoney(a: Money, b: Money, minor: number): Money {
  assertSameCurrency(a, b);
  assertMinorAmount(minor);
  return { minor, currency: a.currency };
}

/** Adds two same-currency amounts; a currency mismatch fails closed. */
export function addMoney(a: Money, b: Money): Money {
  return combineMoney(a, b, a.minor + b.minor);
}

/** Subtracts two same-currency amounts; a currency mismatch fails closed. */
export function subtractMoney(a: Money, b: Money): Money {
  return combineMoney(a, b, a.minor - b.minor);
}

function assertQuantity(quantity: number): void {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new MoneyError(
      'invalid-quantity',
      'Quantity must be a non-negative safe integer.',
    );
  }
}

/** Multiplies an amount by an integer line quantity, staying in minor units. */
export function multiplyMoneyByQuantity(
  amount: Money,
  quantity: number,
): Money {
  assertQuantity(quantity);
  const minor = amount.minor * quantity;
  assertMinorAmount(minor);
  return { minor, currency: amount.currency };
}

function assertPermille(ratePermille: Permille): void {
  if (!Number.isSafeInteger(ratePermille) || ratePermille < 0) {
    throw new MoneyError(
      'invalid-vat-rate',
      'VAT rate must be a non-negative integer per-mille value.',
    );
  }
}

/**
 * Splits a gross line into net + VAT using the backend per-line-floor rule
 * (`OrderModelBuilder`): `net = floor(gross / (1 + rate))`, `vat = gross - net`,
 * with the floor taken on the whole line. Backend money math runs in exact
 * decimal; per-mille keeps this in exact integer arithmetic that reproduces it
 * byte-for-byte for every representable consumer amount. The sign is carried on
 * both parts so `net + vat === gross` holds for credits too.
 */
export function vatFromGross(
  gross: Money,
  ratePermille: Permille,
  mode: 'line-floor' = 'line-floor',
): VatBreakdown {
  assertMinorAmount(gross.minor);
  assertConsumerCurrency(gross.currency);
  assertPermille(ratePermille);
  if (mode !== 'line-floor') {
    throw new MoneyError(
      'invalid-vat-rate',
      `Unsupported VAT mode: ${String(mode)}`,
    );
  }

  const sign = gross.minor < 0 ? -1 : 1;
  const absoluteGross = Math.abs(gross.minor);
  const netMinor =
    sign * Math.floor((absoluteGross * 1000) / (1000 + ratePermille));
  const vatMinor = gross.minor - netMinor;

  return {
    gross,
    net: { minor: netMinor, currency: gross.currency },
    vat: { minor: vatMinor, currency: gross.currency },
    ratePermille,
  };
}

/**
 * The ONE consumer money formatter (per FRONTEND-PLATFORM-SPEC XXVI): a
 * deterministic, market-contract render that is identical on Hermes, browsers,
 * Node, receipts, and snapshots. It intentionally does not consult runtime
 * locale data, so output never drifts with the device's ICU build.
 */
export function formatMoney(money: Money): string {
  assertConsumerCurrency(money.currency);
  return formatMoneyMinor(money.minor, marketForCurrency(money.currency));
}
