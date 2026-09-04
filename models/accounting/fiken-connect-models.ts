// Fiken's OAuth2 connect handshake.
//
// HAND-TYPED, NOT GENERATED: these three endpoints are being added in a parallel branch and are not
// in docs/api/swagger.json yet. The names below are the agreed contract — verify them against
// FikenConnectController once it lands.
export class FikenConnectStart {
  // Fiken's authorize URL, including the state Okam minted. The browser is sent here; Fiken
  // redirects back to the admin return URL with ?fiken=connected|error&storeId=.
  authorizeUrl: string;
}

// One company on the connected Fiken account. Only needed when the account has several, in which
// case nothing can be posted until one is selected.
export class FikenCompany {
  slug: string;
  name: string;
  organizationNumber?: string;
}

export class FikenSelectCompanyModel {
  storeId: number;
  companySlug: string;
}
