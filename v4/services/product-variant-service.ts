import { IServiceCtor } from '../interfaces'
import { Product, ProductVariant } from '../models'
import { RequestService } from './request-service'

export class ProductVariantService {
    private _requestService: RequestService;

    constructor (serviceCtor: IServiceCtor) {
      this._requestService = new RequestService(serviceCtor)
    }

    public async Reorder (productId: string, productVariants: Array<ProductVariant>): Promise<Product> {
      const response = await this._requestService.PutRequest('/productvariants/reorder', { productId, productVariants })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke lagre sortering') }
      return parsedResponse
    }

    public async CreateOrUpdate (productId: string, productVariants: Array<ProductVariant>): Promise<ProductVariant> {
      const response = await this._requestService.PostRequest('/productvariants', { productId, productVariants })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke lagre produktvariant') }
      return parsedResponse
    }

    public async Delete (productVariantId: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/productvariants/' + productVariantId)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette produktvariant') }
    }
}