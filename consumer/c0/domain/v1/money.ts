import {
  getConsumerMarketProfile,
  type ConsumerMarket,
} from './market';

export type MoneyErrorCode =
  | 'invalid-minor-amount'
  | 'invalid-rounding-increment';

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
