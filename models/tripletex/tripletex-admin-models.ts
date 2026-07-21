// Request/response shapes for the Tripletex direct-accounting admin API, as re-serialized by the
// Okam backend (TripletexAdminController). Field names are the camelCase of the backend C# models;
// enums serialize as their member names (StringEnumConverter), so token type / voucher kind / status
// are strings.

export type TripletexTokenType = 'CompanyJwt' | 'EmployeeToken';
export type TripletexVoucherKind = 'OnlineDaily' | 'Pos' | 'Payout';
export type TripletexVoucherStatus = 'Posted' | 'Failed' | 'Reversed' | 'Skipped';
export type AccountingExportTarget = 'EmonkeyWebhook' | 'Tripletex';

// Create/update a store's Tripletex connection (POST /tripletex-admin/stores/{id}/connection).
export class UpsertTripletexConnectionModel {
  apiToken: string;
  tokenType?: TripletexTokenType; // auto-detected from the token shape when omitted
  companyId?: string;
  isActive?: boolean;
  bankAccountNumber?: string;
  feeAccountNumber?: string;
  cashboxAccountNumber?: string;
  cashDifferenceAccountNumber?: string;
  bankDepositAccountNumber?: string;
  roundingAccountNumber?: string;
  dinteroIntermediaryAccountNumber?: string;
  surfboardIntermediaryAccountNumber?: string;
  // Sales/VAT/tips/receivables accounts (persisted to the store's shared AccountingConfiguration).
  salesAccount0Percent?: string;
  salesAccount12Percent?: string;
  salesAccount15Percent?: string;
  salesAccount25Percent?: string;
  tipsAccount?: string;
  receivablesAccount?: string;
  // Whether the store's accounting export is enabled. Null leaves the stored flag unchanged, so
  // editing account numbers never silently resumes a paused export.
  accountingEnabled?: boolean;
}

// One recent voucher for the at-a-glance connection health list.
export class TripletexVoucherLogEntry {
  kind: TripletexVoucherKind;
  businessDate: string;
  externalKey: string;
  tripletexVoucherId?: number;
  status: TripletexVoucherStatus;
  error?: string;
  postedUtc?: string;
}

// Connection status (GET /tripletex-admin/stores/{id}/status, and the response of upsert/validate).
export class TripletexConnectionStatus {
  exists: boolean;
  isActive: boolean;
  verified: boolean;
  tokenType: TripletexTokenType;
  companyId: string;
  tripletexEmployeeId?: number;
  tripletexCompanyId?: number;
  lastVerifiedUtc?: string;
  lastError?: string;
  missingAccounts: string[];
  // Accounts auto-created in the chart of accounts during the last save (empty on status/validate).
  createdAccounts: TripletexCreatedAccount[];
  recentVouchers: TripletexVoucherLogEntry[];
  // True once a token is stored, so the form can re-save (edit accounts) without re-pasting it.
  hasToken: boolean;
  // Saved account numbers, so the edit form hydrates with real values instead of resetting to defaults.
  bankAccountNumber?: string;
  feeAccountNumber?: string;
  cashboxAccountNumber?: string;
  cashDifferenceAccountNumber?: string;
  bankDepositAccountNumber?: string;
  roundingAccountNumber?: string;
  dinteroIntermediaryAccountNumber?: string;
  surfboardIntermediaryAccountNumber?: string;
  salesAccount0Percent?: string;
  salesAccount12Percent?: string;
  salesAccount15Percent?: string;
  salesAccount25Percent?: string;
  tipsAccount?: string;
  receivablesAccount?: string;
  // Current stored state of the accounting-export toggle, for hydrating the form checkbox.
  accountingConfigEnabled: boolean;
}

// An account that onboarding auto-created in the Tripletex chart of accounts.
export class TripletexCreatedAccount {
  number: string;
  name: string;
}

// Outcome of exporting one day/Z-report/payout to one target.
export class AccountingExportResult {
  target: AccountingExportTarget;
  success: boolean;
  skipped: boolean;
  voucherId?: number;
  externalVoucherNumber?: string;
  message?: string;
  warnings: string[];
}

// A live voucher fetched from Tripletex for verification
// (GET /tripletex-admin/stores/{id}/voucher/{voucherId}). Mirrors Tripletex's own voucher shape.
export class TripletexVoucherAccount {
  id: number;
  number: number;
  name: string;
}

export class TripletexVoucherVatType {
  id: number;
  name: string;
}

export class TripletexVoucherPosting {
  id: number;
  row: number;
  description: string;
  amount: number;
  amountGross: number;
  systemGenerated: boolean;
  account?: TripletexVoucherAccount;
  vatType?: TripletexVoucherVatType;
}

export class TripletexVoucher {
  id: number;
  number?: number;
  year?: number;
  date: string;
  description: string;
  externalVoucherNumber?: string;
  postings: TripletexVoucherPosting[];
}

// Coarse reconciliation health signal (GET /tripletex-admin/stores/{id}/reconciliation).
export class TripletexPayoutReconciliation {
  storeId: number;
  onlineGrossOre: number;
  posGrossOre: number;
  paidOutGrossOre: number;
  onlineResidualOre: number;
  failedVouchers: number;
}
