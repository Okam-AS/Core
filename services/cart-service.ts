import { Cart, CartValidation, Order, CartLineItem } from '../models'
import { ICartRootProperties, IVuexModule } from '../interfaces'
import $config from '../helpers/configuration'

import { MutationName } from '../enums'
import { RequestService } from './request-service'
import { debounce } from '../helpers/ts-debounce'

export class CartService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
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

    public UpdateCartInDbAndSetState = debounce((storeId, thenFunction?: Function, catchFunction?: Function) => {
      const _this = this
      if (!this._vuexModule.getters.userIsLoggedIn) { return }
      const updatedCart = this._vuexModule.getters.cartByStoreId(storeId)
      if (!updatedCart || !updatedCart.storeId) { return }
      updatedCart.ignoreLegecyIsSelfPickupBool = true
      updatedCart.IgnoreLegecyIsWaiterOrderBool = true
      this._vuexModule.commit(MutationName.SetCartIsLoading, true)
      _this.Update(updatedCart).then((cart) => {
        _this._vuexModule.commit(MutationName.SetCarts, [cart])
        _this._vuexModule.commit(MutationName.SetCartIsLoading, false)
        if(typeof thenFunction === 'function') thenFunction()
      }).catch(() => {
        _this._vuexModule.commit(MutationName.SetCartIsLoading, false)
        if(typeof catchFunction === 'function') thenFunction()      })
    }, 400);

    public SetCartRootProperties = (props: ICartRootProperties, thenFunction?: Function, catchFunction?: Function) => {
      this._vuexModule.commit(MutationName.SetCartRootProperties, props)
      this.UpdateCartInDbAndSetState(props.storeId, thenFunction, catchFunction)
    }

    public SetLineItem = ({ storeId, lineItem }) => {
      this._vuexModule.commit(MutationName.SetLineItem, { storeId, lineItem })
      this.UpdateCartInDbAndSetState(storeId)
    }

    public RemoveLineItem = ({ storeId, lineItem }) => {
      this._vuexModule.commit(MutationName.RemoveLineItem, { storeId, lineItem })
      this.UpdateCartInDbAndSetState(storeId)
    }

    public AddQuantityLineItem = ({ storeId, lineItemId, addQuantity }) => {
      const cart = this._vuexModule.state.carts.find(x => x.storeId === storeId)
      if (!cart) { return }
      const templineItem = (cart.items || []).find(x => x.id === lineItemId)
      if (!templineItem) { return }
      const lineItem = JSON.parse(JSON.stringify(templineItem))
      lineItem.quantity += addQuantity
      if (lineItem.quantity <= 0) {
        this._vuexModule.commit(MutationName.RemoveLineItem, { storeId, lineItem })
      } else {
        this._vuexModule.commit(MutationName.SetLineItem, { storeId, lineItem })
      }
      this.UpdateCartInDbAndSetState(storeId)
    }

    public DeleteFromDbAndState = (storeId) => {
      this._vuexModule.commit(MutationName.RemoveCart, storeId)
      if (this._vuexModule.getters.userIsLoggedIn) { this.Delete(storeId) }
    }
}
