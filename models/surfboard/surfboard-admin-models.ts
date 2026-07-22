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
  // Device-health fields (present on fetch-by-id; may be absent in the list response).
  isCharging?: boolean;
  batteryPercentage?: number;
  powerSource?: string; // EXTERNAL_POWER | BATTERY
  deviceNetwork?: string; // WIFI | GSM
  turnOnTime?: string;
}

// GET /stores/{storeId}/cashpoints/{cashPointId}/terminal-status — connectivity/health for the
// terminal bound to a cash point (POS status badge + cash-point settings). Provider-neutral:
// a Dintero register reports provider + bound only.
export class CashPointTerminalStatus {
  provider: string; // Surfboard | Dintero
  bound: boolean;
  terminalId: string | null;
  terminalName: string | null;
  serialNo: string | null;
  terminalStatus: string | null; // REGISTERED | ACTIVE | IN_ACTIVE | DE_REGISTERED
  lastAliveAt: string | null;
  online: boolean | null; // null = liveness unknown
  secondsSinceAlive: number | null;
  deviceNetwork: string | null; // WIFI | GSM
  batteryPercentage: number | null;
  isCharging: boolean | null;
  powerSource: string | null; // EXTERNAL_POWER | BATTERY
  statusError: string | null; // set when the provider status lookup failed
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

// GET /surfboard-admin/merchants/{merchantId}/stores/{storeId}/device-registration — the short-lived
// code the operator types into the terminal to pair it with the store, plus a deep link carrying the
// same code for QR pairing.
export class SurfboardDeviceRegistrationCode {
  registrationCode: string;
  registrationLink: string;
}
