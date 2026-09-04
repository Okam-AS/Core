import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { FikenConnectStart, FikenSelectCompanyModel } from '../models';

// Fiken's OAuth2 connect handshake. Fiken is the one provider that cannot be connected by pasting a
// token: the merchant has to consent in Fiken's own product, so the flow leaves the admin app.
//
// HAND-TYPED, NOT GENERATED: these routes are being added in a parallel branch and are not in
// docs/api/swagger.json yet — verify them against FikenConnectController once it lands.
export class FikenConnectService {
  private _requestService: RequestService;

  constructor (coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // Mints the authorize URL (with Okam's state) for the store. The caller navigates the browser
  // there; Fiken redirects back to the admin return URL with ?fiken=connected|error&storeId=.
  // The callback is a browser redirect, never an XHR, so it is deliberately not modelled here.
  public async Start (storeId: number): Promise<FikenConnectStart> {
    const response = await this._requestService.GetRequest('/fiken/connect/start?storeId=' + storeId)
      .catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || 'Kunne ikke starte Fiken-tilkoblingen'); }
    return parsed.data;
  }

  // Only needed when the consented account holds several companies: nothing can be posted until one
  // of them is chosen, because the company slug is part of every Fiken write path.
  public async SelectCompany (storeId: number, companySlug: string): Promise<void> {
    const model: FikenSelectCompanyModel = { storeId, companySlug };
    const response = await this._requestService.PostRequest('/fiken/connect/select-company', model)
      .catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || 'Kunne ikke velge Fiken-selskap'); }
    return parsed.data;
  }
}
