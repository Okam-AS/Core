import $config from '../helpers/configuration'
import { BulkImport, Product } from '../models'
import { IVuexModule } from '../interfaces'
import { HttpMethod, MutationName } from '../enums'
import { UserService, RequestService } from './'
export class ProductService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;
    private _userService: UserService

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
      this._userService = new UserService(vuexModule)
    }

    public async GetByBarcode (storeId: number, barcode: string): Promise<Product> {
      const response = await this._requestService.GetRequest('/products/consumer/search/' + storeId + '/' + (barcode || false))
      return this.ParsedResponse(response, 'Utsalgsstedet har ikke registrert denne varen')
    }

    public async Get (productId: string): Promise<Product> {
      const response = await this._requestService.GetRequest('/products/' + productId)
      return this.ParsedResponse(response, 'Kunne ikke hente produkt')
    }

    public async CreateOrUpdate (product: Product): Promise<Product> {
      const response = await this._requestService.PostRequest('/products', product)
      return this.ParsedResponse(response, 'Kunne ikke lagre produkt')
    }

    public async GetAll (storeId: number): Promise<Array<Product>> {
      const response = await this._requestService.GetRequest('/products/search/' + storeId)
      if (response.statusCode === 401 && this._vuexModule.state.currentUser.token) { this._userService.Logout() }
      return this.ParsedResponse(response, 'Kunne ikke hente produkter')
    }

    public async Delete (productId: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/products/' + productId)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette produkt') }
    }

    public async DeleteImage (productId: string) {
      const response = await this._requestService.DeleteRequest('/products/' + productId + '/image')
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette bildet') }
    }

    public UploadImage (imagePath: string, productId: string) {
      this._requestService.FormdataRequest('/products/image', HttpMethod.POST, 'Image', imagePath, [{ name: 'GuidId', value: productId }])
    }

    public async BulkImport (model: BulkImport): Promise<any> {
      const response = await this._requestService.PostRequest('/products/bulk-import', model)
      return this.ParsedResponse(response, 'Kunne ikke importere')
    }

    public GetStoreProductsAndSetState = ({ storeId, thenHandler, catchHandler }) => {
      const _this = this
      this.GetAll(storeId).then((storeProducts) => {
        if (Array.isArray(storeProducts)) { _this._vuexModule.commit(MutationName.SetStoreProducts, storeProducts) }
        if (thenHandler) { thenHandler(storeProducts) }
      }).catch(() => {
        if (catchHandler) { catchHandler() }
      })
    }

    private ParsedResponse (response, errorMessage) {
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error(errorMessage) }
      return parsedResponse
    }
}