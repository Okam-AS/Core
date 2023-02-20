import { Cart, CartValidation, Order, CartLineItem } from '../models'
import { ICartRootProperties, IServiceCtor } from '../interfaces'
import { MutationName } from '../enums'
import { RequestService } from './request-service'

export class CartService {
    private _requestService: RequestService;

    constructor (serviceCtor: IServiceCtor) {
      this._requestService = new RequestService(serviceCtor)
    }

    public async GetCartLineItem (cartLineItem: CartLineItem): Promise<CartLineItem> {
      const response = await this._requestService.PostRequest('/carts/lineItem', cartLineItem)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke hente produkt') }

      return parsedResponse
    }

    public async Update (model: Cart): Promise<Cart> {
      const response = await this._requestService.PutRequest('/carts', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke oppdatere handlevogn') }

      return parsedResponse
    }

    public async Validate (storeId: number): Promise<CartValidation> {
      const response = await this._requestService.GetRequest('/carts/validate/' + storeId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke validere handlevogn') }

      return parsedResponse
    }

    public async Complete (storeId: number): Promise<Order> {
      const response = await this._requestService.PostRequest('/carts/complete/' + storeId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke fullføre ordre') }

      return parsedResponse
    }

    public async Delete (storeId: Number): Promise<boolean> {
      const response = await this._requestService.DeleteRequest('/carts/' + storeId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

}
