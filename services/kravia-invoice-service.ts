import { ICoreInitializer } from "../interfaces";
import { AdminKraviaCompany, AdminKraviaInvoiceRequest, AdminKraviaInvoiceResult, AdminKraviaCompanyHistory } from "../models";
import { RequestService } from "./request-service";

export class KraviaInvoiceService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetCompany(orgNo: string): Promise<AdminKraviaCompany> {
    const response = await this._requestService.GetRequest('/admin-kravia-invoices/company/' + encodeURIComponent(orgNo))
      .catch((error) => error?.response || error)
    const parsedResponse = this._requestService.TryParseResponseWithError(response?.response || response)
    if (parsedResponse.error) { throw new Error(parsedResponse.error || 'Kunne ikke hente bedriftsinformasjon') }
    return parsedResponse.data
  }

  // Superseded by InvoiceCustomerService.Search: this list is derived from past orders and carries
  // no accounting-system customer id. Kept for clients that have not moved over yet.
  public async GetCompanyHistory(storeId: number): Promise<Array<AdminKraviaCompanyHistory>> {
    const response = await this._requestService.GetRequest('/admin-kravia-invoices/stores/' + storeId + '/company-history')
      .catch((error) => error?.response || error)
    const parsedResponse = this._requestService.TryParseResponseWithError(response?.response || response)
    if (parsedResponse.error) { throw new Error(parsedResponse.error || 'Kunne ikke hente tidligere bedriftskunder') }
    return parsedResponse.data || []
  }

  public async SendInvoice(payload: AdminKraviaInvoiceRequest): Promise<AdminKraviaInvoiceResult> {
    const response = await this._requestService.PostRequest('/admin-kravia-invoices/send', payload)
      .catch((error) => error?.response || error)
    const parsedResponse = this._requestService.TryParseResponseWithError(response?.response || response)
    if (parsedResponse.error) { throw new Error(parsedResponse.error || 'Kunne ikke sende faktura') }
    return parsedResponse.data
  }
}
