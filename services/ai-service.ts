import { IVuexModule } from '../interfaces'
import $config from '../helpers/configuration'
import { RequestService } from '../services'

export class AIService {
  private _requestService: RequestService;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
  }

  public async MenuToJson(storeId: number, pageContent: string, extraInstructions: string): Promise<any> {
    const payload = {
      PageContent: pageContent,
      StoreId: storeId.toString(),
      ExtraInstructions: extraInstructions
    }

    const response = await this._requestService.PostRequest('/ai/menu-to-json', payload)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) {
      throw new Error()
    }
    return parsedResponse
  }

  public async AskQuestion(question: string, selectedStoreIds?: number[]): Promise<any> {
    const payload = {
      Question: question,
      SelectedStoreIds: selectedStoreIds && selectedStoreIds.length > 0 ? selectedStoreIds : null,
    }

    const response = await this._requestService.PostRequest('/chat/ask', payload)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) {
      throw new Error()
    }
    return parsedResponse
  }
}
