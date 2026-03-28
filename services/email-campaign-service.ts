import { IVuexModule } from '../interfaces'
import $config from '../helpers/configuration'
import { RequestService } from '../services'

export class EmailCampaignService {
  private _requestService: RequestService
  private _vuexModule: IVuexModule

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    this._vuexModule = vuexModule
  }

  public async GetCampaigns(storeId: number): Promise<any> {
    const response = await this._requestService.GetRequest(`/emailcampaign/${storeId}/campaigns`)
    return this.ParsedResponse(response, 'Kunne ikke hente kampanjer')
  }

  public async GetCampaign(storeId: number, campaignId: string): Promise<any> {
    const response = await this._requestService.GetRequest(`/emailcampaign/${storeId}/campaigns/${campaignId}`)
    return this.ParsedResponse(response, 'Kunne ikke hente kampanje')
  }

  public async CreateCampaign(storeId: number, data: any): Promise<any> {
    const response = await this._requestService.PostRequest(`/emailcampaign/${storeId}/campaigns`, data)
    return this.ParsedResponse(response, 'Kunne ikke opprette kampanje')
  }

  public async UpdateCampaign(storeId: number, campaignId: string, data: any): Promise<any> {
    const response = await this._requestService.PutRequest(`/emailcampaign/${storeId}/campaigns/${campaignId}`, data)
    return this.ParsedResponse(response, 'Kunne ikke oppdatere kampanje')
  }

  public async DeleteCampaign(storeId: number, campaignId: string): Promise<any> {
    const response = await this._requestService.DeleteRequest(`/emailcampaign/${storeId}/campaigns/${campaignId}`)
    if (response.status >= 300 || response.status < 200) {
      throw new Error('Kunne ikke slette kampanje')
    }
  }

  public async FilterMembers(storeId: number, filter: any): Promise<any> {
    const response = await this._requestService.PostRequest(`/emailcampaign/${storeId}/filter-members`, filter)
    return this.ParsedResponse(response, 'Kunne ikke filtrere medlemmer')
  }

  public async UploadImage(storeId: number, campaignId: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this._requestService.PostFormDataRequest(
      `/emailcampaign/${storeId}/campaigns/${campaignId}/images`,
      formData
    )
    return this.ParsedResponse(response, 'Kunne ikke laste opp bilde')
  }

  public async DeleteImage(storeId: number, campaignId: string, imageId: string): Promise<any> {
    const response = await this._requestService.DeleteRequest(
      `/emailcampaign/${storeId}/campaigns/${campaignId}/images/${imageId}`
    )
    if (response.status >= 300 || response.status < 200) {
      throw new Error('Kunne ikke slette bilde')
    }
  }

  public async GenerateEmail(storeId: number, campaignId: string, prompt: string): Promise<any> {
    const response = await this._requestService.PostRequest(
      `/emailcampaign/${storeId}/campaigns/${campaignId}/generate`,
      { Prompt: prompt }
    )
    return this.ParsedResponse(response, 'Kunne ikke generere e-post')
  }

  public async RefineEmail(storeId: number, campaignId: string, prompt: string): Promise<any> {
    const response = await this._requestService.PostRequest(
      `/emailcampaign/${storeId}/campaigns/${campaignId}/refine`,
      { Prompt: prompt }
    )
    return this.ParsedResponse(response, 'Kunne ikke justere e-post')
  }

  public async SendTestEmail(storeId: number, campaignId: string, email: string): Promise<any> {
    const response = await this._requestService.PostRequest(
      `/emailcampaign/${storeId}/campaigns/${campaignId}/test-send`,
      { Email: email }
    )
    return this.ParsedResponse(response, 'Kunne ikke sende test-epost')
  }

  public async StartSending(storeId: number, campaignId: string): Promise<any> {
    const response = await this._requestService.PostRequest(
      `/emailcampaign/${storeId}/campaigns/${campaignId}/send`
    )
    return this.ParsedResponse(response, 'Kunne ikke starte sending')
  }

  public async GetSendStatus(storeId: number, campaignId: string): Promise<any> {
    const response = await this._requestService.GetRequest(
      `/emailcampaign/${storeId}/campaigns/${campaignId}/send-status`
    )
    return this.ParsedResponse(response, 'Kunne ikke hente sendestatus')
  }

  private ParsedResponse(response: any, errorMessage: string) {
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error(errorMessage) }
    return parsedResponse
  }
}
