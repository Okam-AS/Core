// Company Meals — the employee-facing funding surface (backend spec 20 §5, ops 13/14 plus the
// my-companies entry read). Amounts are integer MINOR units, the same convention as every other
// amount in core; there are no floats on this path.

/** One company the signed-in guest may order on the tab of. `storeId` is null until an agreement exists. */
export class MealsCompany {
  companyId: string;
  legalName: string;
  displayName: string;
  membershipId: string;
  role: string;
  // "Active" | "Revoked" | … — carried rather than filtered, because a revoked employee must still
  // be able to read their own history. Only an Active membership may be offered the tender.
  membershipState: string;
  storeId?: number;
  currency: string;
}

export class MealsCompaniesResponse {
  companies: Array<MealsCompany> = [];
}

/** Eligibility + remaining company contribution for the active period: what the payer strip renders. */
export class MealsContext {
  companyId: string;
  programId: string;
  policyVersion: number;
  storeId: number;
  currency: string;

  // True only when the caller is an active member AND now is inside the policy window.
  eligible: boolean;
  // A stable MEALS_* code when not eligible; null when eligible.
  ineligibleReasonCode?: string;

  allowanceMinor: number;
  remainingAllowanceMinor: number;
  periodKey: string;

  localWindowStartMinutes: number;
  localWindowEndMinutes: number;
  eligibleWeekdaysMask: number;
  timeZoneId: string;
}

export class CreateMealsQuoteRequest {
  companyId: string;
  // What the company is asked to fund, in currency minor units.
  cartTotalMinor: number;
  currency: string;
  // See helpers/meals-quote-hash — the algorithm is pinned there, not chosen at the call site.
  quoteHash: string;
}

/**
 * A minted funding reservation. `authorizationToken` is returned ONCE at creation (the backend
 * persists only its hash) and is the value cart completion must carry, so it is never written to
 * disk here and never logged.
 */
export class MealsQuote {
  reservationId: string;
  authorizationToken: string;
  reservedCapMinor: number;
  currency: string;
  periodKey: string;
  expiresAtUtc: string;
}
