import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { InvoiceCustomer, UpsertInvoiceCustomerModel, InvoiceCustomerLookup } from '../models';

// Stored invoice recipients per store (InvoiceCustomersController), plus the Brreg prefill lookup.
export class InvoiceCustomerService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // Free-text search over name, organisation number, phone and e-mail. An empty query lists the
  // store's most recently invoiced customers.
  public async Search(storeId: number, query: string): Promise<Array<InvoiceCustomer>> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/invoice-customers?q=' + encodeURIComponent(query || ''))
      .catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || 'Kunne ikke søke i fakturakunder'); }
    return parsed.data || [];
  }

  public async Get(storeId: number, id: number): Promise<InvoiceCustomer> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/invoice-customers/' + id)
      .catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || 'Kunne ikke hente fakturakunden'); }
    return parsed.data;
  }

  // Creates or updates the recipient. A company is keyed by its organisation number; a person by id.
  public async Upsert(storeId: number, model: UpsertInvoiceCustomerModel): Promise<InvoiceCustomer> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/invoice-customers', model)
      .catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || 'Kunne ikke lagre fakturakunden'); }
    return parsed.data;
  }

  // Brreg is a public registry, so this one is not store-scoped; it is only prefill for the form.
  public async LookupBrreg(organizationNumber: string): Promise<InvoiceCustomerLookup> {
    const response = await this._requestService.GetRequest('/invoice-customers/brreg/' + encodeURIComponent(organizationNumber))
      .catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || 'Kunne ikke hente bedriftsinformasjon'); }
    return parsed.data;
  }
}
