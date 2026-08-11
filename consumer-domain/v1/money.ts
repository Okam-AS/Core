export type MoneyFormatV1 = Readonly<{
  prefix: string;
  suffix: string;
  decimalSeparator: string;
  thousandSeparator: string;
  fractionDigits: number;
  negativeSign?: string;
}>;

export type MoneyFormatOptionsV1 = Readonly<{
  hideFractionIfZero?: boolean;
  hideAffixes?: boolean;
}>;

export type MoneyMarketV1 = "CH" | "NO";

export type MoneyProfileV1 = Readonly<{
  market: MoneyMarketV1;
  currency: "CHF" | "NOK";
  locale: "de-CH" | "nb-NO";
  format: MoneyFormatV1;
}>;

export type MoneyProfileResolutionV1 =
  | Readonly<{ ok: true; profile: MoneyProfileV1 }>
  | Readonly<{ ok: false; reason: "unsupported_market" | "currency_mismatch" }>;

export type MarketMoneyFormattingResultV1 =
  | Readonly<{ ok: true; formatted: string; profile: MoneyProfileV1 }>
  | Exclude<MoneyProfileResolutionV1, { ok: true }>;

/** The established Core consumer price presentation, expressed as a value. */
export const LEGACY_CONSUMER_MONEY_FORMAT_V1: MoneyFormatV1 = Object.freeze({
  prefix: "",
  suffix: ",–",
  decimalSeparator: ",",
  thousandSeparator: " ",
  fractionDigits: 2,
});

/**
 * Native-facing CH profile. Values below CHF 1'000 match the current native
 * menu formatter. Grouped values are an accepted dual-run presentation delta:
 * V1 applies de-CH apostrophe grouping while the current native toFixed path
 * emits no grouping. Native adoption must classify/approve that delta.
 */
export const CH_MONEY_PROFILE_V1: MoneyProfileV1 = Object.freeze({
  market: "CH",
  currency: "CHF",
  locale: "de-CH",
  format: Object.freeze({
    prefix: "CHF ",
    suffix: "",
    decimalSeparator: ".",
    thousandSeparator: "'",
    fractionDigits: 2,
    negativeSign: "-",
  }),
});

/** Native-facing NO profile, including nb-NO's non-breaking grouping/affix space. */
export const NO_MONEY_PROFILE_V1: MoneyProfileV1 = Object.freeze({
  market: "NO",
  currency: "NOK",
  locale: "nb-NO",
  format: Object.freeze({
    prefix: "",
    suffix: "\u00a0kr",
    decimalSeparator: ",",
    thousandSeparator: "\u00a0",
    fractionDigits: 2,
    negativeSign: "−",
  }),
});

function groupThousandsV1(whole: string, separator: string): string {
  return whole.replace(/\B(?=(\d{3})+(?!\d))/gu, separator);
}

function assertMoneyAmountV1(amountMinor: number): void {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new RangeError("amountMinor must be a safe integer expressed in minor units");
  }
}

function assertMoneyFormatV1(format: MoneyFormatV1): void {
  if (!Number.isInteger(format.fractionDigits) || format.fractionDigits < 0 || format.fractionDigits > 20) {
    throw new RangeError("fractionDigits must be an integer from 0 to 20");
  }
}

/**
 * Formats integer minor units deterministically without Intl, locale globals,
 * or a runtime currency database. The caller owns the explicit presentation
 * format. During dual-run, consumers compare this deterministic result against
 * their current presenter and explicitly classify intentional display deltas.
 */
export function formatMoneyV1(
  amountMinor: number,
  format: MoneyFormatV1,
  options: MoneyFormatOptionsV1 = {},
): string {
  assertMoneyAmountV1(amountMinor);
  assertMoneyFormatV1(format);

  const negative = amountMinor < 0;
  const digits = Math.abs(amountMinor).toString();
  const padded = format.fractionDigits > 0 ? digits.padStart(format.fractionDigits + 1, "0") : digits;
  const wholeDigits = format.fractionDigits > 0 ? padded.slice(0, -format.fractionDigits) : padded;
  const fractionDigits = format.fractionDigits > 0 ? padded.slice(-format.fractionDigits) : "";
  const whole = `${negative ? format.negativeSign ?? "-" : ""}${groupThousandsV1(wholeDigits, format.thousandSeparator)}`;
  const fraction = format.fractionDigits > 0 && !(options.hideFractionIfZero && /^0+$/u.test(fractionDigits))
    ? `${format.decimalSeparator}${fractionDigits}`
    : "";
  const affixes = options.hideAffixes ? ["", ""] : [format.prefix, format.suffix];

  return `${affixes[0]}${whole}${fraction}${affixes[1]}`;
}

/** Resolves only the two supported market/currency pairs; mismatches fail closed. */
export function resolveMoneyProfileV1(input: Readonly<{
  market: unknown;
  currency: unknown;
}>): MoneyProfileResolutionV1 {
  if (input.market !== "CH" && input.market !== "NO") {
    return { ok: false, reason: "unsupported_market" };
  }

  const profile = input.market === "CH" ? CH_MONEY_PROFILE_V1 : NO_MONEY_PROFILE_V1;
  if (input.currency !== profile.currency) {
    return { ok: false, reason: "currency_mismatch" };
  }
  return { ok: true, profile };
}

export function formatMarketMoneyV1(
  amountMinor: number,
  input: Readonly<{ market: unknown; currency: unknown }>,
  options: MoneyFormatOptionsV1 = {},
): MarketMoneyFormattingResultV1 {
  const resolution = resolveMoneyProfileV1(input);
  if (!resolution.ok) return resolution;
  return {
    ok: true,
    formatted: formatMoneyV1(amountMinor, resolution.profile.format, options),
    profile: resolution.profile,
  };
}
