import { Store, StoreTip, StoreRegistration, OpeningHour, SpecialOpeningHour, SpecialOpeningHourAdmin, Address, StoreUserSetting, BrregData, StorePayment, StoreFees, CategorySearchOptions, StoreOverviewResponseModel, StorePaymentConfig, SurfboardStoreConfiguration } from '../models';
import { HttpMethod, TerminalProvider } from '../enums';
import { ICoreInitializer } from '../interfaces';
import { registerFullReplaceContract, noteRecordLoaded, forgetRecordLoaded, assertFullReplaceIsSafe } from './full-replace-guard';
import { RequestService, UserService } from './';

// ---- FULL-REPLACE ENDPOINTS ---------------------------------------------------------------------
//
// Both store payment-configuration endpoints REPLACE the whole record: the backend assigns every
// field of its write model unconditionally, so a key the client omits is not left alone — it is set
// to the C# default (false / null / 0). See core/services/full-replace-guard.ts for the two defects
// this cost, and for what the guard enforces.
//
// The field lists below are the backend write models, field for field:
//   Models/Dintero/UpdateDinteroStoreConfigurationModel.cs
//   Models/Surfboard/UpdateSurfboardStoreConfigurationModel.cs
// (OkamAPI 8e2b57de). They are asserted against the TypeScript signatures of the two Update methods
// in test/store-config-full-replace.test.js, so a field added to one and not the other reds.
export const DINTERO_CONFIG_KIND = 'store.dintero-configuration';
export const SURFBOARD_CONFIG_KIND = 'store.surfboard-configuration';

registerFullReplaceContract({
  kind: DINTERO_CONFIG_KIND,
  writableFields: [
    'dinteroEnabled',
    'dinteroAccountId',
    'clientId',
    'clientSecret',
    'vippsEnabled',
    'applePayEnabled',
    'creditCardEnabled',
    'googlePayEnabled',
    'klarnaEnabled',
    'billieEnabled',
    'kraviaEnabled',
    'kraviaMessage',
    'splitSellerId',
    'commissionPercentage',
    'woltDeliveryFeePercent',
    'woltCustomerDeliveryFeeAmount',
    'woltServiceFeeAmount'
  ]
});

registerFullReplaceContract({
  kind: SURFBOARD_CONFIG_KIND,
  writableFields: [
    'surfboardEnabled',
    'merchantId',
    'storeExternalId',
    'onlineTerminalId',
    'webhookSecret',
    'cardEnabled',
    'vippsEnabled',
    'mobilePayEnabled',
    'swishEnabled',
    'klarnaEnabled',
    'tipsEnabled',
    'partialPaymentsEnabled',
    'commissionPercentage',
    'terminalCommissionPercentage',
    'woltDeliveryFeePercent',
    'woltCustomerDeliveryFeeAmount',
    'woltServiceFeeAmount'
  ]
});

export class StoreService {
  private _requestService: RequestService;
  private _userService: UserService;

  constructor (coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
    this._userService = new UserService(coreInitializer);
  }

  public async ImageExists (imageUrl: string) {
    const response = await this._requestService.GetHeadRequest(imageUrl);
    return response;
  }

  public async Get (id: number): Promise<Store> {
    const response = await this._requestService.GetRequest('/stores/' + id);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to get store');
    }
    return parsedResponse;
  }

  public async GetForConsumer (id: number, searchOptions: CategorySearchOptions): Promise<Store> {
    const response = await this._requestService.PostRequest('/stores/' + id + '/consumer', searchOptions);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to get store');
    }
    return parsedResponse;
  }

  public async Delete (id: number): Promise<boolean> {
    const response = await this._requestService.DeleteRequest('/stores/' + id);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async Register (name: string, legalName: string, vat: number, fullAddress: string, zipCode: string, city: string, acceptedTerms: boolean) {
    const response = await this._requestService.PostRequest('/stores/register', new StoreRegistration(name, legalName, vat, fullAddress, zipCode, city, acceptedTerms));
    return this._requestService.TryParseResponse(response);
  }

  public UploadLogo (imagePath, storeId: number) {
    return this._requestService.FormdataRequest('/stores/logo', HttpMethod.POST, 'Image', imagePath, [{ name: 'NumberId', value: storeId + '' }]);
  }

  public async AddEmployee (storeId: number, phoneNumber: string): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/addemployee', { storeId, phoneNumber, asAdmin: true });
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async RemoveEmployee (storeId: number, userId: string): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/removeemployee', { storeId, userId });
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateOpeningHours (storeId: number, openingHours: Array<OpeningHour>): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/openinghours', { openingHours });
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  // Lists the store's special opening days for the admin UI, including the internal staff note
  // (the consumer-facing Store payload omits it).
  public async GetSpecialOpeningHours (storeId: number): Promise<Array<SpecialOpeningHourAdmin>> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/specialopeninghours');
    return this._requestService.TryParseResponse(response) || [];
  }

  // Adds (or replaces, per date) a special opening day: a dated override that is either closed or has
  // a manual open/close time (HH:mm; the backend rejects other formats). Returns the created override.
  public async AddSpecialOpeningHour (storeId: number, special: SpecialOpeningHourAdmin): Promise<SpecialOpeningHourAdmin> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/specialopeninghours', special);
    return this._requestService.TryParseResponse(response);
  }

  // Adds the same override (closed, or open with a HH:mm time) to several dates at once.
  public async AddSpecialOpeningHoursBulk (storeId: number, model: { dates: Array<string>; open: boolean; openingTime: string | null; closingTime: string | null; note: string }): Promise<Array<SpecialOpeningHourAdmin>> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/specialopeninghours/bulk', model);
    return this._requestService.TryParseResponse(response) || [];
  }

  public async DeleteSpecialOpeningHour (storeId: number, specialOpeningHourId: string): Promise<boolean> {
    const response = await this._requestService.DeleteRequest('/stores/' + storeId + '/specialopeninghours/' + specialOpeningHourId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateAddress (storeId: number, address: Address): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/address', address);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateStatusMessage (storeId: number, statusMessage: string): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/status-message', { statusMessage });
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async CreateOrUpdateHomeDeliveryFromAddress (storeId: number, address: Address): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/homedeliveryfromaddress', address);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateTip (storeId: number, tip: StoreTip): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/tip', tip);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateSelfCheckout (storeId: number, newValue: boolean): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/selfcheckout/' + newValue);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateAllowOrdersAfterOpeningHours (storeId: number, newValue: boolean): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/allowordersafteropeninghours/' + newValue);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateSelfPickUp (storeId: number, newValue: boolean): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/selfpickup/' + newValue);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateHomeDelivery (storeId: number, newValue: boolean): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/homedelivery/' + newValue);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async RetryDineHomeOrder (storeId: number, orderCode: string): Promise<boolean> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/dinehome-retry/' + orderCode);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateDineHomeDelivery (storeId: number, newValue: boolean): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/dinehomedelivery/' + newValue);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateWoltDelivery (storeId: number, newValue: boolean): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/woltdelivery/' + newValue);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateRushMode (storeId: number, newValue: boolean): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/rush-mode/' + newValue);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateTableDelivery (storeId: number, newValue: boolean): Promise<boolean> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/tabledelivery/' + newValue);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdatePayment (storeId: number, model: StorePayment): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/payment', model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async CreateOrUpdateStoreUserSetting (storeId: number, model: StoreUserSetting): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/usersettings', model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async SetMinimumAmountForDelivery (storeId: number, amount: number): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/minimumamountfordelivery/' + amount);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async GetBrregData (vat: string): Promise<BrregData> {
    const response = await this._requestService.GetRequest('/stores/brreg/' + vat);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to get Brreg data');
    }
    return parsedResponse;
  }

  public async GetFees (id: number): Promise<StoreFees> {
    const response = await this._requestService.GetRequest('/stores/' + id + '/fees');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to get store fees');
    }
    return parsedResponse;
  }

  public async Feedback (feedback: string) {
    const response = await this._requestService.PostRequest('/stores/feedback', { feedback });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to post feedback');
    }
  }

  public async GetAll (location?: any): Promise<Array<Store>> {
    const queryString = !!location && location.latitude && location.longitude ? '?longitude=' + location.longitude + '&latitude=' + location.latitude : '';
    const response = await this._requestService.GetRequest('/stores' + queryString);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to get stores');
    }
    return parsedResponse;
  }

  public async CheckDeliveryAvailability (storeId: number, fullAddress: string, zipCode: string, city: string): Promise<{ canDeliver: boolean; price: { amount: number; currency: string }; error: string }> {
    const response = await this._requestService.PostRequest(`/stores/${storeId}/delivery-availability`, {
      fullAddress,
      zipCode,
      city
    });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to check delivery availability');
    }
    return parsedResponse;
  }

  public async GetBySlug (slug: string): Promise<{ id: number }> {
    const response = await this._requestService.GetRequest(`/stores/slug/${slug}`);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to get store by slug');
    }
    return parsedResponse;
  }

  public async SearchCustomers (storeId: number, query: string): Promise<any> {
    const response = await this._requestService.PostRequest('/stores/customers', { storeId, query });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to search customers'); }
    return parsedResponse;
  }

  public async GetCustomerStatistics (storeId: number, daysAgo: number): Promise<any> {
    const response = await this._requestService.PostRequest('/stores/customers/statistics', { storeId, daysAgo });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get customer statistics'); }
    return parsedResponse;
  }

  public async GetOverview (options: { from: string, to: string }): Promise<StoreOverviewResponseModel> {
    const response = await this._requestService.PostRequest('/stores/overview', options);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get store overview'); }
    return parsedResponse;
  }

  public async Publish (storeId: number, options: { publish: boolean }): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/publish', options);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async KeyAccountManagerUpdate (storeId: number, options: { kamUserId: string, status: string, notes: string }): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/kam', options);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  // FULL REPLACE. Refuses unless GetDinteroConfig read this store's record first and every field of
  // the backend write model is carried — see full-replace-guard.ts.
  public async UpdateDinteroConfig (storeId: number, options: {
    dinteroEnabled: boolean,
    dinteroAccountId: string,
    clientId: string,
    clientSecret: string,
    vippsEnabled: boolean,
    applePayEnabled: boolean,
    creditCardEnabled: boolean,
    googlePayEnabled: boolean,
    klarnaEnabled: boolean,
    billieEnabled: boolean,
    kraviaEnabled: boolean,
    kraviaMessage: string,
    splitSellerId: string,
    commissionPercentage: number,
    woltDeliveryFeePercent: number,
    woltCustomerDeliveryFeeAmount: number,
    woltServiceFeeAmount: number
  }): Promise<boolean> {
    assertFullReplaceIsSafe(DINTERO_CONFIG_KIND, storeId, options);
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/dintero-configuration', options);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async GetDinteroConfig (storeId: number): Promise<any> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/dintero-configuration');
    const parsedResponse = this._requestService.TryParseResponse(response);
    // Recorded only on a parsed response, and dropped otherwise: a form filled from a read that
    // failed holds blank defaults, and posting those is the destruction this guards against.
    if (parsedResponse === undefined) {
      forgetRecordLoaded(DINTERO_CONFIG_KIND, storeId);
      throw new Error('Failed to get Dintero configuration');
    }
    noteRecordLoaded(DINTERO_CONFIG_KIND, storeId);
    return parsedResponse;
  }

  public async GetPaymentConfig (storeId: number): Promise<StorePaymentConfig> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/payment-config');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get store payment config'); }
    return parsedResponse;
  }

  public async SetTerminalProvider (storeId: number, terminalProvider: TerminalProvider): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/terminal-provider', { terminalProvider })
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  // FULL REPLACE. Refuses unless GetSurfboardConfig read this store's record first and every field
  // of the backend write model is carried — see full-replace-guard.ts.
  public async UpdateSurfboardConfig (storeId: number, options: {
    surfboardEnabled: boolean,
    merchantId: string,
    storeExternalId: string,
    onlineTerminalId: string,
    webhookSecret: string,
    cardEnabled: boolean,
    vippsEnabled: boolean,
    mobilePayEnabled: boolean,
    swishEnabled: boolean,
    klarnaEnabled: boolean,
    tipsEnabled: boolean,
    partialPaymentsEnabled: boolean,
    commissionPercentage: number,
    terminalCommissionPercentage: number,
    woltDeliveryFeePercent: number,
    woltCustomerDeliveryFeeAmount: number,
    woltServiceFeeAmount: number
  }): Promise<boolean> {
    assertFullReplaceIsSafe(SURFBOARD_CONFIG_KIND, storeId, options);
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/surfboard-configuration', options);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async GetSurfboardConfig (storeId: number): Promise<SurfboardStoreConfiguration> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/surfboard-configuration');
    const parsedResponse = this._requestService.TryParseResponse(response);
    // See GetDinteroConfig: recorded only on a parsed response, dropped otherwise.
    if (parsedResponse === undefined) {
      forgetRecordLoaded(SURFBOARD_CONFIG_KIND, storeId);
      throw new Error('Failed to get Surfboard configuration');
    }
    noteRecordLoaded(SURFBOARD_CONFIG_KIND, storeId);
    return parsedResponse;
  }

  public async ConfigureWolt (storeId: number, options: {
    venueId: string,
    clientId: string,
    clientSecret: string,
    accessToken: string,
    refreshToken: string
  }): Promise<boolean> {
    const payload = {
      VenueId: options.venueId,
      ClientId: options.clientId,
      ClientSecret: options.clientSecret,
      AccessToken: options.accessToken,
      RefreshToken: options.refreshToken
    };
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/wolt-configuration', payload);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  // Wolt Drive credentials only. Sent to the same endpoint as ConfigureWolt, but without the
  // Marketplace fields so the Marketplace token branch is left untouched. The backend also
  // re-creates the Drive webhook for the merchant as part of this call.
  public async ConfigureWoltDrive (storeId: number, options: {
    merchantId: string,
    merchantKey: string,
    venueId: string
  }): Promise<boolean> {
    const payload = {
      MerchantId: options.merchantId,
      MerchantKey: options.merchantKey,
      VenueId: options.venueId
    };
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/wolt-configuration', payload);
    const { error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return true;
  }

  public async UpdateWoltMarketplaceConfiguration (storeId: number, configuration: { Enabled: boolean }): Promise<any> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/wolt-marketplace-config', configuration);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse;
  }

  public async CheckVatExists (vat: string): Promise<{ exists: boolean, storeName: string }> {
    const response = await this._requestService.GetRequest('/stores/check-vat/' + vat);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to check VAT'); }
    return parsedResponse;
  }
}
