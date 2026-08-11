/**
 * Framework-free consumer-domain seam. Each export is versioned so consumers
 * opt into contract changes deliberately rather than inheriting app internals.
 */
export {
  authorizeStoreForManifestV1,
  CH_MONEY_PROFILE_V1,
  formatMarketMoneyV1,
  formatMoneyV1,
  isPhoneNumberValidV1,
  LEGACY_CONSUMER_MONEY_FORMAT_V1,
  NO_MONEY_PROFILE_V1,
  normalizePhoneNumberV1,
  resolveMoneyProfileV1,
} from "./v1";

export type {
  CandidateStoreV1,
  MarketMoneyFormattingResultV1,
  MoneyFormatOptionsV1,
  MoneyFormatV1,
  MoneyMarketV1,
  MoneyProfileResolutionV1,
  MoneyProfileV1,
  PhoneInputV1,
  PhoneMarketV1,
  PhoneNormalizationFailureV1,
  PhoneNormalizationResultV1,
  StoreManifestAuthorizationDenialV1,
  StoreManifestAuthorizationV1,
  StoreManifestV1,
  StoreScopeV1,
} from "./v1";
