import { ImageCarouselItem, ImageCarouselItemMarker } from '../models'
import { IServiceCtor } from '../interfaces'
import { RequestService } from './request-service'

export class ImageCarouselService {
    private _requestService: RequestService;

    constructor (serviceCtor: IServiceCtor) {
      this._requestService = new RequestService(serviceCtor)
    }

    public async Reorder (categoryId: string, imageCarouselItems: Array<ImageCarouselItem>): Promise<void> {
      const response = await this._requestService.PutRequest('/imagecarousel/reorder', { categoryId, imageCarouselItems })
      return this.ParsedResponse(response, 'Kunne ikke sortere utstillingsbilder')
    }

    public async CreateOrUpdateMarker (imageCarouselItemMarker: ImageCarouselItemMarker): Promise<ImageCarouselItemMarker> {
      const response = await this._requestService.PostRequest('/imagecarousel/marker', imageCarouselItemMarker)
      return this.ParsedResponse(response, 'Kunne ikke lagre markering')
    }

    public async DeleteMarker (imageCarouselItemMarkerId: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/imagecarousel/marker/' + imageCarouselItemMarkerId)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette markering') }
    }

    public async Delete (imageCarouselItemId: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/imagecarousel/item/' + imageCarouselItemId)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette bilde') }
    }

    private ParsedResponse (response, errorMessage) {
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error(errorMessage) }
      return parsedResponse
    }
}