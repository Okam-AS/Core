import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import {
  OfferProposalModel,
  AcceptOfferProposalModel,
  SendVerificationTokenModel,
  SendProposalModel
} from '../models'
import { RequestService } from './'

export class OfferProposalService {
  private _requestService: RequestService;
  private _vuexModule: IVuexModule;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    this._vuexModule = vuexModule
  }

  /**
   * Gets all offer proposals
   * @returns Promise with array of offer proposals
   */
  public async GetAll(): Promise<OfferProposalModel[]> {
    const response = await this._requestService.GetRequest('/offerproposals');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get offer proposals') }

    return parsedResponse;
  }

  /**
   * Gets an offer proposal by ID
   * @param id Offer proposal ID
   * @returns Promise with offer proposal details
   */
  public async GetByCode(code: string): Promise<OfferProposalModel> {
    const response = await this._requestService.GetRequest(`/offerproposals/${code}`);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get offer proposal') }

    return parsedResponse;
  }

  /**
   * Creates a new offer proposal or updates an existing one
   * @param id Optional ID for updating an existing proposal (0 or undefined for new)
   * @param model Offer proposal data model
   * @returns Promise with created/updated offer proposal
   */
  public async CreateOrUpdateOfferProposal(id: number = 0, model: OfferProposalModel): Promise<OfferProposalModel> {
    const response = await this._requestService.PostRequest(`/offerproposals/${id}`, model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to create or update offer proposal') }

    return parsedResponse;
  }

  /**
   * Accepts an offer proposal using SMS verification (anonymous access)
   * @param id Offer proposal ID
   * @param model Model containing phone number and verification code
   * @returns Promise with the accepted offer proposal
   */
  public async AcceptOfferWithVerification(id: number, model: AcceptOfferProposalModel): Promise<OfferProposalModel> {
    const response = await this._requestService.PostRequest(`/offerproposals/${id}/accept-with-verification`, model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to accept offer proposal') }

    return parsedResponse;
  }

  /**
   * Sends a verification token to the client's phone number for accepting an offer proposal
   * @param id Offer proposal ID
   * @param model Model containing the phone number
   * @returns Promise with boolean indicating success
   */
  public async SendVerificationToken(id: number, model: SendVerificationTokenModel): Promise<boolean> {
    const response = await this._requestService.PostRequest(`/offerproposals/${id}/send-verification`, model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to send verification token') }

    return parsedResponse;
  }

  /**
   * Sends an SMS with the offer proposal details to the client
   * @param id Offer proposal ID
   * @param model Optional model for additional parameters
   * @returns Promise with boolean indicating success
   */
  public async SendProposalSms(id: number, model: SendProposalModel = {}): Promise<boolean> {
    const response = await this._requestService.PostRequest(`/offerproposals/${id}/send-proposal`, model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to send proposal SMS') }

    return parsedResponse.success;
  }

  /**
   * Marks an offer proposal as read
   * @param id Offer proposal ID
   * @returns Promise with the updated offer proposal
   */
  public async MarkAsRead(id: number): Promise<OfferProposalModel> {
    const response = await this._requestService.PostRequest(`/offerproposals/${id}/mark-as-read`, {});
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to mark offer proposal as read') }

    return parsedResponse;
  }

  /**
   * Rejects an offer proposal
   * @param id Offer proposal ID
   * @returns Promise with the rejected offer proposal
   */
  public async RejectProposal(id: number): Promise<OfferProposalModel> {
    const response = await this._requestService.PostRequest(`/offerproposals/${id}/reject`, {});
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to reject offer proposal') }

    return parsedResponse;
  }
}
