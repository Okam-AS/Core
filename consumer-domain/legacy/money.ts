import type { MoneyFormatV1 } from "../v1";

/**
 * Compatibility adapter for helpers/tools.ts. It preserves its historical
 * permissive Number/string-slicing behavior while the public V1 formatter
 * requires safe integer minor units.
 */
export function formatLegacyPriceLabelV1(
  totalPrice: Number,
  format: MoneyFormatV1,
  hideFractionIfZero: Boolean = false,
  hideAffixes: Boolean = false,
): string {
  const wholeAmount = !totalPrice
    ? "0"
    : totalPrice.toString().slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/gu, format.thousandSeparator) || "0";
  const fractionAmount = !totalPrice ? "00" : totalPrice.toString().slice(-2);
  const normalizedFraction = fractionAmount.length < 2 ? "00" : fractionAmount;
  const fraction = !hideFractionIfZero || parseInt(normalizedFraction, 10) > 0
    ? `${format.decimalSeparator}${normalizedFraction}`
    : "";

  return `${hideAffixes ? "" : format.prefix}${wholeAmount}${fraction}${hideAffixes ? "" : format.suffix}`;
}
