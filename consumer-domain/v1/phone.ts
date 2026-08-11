/**
 * A market is chosen by the consumer surface (for example, from its selected
 * white-label store). It must never be inferred from a currency, locale, or
 * the phone number itself.
 */
export type PhoneMarketV1 = "CH" | "NO";

export type PhoneInputV1 = Readonly<{
  market: PhoneMarketV1;
  value: string;
}>;

export type PhoneNormalizationFailureV1 =
  | "empty"
  | "unsupported_market"
  | "unsupported_characters"
  | "invalid_country_prefix"
  | "invalid_national_number";

export type PhoneNormalizationResultV1 =
  | Readonly<{ ok: true; e164: string }>
  | Readonly<{ ok: false; reason: PhoneNormalizationFailureV1 }>;

const FORMATTED_PHONE = /^[+\d\s().-]+$/u;

/**
 * Normalizes a market-scoped human phone number to the E.164 representation
 * expected by OkamAPI. Invalid input is data, not an exception, so UI and
 * transport layers can decide how to present it without coupling to this seam.
 */
export function normalizePhoneNumberV1(input: PhoneInputV1): PhoneNormalizationResultV1 {
  // Runtime data can bypass the TypeScript union (JSON, JS, old clients). Never
  // let an unknown market fall through to the Swiss branch.
  if (input.market !== "CH" && input.market !== "NO") {
    return { ok: false, reason: "unsupported_market" };
  }

  const raw = input.value.trim();
  if (!raw) return { ok: false, reason: "empty" };
  if (!FORMATTED_PHONE.test(raw)) return { ok: false, reason: "unsupported_characters" };

  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (input.market === "NO") {
    if (digits.length === 10 && digits.startsWith("47")) {
      digits = digits.slice(2);
    } else if (raw.startsWith("+") || raw.startsWith("00")) {
      return { ok: false, reason: "invalid_country_prefix" };
    }

    if (digits.length !== 8 || !/^\d{8}$/u.test(digits) || Number(digits) <= 40_000_000) {
      return { ok: false, reason: "invalid_national_number" };
    }
    return { ok: true, e164: `+47${digits}` };
  }

  if (digits.length === 11 && digits.startsWith("41")) {
    digits = digits.slice(2);
  } else if (raw.startsWith("+") || raw.startsWith("00")) {
    return { ok: false, reason: "invalid_country_prefix" };
  } else if (digits.length === 10 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 9 || !/^\d{9}$/u.test(digits) || digits.startsWith("0")) {
    return { ok: false, reason: "invalid_national_number" };
  }
  return { ok: true, e164: `+41${digits}` };
}

export function isPhoneNumberValidV1(input: PhoneInputV1): boolean {
  return normalizePhoneNumberV1(input).ok;
}
