import { ICoreInitializer } from '../interfaces';
import {
  AccountingConnectionStatus,
  FikenBankAccount,
  FikenCompany,
  FikenConnectStart,
  FikenSelectCompanyModel
} from '../models';
import { RequestService } from './request-service';

// Fiken's OAuth2 connect handshake (FikenOAuthController). Fiken is the one provider that cannot be
// connected by pasting a token: a personal API token in a third-party application is a
// terms-of-service violation, so the merchant consents in Fiken's own product.
//
// Every method here authorises on the store, so a store admin sets up their own connection.
export class FikenConnectService {
  private _requestService: RequestService;

  constructor (coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // Mints the state and answers with the authorize URL as JSON rather than a 302: a browser
  // following a redirect out of an XHR drops the Authorization header and lands on a login page.
  // The caller navigates the browser to `authorizeUrl` itself.
  //
  // `returnUrl` is where the merchant should end up afterwards. The backend keeps it but does NOT
  // redirect to it verbatim — a target that arrived on a query string is an open redirect — so the
  // browser comes back to the configured admin URL with ?storeId= and
  // ?fiken=connected|choose-company|no-companies|denied|error.
  public Start (storeId: number, returnUrl: string): Promise<FikenConnectStart> {
    return this.Send(
      this._requestService.GetRequest(
        '/fiken/connect/start?storeId=' + storeId + '&returnUrl=' + encodeURIComponent(returnUrl)),
      'Kunne ikke starte Fiken-tilkoblingen');
  }

  // The companies the consented account holds. Only the ones with a slug can be selected.
  public ListCompanies (storeId: number): Promise<FikenCompany[]> {
    return this.Send(
      this._requestService.GetRequest('/fiken/stores/' + storeId + '/companies'),
      'Kunne ikke hente Fiken-selskapene');
  }

  // Nothing can be posted until a company is chosen, because the slug is part of every Fiken write
  // path. A single-company account is bound by the callback and never reaches this.
  public SelectCompany (storeId: number, companySlug: string): Promise<AccountingConnectionStatus> {
    const model: FikenSelectCompanyModel = { storeId, companySlug };
    return this.Send(
      this._requestService.PostRequest('/fiken/connect/select-company', model),
      'Kunne ikke velge Fiken-selskap');
  }

  // Fiken posts every payment against a bank account it knows by its own accountCode ("1920:XXXXX"),
  // not by an account number from the chart of accounts.
  public ListBankAccounts (storeId: number): Promise<FikenBankAccount[]> {
    return this.Send(
      this._requestService.GetRequest('/fiken/stores/' + storeId + '/bank-accounts'),
      'Kunne ikke hente bankkontoene');
  }

  public SetBankAccount (storeId: number, bankAccountCode: string): Promise<AccountingConnectionStatus> {
    return this.Send(
      this._requestService.PostRequest('/fiken/stores/' + storeId + '/bank-account', { bankAccountCode }),
      'Kunne ikke lagre bankkontoen');
  }

  // The same provider-neutral status shape the accounting admin surface reads, including the
  // manualTasks checklist of what only a human can do in Fiken.
  public Status (storeId: number): Promise<AccountingConnectionStatus> {
    return this.Send(
      this._requestService.GetRequest('/fiken/stores/' + storeId + '/status'),
      'Kunne ikke hente Fiken-status');
  }

  // Revokes at Fiken and clears the stored credential. The local clear happens even when the
  // revocation call fails: leaving Okam able to post with a credential the merchant asked to be rid
  // of is the worse of the two failures.
  public Disconnect (storeId: number): Promise<void> {
    return this.Send(
      this._requestService.PostRequest('/fiken/stores/' + storeId + '/disconnect', {}),
      'Kunne ikke koble fra Fiken');
  }

  private async Send (request: Promise<any>, fallback: string): Promise<any> {
    const response = await request.catch(error => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || fallback); }
    return parsed.data;
  }
}
