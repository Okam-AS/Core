/**
 * The C1 workflow retains the C0 market-scoped E.164 and six-digit OTP rules
 * exactly. New markets require a new contract version rather than a fallback.
 */
export {
  normalizePhoneNumber,
  normalizeVerificationCode,
  parsePhoneNumber,
  PhoneInputError,
  type E164PhoneNumber,
  type PhoneInput,
  type PhoneInputErrorCode,
  type PhoneNormalizationResult,
  type VerificationCode,
} from '../../../c0/application/v1/phone';
