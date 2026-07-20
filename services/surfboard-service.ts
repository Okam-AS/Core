import { ICoreInitializer } from '../interfaces';
import {
  SurfboardMerchant,
  SurfboardApplication,
  SurfboardApplicationStatusResult,
  SurfboardCreateMerchantResult,
  SurfboardStoreDetails,
  SurfboardCreateStoreResult,
  SurfboardTerminal,
  SurfboardRegisterDeviceResult,
  SurfboardBrregPrefill,
  SurfboardInitiateOnlineModel,
  SurfboardOnlineInitiateResult,
  SurfboardVerifyResult,
  SurfboardTipsConfigRequest
} from '../models';
import { RequestService } from './request-service';

// PowerUser-only Surfboard partner administration (WP4): onboard merchants, manage stores and
// terminals through the Okam backend (SurfboardAdminController) instead of the Surfboard Partner
// Portal. Per-store credential config stays on StoreService (Get/UpdateSurfboardConfig).
//
// Every administration call surfaces the backend's own failure reason rather than a generic
// "Failed to ..." string: the backend forwards Surfboard's error verbatim (for example
// "TM_0014: Registration code expired/already used"), which is the only thing that tells an
// operator what to do next. The Safe* request variants resolve non-2xx responses instead of
// rejecting, so BuildError can read the message off the failed response on both platforms.
export class SurfboardService {
  private _requestService: RequestService;

  constructor (coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // --- Onboarding an Okam store ---

  // Onboard an Okam store as a new Surfboard merchant. Returns the KYB application id + webKybUrl.
  public async onboardStore (okamStoreId: number, model: {
    corporateId?: string,
    legalName?: string,
    mccCode?: string,
    email?: string,
    phoneCode?: string,
    phoneNumber?: string,
    addressLine1?: string,
    city?: string,
    postalCode?: string,
    storeName?: string,
    cardEnabled?: boolean,
    vippsEnabled?: boolean,
    mobilePayEnabled?: boolean,
    swishEnabled?: boolean,
    klarnaEnabled?: boolean,
    includeOnline?: boolean,
    merchantWebshopUrl?: string,
    termsAndConditionsUrl?: string,
    privacyPolicyUrl?: string
  }): Promise<SurfboardCreateMerchantResult> {
    const response = await this._requestService.PostRequest('/surfboard-admin/stores/' + okamStoreId + '/onboard', model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to onboard store', response); }
    return parsedResponse;
  }

  // Poll onboarding status; when the merchant is created the store's config ids are filled in.
  public async syncOnboarding (okamStoreId: number): Promise<SurfboardApplicationStatusResult> {
    const response = await this._requestService.PostRequest('/surfboard-admin/stores/' + okamStoreId + '/sync', {});
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to sync onboarding', response); }
    return parsedResponse;
  }

  // Manually link an Okam store's config to a chosen merchant/store/online-terminal.
  public async linkConfig (okamStoreId: number, model: {
    merchantId?: string,
    storeExternalId?: string,
    onlineTerminalId?: string
  }): Promise<boolean> {
    const response = await this._requestService.PostRequest('/surfboard-admin/stores/' + okamStoreId + '/link', model);
    if (this._requestService.TryParseResponse(response) === undefined) {
      throw this._requestService.BuildError('Failed to link Surfboard config', response);
    }
    return true;
  }

  // --- Merchants & applications ---

  public async getMerchants (): Promise<SurfboardMerchant[]> {
    const response = await this._requestService.SafeGetRequest('/surfboard-admin/merchants');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to fetch merchants', response); }
    return parsedResponse;
  }

  public async getMerchant (merchantId: string): Promise<SurfboardMerchant> {
    const response = await this._requestService.SafeGetRequest('/surfboard-admin/merchants/' + merchantId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to fetch merchant', response); }
    return parsedResponse;
  }

  public async getApplications (): Promise<SurfboardApplication[]> {
    const response = await this._requestService.SafeGetRequest('/surfboard-admin/applications');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to fetch applications', response); }
    return parsedResponse;
  }

  public async getApplicationStatus (applicationId: string): Promise<SurfboardApplicationStatusResult> {
    const response = await this._requestService.SafeGetRequest('/surfboard-admin/applications/' + applicationId + '/status');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to fetch application status', response); }
    return parsedResponse;
  }

  // --- Stores ---

  public async createStore (merchantId: string, model: {
    storeName?: string,
    email?: string,
    phoneCode?: string,
    phoneNumber?: string,
    address?: string,
    city?: string,
    zipCode?: string,
    country?: string,
    includeOnline?: boolean,
    merchantWebshopUrl?: string,
    termsAndConditionsUrl?: string,
    privacyPolicyUrl?: string
  }): Promise<SurfboardCreateStoreResult> {
    const response = await this._requestService.PostRequest('/surfboard-admin/merchants/' + merchantId + '/stores', model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to create store', response); }
    return parsedResponse;
  }

  public async getStores (merchantId: string): Promise<SurfboardStoreDetails[]> {
    const response = await this._requestService.SafeGetRequest('/surfboard-admin/merchants/' + merchantId + '/stores');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to fetch stores', response); }
    return parsedResponse;
  }

  public async getStore (merchantId: string, storeId: string): Promise<SurfboardStoreDetails> {
    const response = await this._requestService.SafeGetRequest('/surfboard-admin/merchants/' + merchantId + '/stores/' + storeId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to fetch store', response); }
    return parsedResponse;
  }

  public async verifyDomain (merchantId: string, storeId: string, domainType: string = 'MERCHANT_WEBSHOP_URL'): Promise<boolean> {
    const response = await this._requestService.PostRequest(
      '/surfboard-admin/merchants/' + merchantId + '/stores/' + storeId + '/verify?domainType=' + encodeURIComponent(domainType), {});
    if (this._requestService.TryParseResponse(response) === undefined) {
      throw this._requestService.BuildError('Failed to verify domain', response);
    }
    return true;
  }

  // --- Terminals ---

  public async getStoreTerminals (merchantId: string, storeId: string): Promise<SurfboardTerminal[]> {
    const response = await this._requestService.SafeGetRequest(
      '/surfboard-admin/merchants/' + merchantId + '/stores/' + storeId + '/terminals');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to fetch terminals', response); }
    return parsedResponse;
  }

  public async registerDevice (model: {
    merchantId: string,
    storeExternalId: string,
    registrationIdentifier: string,
    terminalName?: string
  }): Promise<SurfboardRegisterDeviceResult> {
    const response = await this._requestService.PostRequest('/surfboard-admin/terminals/register', model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to register terminal', response); }
    return parsedResponse;
  }

  public async activateTerminal (serialNo: string): Promise<boolean> {
    const response = await this._requestService.PostRequest('/surfboard-admin/terminals/activate', { serialNo });
    if (this._requestService.TryParseResponse(response) === undefined) {
      throw this._requestService.BuildError('Failed to activate terminal', response);
    }
    return true;
  }

  // --- Brreg prefill ---

  public async brregLookup (orgNumber: number): Promise<SurfboardBrregPrefill> {
    const response = await this._requestService.SafeGetRequest('/surfboard-admin/brreg/' + orgNumber);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to look up organisation', response); }
    return parsedResponse;
  }

  // --- Online payment (consumer checkout) ---

  // Start an online Surfboard payment for a cart. Returns the hosted payment-page url the customer
  // is sent to, plus the Surfboard order/payment ids and our payment-transaction id (POST /Surfboard/initiate).
  public async initiateOnline (model: SurfboardInitiateOnlineModel): Promise<SurfboardOnlineInitiateResult> {
    const response = await this._requestService.PostRequest('/Surfboard/initiate', model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to initiate Surfboard payment'); }
    return parsedResponse;
  }

  // Poll a Surfboard online payment by our payment-transaction reference (GET /Surfboard/verify/{reference}).
  // status is 'success' | 'fail' | 'waiting'; orderId is the resulting order code on success.
  public async verify (reference: string): Promise<SurfboardVerifyResult> {
    const response = await this._requestService.GetRequest('/Surfboard/verify/' + reference);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to verify Surfboard payment'); }
    return parsedResponse;
  }

  // Poll a Surfboard online payment until it succeeds or fails (parity with DinteroService.PullVerifyResult).
  public PullVerifyResult (reference: string, successHandler, failHandler) {
    let intervalId;
    const poll = () => {
      this.verify(reference)
        .then((result) => {
          if (result.status === 'success') {
            clearInterval(intervalId);
            if (successHandler) successHandler(result);
          } else if (result.status === 'fail') {
            clearInterval(intervalId);
            if (failHandler) failHandler(result);
          }
        })
        .catch(() => {
          clearInterval(intervalId);
          if (failHandler) failHandler();
        });
    };

    setTimeout(() => {
      this.verify(reference)
        .then((result) => {
          if (result.status === 'success') {
            if (successHandler) successHandler(result);
          } else if (result.status === 'fail') {
            if (failHandler) failHandler(result);
          } else {
            intervalId = setInterval(poll, 1800);
          }
        })
        .catch(() => {
          if (failHandler) failHandler();
        });
    }, 800);
  }

  // --- Tips configuration (PowerUser) ---

  // Configure terminal tips prompt levels for a store (POST /Surfboard/stores/{storeId}/tips-config).
  public async setTipsConfig (storeId: number, request: SurfboardTipsConfigRequest): Promise<boolean> {
    const response = await this._requestService.PostRequest('/Surfboard/stores/' + storeId + '/tips-config', request);
    return this._requestService.TryParseResponse(response) !== undefined;
  }
}
