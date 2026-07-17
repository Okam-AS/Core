import {
  parseConsumerMarket,
  type ConsumerMarket,
} from '../../domain/v1';

export type PhoneInput = Readonly<{
  market: ConsumerMarket;
  value: string;
}>;

declare const e164PhoneNumberBrand: unique symbol;
export type E164PhoneNumber = string & {
  readonly [e164PhoneNumberBrand]: true;
};

declare const verificationCodeBrand: unique symbol;
export type VerificationCode = string & {
  readonly [verificationCodeBrand]: true;
};

export type PhoneInputErrorCode = 'invalid-code' | 'invalid-phone';

export class PhoneInputError extends Error {
  override readonly name = 'PhoneInputError';

  constructor(
    readonly code: PhoneInputErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export type PhoneNormalizationResult =
  | {
      ok: true;
      value: E164PhoneNumber;
    }
  | {
      ok: false;
      code: 'invalid-phone';
      message: string;
    };

const FORMATTED_PHONE = /^[+\d\s().-]+$/u;
const INVALID_PHONE_MESSAGE =
  'Enter a valid phone number for the selected market.';

function invalidPhoneResult(): PhoneNormalizationResult {
  return {
    ok: false,
    code: 'invalid-phone',
    message: INVALID_PHONE_MESSAGE,
  };
}

/**
 * Converts explicitly market-scoped human input to E.164. Market is never
 * inferred from currency, locale, store data, or the number itself.
 */
export function parsePhoneNumber(input: PhoneInput): PhoneNormalizationResult {
  const market = parseConsumerMarket(input.market);
  const raw = input.value.trim();
  if (!raw || !FORMATTED_PHONE.test(raw)) {
    return invalidPhoneResult();
  }

  let digits = raw.replace(/\D/gu, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (market === 'NO') {
    if (digits.length === 10 && digits.startsWith('47')) {
      digits = digits.slice(2);
    } else if (raw.startsWith('+') || raw.startsWith('00')) {
      return invalidPhoneResult();
    }

    if (
      digits.length !== 8 ||
      !/^\d{8}$/u.test(digits) ||
      Number(digits) <= 40_000_000
    ) {
      return invalidPhoneResult();
    }
    return {
      ok: true,
      value: `+47${digits}` as E164PhoneNumber,
    };
  }

  if (digits.length === 11 && digits.startsWith('41')) {
    digits = digits.slice(2);
  } else if (raw.startsWith('+') || raw.startsWith('00')) {
    return invalidPhoneResult();
  } else if (digits.length === 10 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (
    digits.length !== 9 ||
    !/^\d{9}$/u.test(digits) ||
    digits.startsWith('0')
  ) {
    return invalidPhoneResult();
  }

  return {
    ok: true,
    value: `+41${digits}` as E164PhoneNumber,
  };
}

export function normalizePhoneNumber(input: PhoneInput): E164PhoneNumber {
  const result = parsePhoneNumber(input);
  if (!result.ok) {
    throw new PhoneInputError(result.code, result.message);
  }
  return result.value;
}

export function normalizeVerificationCode(value: string): VerificationCode {
  const code = value.trim();
  if (!/^\d{6}$/u.test(code)) {
    throw new PhoneInputError(
      'invalid-code',
      'The verification code must contain six digits.',
    );
  }
  return code as VerificationCode;
}
