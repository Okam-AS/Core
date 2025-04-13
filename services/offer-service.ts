import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { OfferItemModel } from '../models'
import { RequestService } from './'

export class OfferService {
  private _requestService: RequestService;
  private _vuexModule: IVuexModule;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    this._vuexModule = vuexModule
  }

  /**
   * Gets all offers
   * @param fromDate Optional start date filter
   * @param toDate Optional end date filter
   * @returns Promise with array of offers
   */
  public async GetAll(): Promise<OfferItemModel[]> {
    const response = await this._requestService.GetRequest('/offers');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get offers') }

    return parsedResponse;
  }

  /**
   * Gets an offer by ID
   * @param id Offer ID (GUID)
   * @returns Promise with offer details
   */
  public async GetById(id: string): Promise<OfferItemModel> {
    const response = await this._requestService.GetRequest(`/offers/${id}`);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get offer') }

    return parsedResponse;
  }

  /**
   * Creates a new offer or updates an existing one
   * @param model Offer data model
   * @returns Promise with created/updated offer
   */
  public async CreateOrUpdateOffer(model: OfferItemModel): Promise<OfferItemModel> {
    try {
      const response = await this._requestService.PostRequest('/offers', model);
      const parsedResponse = this._requestService.TryParseResponse(response);

      if (parsedResponse === undefined) {
        throw new Error('Failed to create or update offer');
      }
      return parsedResponse;
    } catch (error) {
      console.error('Error in CreateOrUpdateOffer:', error);
      throw error;
    }
  }

  /**
   * Deletes an offer by ID
   * @param id Offer ID (GUID)
   * @returns Promise with boolean indicating success
   */
  public async DeleteOffer(id: string): Promise<boolean> {
    const response = await this._requestService.DeleteRequest(`/offers/${id}`);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }
}
