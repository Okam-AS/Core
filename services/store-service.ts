import { Store, StoreTip, StoreRegistration, OpeningHour, SpecialOpeningHour, SpecialOpeningHourAdmin, Address, StoreUserSetting, BrregData, StorePayment, StoreFees, CategorySearchOptions, StoreOverviewResponseModel, StorePaymentConfig, SurfboardStoreConfiguration } from '../models';
import { HttpMethod, TerminalProvider } from '../enums';
import { ICoreInitializer } from '../interfaces';
import { RequestService, UserService } from './';

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
    commissionPercentage: number,
    splitSellerId: string
  }): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/dintero-configuration', options);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async GetDinteroConfig (storeId: number): Promise<any> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/dintero-configuration');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get Dintero configuration'); }
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
    commissionPercentage: number,
    terminalCommissionPercentage: number,
    woltDeliveryFeePercent: number,
    woltCustomerDeliveryFeeAmount: number,
    woltServiceFeeAmount: number
  }): Promise<boolean> {
    const response = await this._requestService.PostRequest('/stores/' + storeId + '/surfboard-configuration', options);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async GetSurfboardConfig (storeId: number): Promise<SurfboardStoreConfiguration> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/surfboard-configuration');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get Surfboard configuration'); }
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
