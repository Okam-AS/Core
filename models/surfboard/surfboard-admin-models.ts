// Response shapes for the Surfboard partner-management (onboarding) API, as re-serialized by the
// Okam backend (SurfboardAdminController). Field names are the camelCase of the backend C# models.

// A merchant under the Okam partner (GET /surfboard-admin/merchants).
export class SurfboardMerchant {
  merchantId: string;
  partnerId: string;
  merchantName: string;
  merchantLanguage: string;
  merchantLogoUrl: string;
  email: string;
  companyId: string;
  countryCode: string;
  phoneNumber: string;
  currencyCode: string;
  createdAt: string;
  lastTransactionAt: string;
  totalNumberOfTransaction: string;
  totalAmountOfTransaction: string;
}

// A KYB onboarding application (GET /surfboard-admin/applications).
export class SurfboardApplication {
  applicationId: string;
  country: string;
  corporateId: string;
  applicationStatus: string;
  legalName: string;
  createdAt: string;
  lastUpdatedAt: string;
  webKybUrl: string;
}

// Live status of a single application (GET /surfboard-admin/applications/{id}/status and the
// response of POST /surfboard-admin/stores/{id}/sync). Named ...Result to avoid colliding with the
// SurfboardApplicationStatus enum (application-status string values). Mirrors backend
// SurfboardApplicationStatusResult.
export class SurfboardApplicationStatusResult {
  applicationId: string;
  webKybUrl: string;
  applicationStatus: string;
  merchantId: string;
  storeId: string;
  onlineOnboardingStatus: string;
}

// Result of onboarding a store (POST /surfboard-admin/stores/{id}/onboard).
export class SurfboardCreateMerchantResult {
  applicationId: string;
  webKybUrl: string;
  shortLinkUrl: string;
  merchantId: string;
  storeId: string;
}

// Online (payment-page) info for a store. Note: field names are the camelCase of the backend C#
// properties — the backend's [JsonPropertyName] (System.Text.Json) attributes are ignored by the
// global Newtonsoft serializer, so the wire uses merchantWebshopUrl (not ...URL), etc.
export class SurfboardOnlineInfo {
  merchantWebshopUrl: string;
  paymentPageHostUrl: string;
  termsAndConditionsUrl: string;
  privacyPolicyUrl: string;
}

// A store under a merchant (GET /surfboard-admin/merchants/{id}/stores and .../stores/{storeId}).
export class SurfboardStoreDetails {
  storeId: string;
  merchantId: string;
  name: string;
  status: string;
  onlineOnboardingStatus: string;
  email: string;
  phone: string;
  onlineInfo: SurfboardOnlineInfo | null;
}

// Result of creating a store under a merchant (POST /surfboard-admin/merchants/{id}/stores). The
// domain-verification keys are populated for production merchants only.
export class SurfboardCreateStoreResult {
  storeId: string;
  merchantId: string;
  name: string;
  merchantUrlDomainVerificationKey: string;
  paymentPageUrlDomainVerificationKey: string;
}

// A terminal under a store (GET /surfboard-admin/merchants/{m}/stores/{s}/terminals).
export class SurfboardTerminal {
  terminalId: string;
  terminalType: string;
  terminalStatus: string;
  serialNo: string;
  storeId: string;
  terminalName: string;
  terminalPaymentMethods: string[];
  lastAliveAt: string;
}

// Result of registering an in-store device (POST /surfboard-admin/terminals/register).
export class SurfboardRegisterDeviceResult {
  terminalId: string;
  registrationStatus: string;
}

// Org data looked up from Brreg to prefill the onboarding form (GET /surfboard-admin/brreg/{org}).
export class SurfboardBrregPrefill {
  corporateId: string;
  legalName: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  countryCode: string;
}
