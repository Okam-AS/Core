import { ICoreInitializer } from '../interfaces'
import { Product, ProductVariant } from '../models'
import { RequestService } from './request-service'

export class CategoryProductVariantService {
    private _requestService: RequestService;

    constructor (coreInitializer: ICoreInitializer) {
      this._requestService = new RequestService(coreInitializer)
    }

    public async Reorder (categoryId: string, productVariants: Array<ProductVariant>): Promise<Product> {
      const response = await this._requestService.PutRequest('/categoryproductvariants/reorder', { categoryId, productVariants })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke lagre sortering') }
      return parsedResponse
    }

    public async CreateOrUpdate (categoryId: string, productVariants: Array<ProductVariant>): Promise<ProductVariant> {
      const response = await this._requestService.PostRequest('/categoryproductvariants', { categoryId, productVariants })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke lagre tilbehør') }
      return parsedResponse
    }

    public async Delete (productVariantId: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/categoryproductvariants/' + productVariantId)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette tilbehør') }
    }
}