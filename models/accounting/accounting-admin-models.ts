import {
  AccountingSystem,
  AccountRole,
  AccountingPostingKind,
  AccountingPostingStatus,
  InvoiceSendMethod
} from '../../enums';

// The provider-neutral accounting administration contract (AccountingAdminController). Field names
// are the camelCase of the backend C# models in WebApi/Models/Accounting; enums serialize as their
// member names.
//
// The admin surface is driven by capabilities and by the role list, never by a branch per system —
// that is the whole point of the seam, so a third accounting system needs no UI change.

// What one accounting system can and cannot do, as data. Every flag is a claim about an external
// API, not a preference.
export class AccountingCapabilities {
  canCreateLedgerAccounts: boolean;
  canReadChartOfAccounts: boolean;
  // Connecting needs an interactive OAuth2 consent rather than a pasted token.
  requiresOAuthConsent: boolean;
  requiresBankAccountSelection: boolean;
  // Every sales line must name its income account (Fiken). Tripletex cannot set one per line at all.
  requiresIncomeAccountPerLine: boolean;
  supportsDailySettlement: boolean;
  supportsSettlementAttachment: boolean;
  supportsPayoutPosting: boolean;
  supportsCorrectionPosting: boolean;
  supportsReversal: boolean;
  supportsBulkInvoiceRead: boolean;
  supportsInvoicing: boolean;
  hasServerSideIdempotencyKey: boolean;
  requiresSerializedCalls: boolean;
  maxRequestsPerSecond: number;
  maxConcurrentRequests: number;
  // A closed accounting period rejects postings permanently, with no API to reopen it. Where this
  // is true a late settlement is an admin task, never a retry.
  locksClosedPeriods: boolean;
  maxClaimHold: string;
  sendMethods: InvoiceSendMethod[];
}

// One account role a provider needs, and enough context for an admin to fill it in.
export class AccountRoleRequirement {
  role: AccountRole;
  // The VatCategory member name or payment provider the role is qualified by; empty when it is not.
  qualifier: string;
  description: string;
  // The account code currently mapped, or null when the role is unfilled.
  accountCode: string | null;
  // A standard-chart suggestion (NS 4102) for an unfilled role. A suggestion only.
  suggestedAccountCode: string | null;
  // True when the provider can create the suggested account itself.
  canBeCreated: boolean;
  // False when the settlement kinds this store actually posts do not need the role.
  required: boolean;
  // Only meaningful where capabilities.requiresIncomeAccountPerLine is true. The backend accepts it
  // on the way in (SaveAccountRoleModel) and may not echo it back on every provider.
  incomeAccountCode?: string | null;
}

// A step only a human can take, in the provider's own product.
export class AccountingOnboardingTask {
  key: string;
  title: string;
  detail: string;
  done: boolean;
}

// One row of a store's posting history.
export class AccountingPostingLogModel {
  // NOT SENT BY THE BACKEND YET. AccountingPostingLogModel carries no key, yet the retry endpoint is
  // addressed by AccountingPostingLogId — so a client cannot retry a row it was shown, only an id it
  // was told out of band. Typed as optional so the row-level retry lights up the day the projection
  // includes it.
  accountingPostingLogId?: number;
  provider: AccountingSystem;
  kind: AccountingPostingKind;
  businessDate: string;
  externalKey: string;
  // The accounting system's own id for the document, when it returned one.
  externalId: string | null;
  status: AccountingPostingStatus;
  error: string | null;
  postedUtc: string | null;
}

// A store's connection to its accounting system, in the one shape the admin surface reads for
// every provider.
export class AccountingConnectionStatus {
  system: AccountingSystem;
  // False when the store has never been connected to this system at all.
  exists: boolean;
  isActive: boolean;
  verified: boolean;
  lastVerifiedUtc: string | null;
  // The provider's identifier for the company: a company id, a slug.
  externalCompanyRef: string | null;
  externalCompanyName: string | null;
  lastError: string | null;
  missingRoles: AccountRoleRequirement[];
  createdAccounts: string[];
  manualTasks: AccountingOnboardingTask[];
  recentPostings: AccountingPostingLogModel[];
  // NOT SENT BY THE BACKEND YET. No accounting-admin endpoint returns AccountingCapabilities as of
  // the AccountingProviderSeam release, so a capability-driven client has to fall back to a local
  // table keyed by system until one does. Typed here so the fallback disappears the day the status
  // response carries it.
  capabilities?: AccountingCapabilities;
}

// A store's posting history summed, in provider-neutral terms.
export class AccountingReconciliation {
  storeId: number;
  // Null when the figures span every system the store has ever posted through.
  system: AccountingSystem | null;
  onlineGrossOre: number;
  posGrossOre: number;
  paidOutGrossOre: number;
  correctedGrossOre: number;
  // Online turnover booked but not yet settled by a payment provider.
  onlineResidualOre: number;
  failedPostings: number;
  // Postings a closed accounting period refused. Separate from failures because they are NOT
  // retryable: only a human, in the provider's own product, can reopen the period.
  periodLockedPostings: number;
  recent: AccountingPostingLogModel[];
}

// One row of the role map on the way in. A blank accountCode DELETES the mapping rather than
// storing emptiness, so "not configured" has exactly one representation.
export class SaveAccountRoleModel {
  role: AccountRole;
  qualifier?: string;
  accountCode: string;
  // Only meaningful where the provider requires an income account per line.
  incomeAccountCode?: string;
}

// The body of a manual payout re-run. Amounts are ore.
export class RerunPayoutModel {
  pspQualifier: string;
  payoutId: string;
  settlementDate: string;
  payoutOre: number;
  feeOre: number;
}

// Outcome of one posting run (backend AccountingExportResult). Named for the posting rather than
// the export because the Tripletex-era AccountingExportResult in models/tripletex is a different,
// older shape (target + numeric voucherId) still returned by /tripletex-admin.
export class AccountingPostingResult {
  system: AccountingSystem;
  success: boolean;
  // True when there was nothing to export that day — not a failure.
  skipped: boolean;
  // A string, not a number: Fiken returns two ids for one settlement and none for a free posting.
  externalId: string | null;
  externalVoucherNumber: string | null;
  message: string | null;
  warnings: string[];
}
