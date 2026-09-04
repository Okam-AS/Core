// Fiken's OAuth2 connect handshake and the two selections that follow it (FikenOAuthController).
// Fiken is the one provider that cannot be connected by pasting a token: a personal API token in a
// third-party application is a terms-of-service violation, so the merchant consents in Fiken's own
// product and the flow leaves the admin app.

export class FikenConnectStart {
  // Fiken's authorize URL, including the state Okam minted. The browser is sent here.
  authorizeUrl: string;
  // The single-use state, echoed for the caller's own bookkeeping. It is consumed by the callback,
  // never sent again by the client.
  state: string;
}

// What the callback appends to the return URL, alongside ?storeId=. `choose-company` means the
// consent succeeded but the account holds several companies and none could be picked for the
// merchant; `no-companies` means none of them exposes a usable slug.
export type FikenConnectResult = 'connected' | 'choose-company' | 'no-companies' | 'denied' | 'error';

// One company on the connected Fiken account. Nothing can be posted until one is selected, because
// the company slug is part of every Fiken write path.
export class FikenCompany {
  slug: string;
  name: string;
  organizationNumber: string | null;
  // False without Fiken's paid API add-on, in which case every business call answers 403.
  hasApiAccess: boolean;
  testCompany: boolean;
}

export class FikenSelectCompanyModel {
  storeId: number;
  companySlug: string;
}

// A bank account as Fiken knows it. `accountCode` is the "1920:XXXXX" reskontro form Fiken posts
// payments against — it is NOT the account number from the chart of accounts, and not the bank
// account number either.
export class FikenBankAccount {
  accountCode: string;
  name: string;
  accountNumber: string | null;
  type: string | null;
  inactive: boolean;
}

export class FikenBankAccountModel {
  bankAccountCode: string;
}
