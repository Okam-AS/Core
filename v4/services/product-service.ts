import { BulkImport, Product } from '../models'
import { ICoreInitializer } from '../interfaces'
import { RequestService, UserService } from './'
export class ProductService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer)
  }

  public async GetByBarcode(storeId: number, barcode: string): Promise<Product> {
    const response = await this._requestService.GetRequest('/products/consumer/search/' + storeId + '/' + (barcode || false))
    return this.ParsedResponse(response, 'Butikken har ikke registrert denne varen')
  }

  public async Get(productId: string): Promise<Product> {
    const response = await this._requestService.GetRequest('/products/' + productId)
    return this.ParsedResponse(response, 'Kunne ikke hente produkt')
  }

  public async CreateOrUpdate(product: Product): Promise<Product> {
    const response = await this._requestService.PostRequest('/products', product)
    return this.ParsedResponse(response, 'Kunne ikke lagre produkt')
  }

  public async GetAll(storeId: number): Promise<Array<Product>> {
    const response = await this._requestService.GetRequest('/products/search/' + storeId)
    return this.ParsedResponse(response, 'Kunne ikke hente produkter')
  }

  public async GetFavorites(storeId: number): Promise<Array<Product>> {
    const response = await this._requestService.GetRequest('/products/favorites/' + storeId)
    return this.ParsedResponse(response, 'Kunne ikke hente favoritter')
  }
  public async Delete(productId: string): Promise<void> {
    const response = await this._requestService.DeleteRequest('/products/' + productId)
    if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette produkt') }
  }

  public async DeleteImage(productId: string) {
    const response = await this._requestService.DeleteRequest('/products/' + productId + '/image')
    if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette bildet') }
  }

  public async BulkImport(model: BulkImport): Promise<any> {
    const response = await this._requestService.PostRequest('/products/bulk-import', model)
    return this.ParsedResponse(response, 'Kunne ikke importere')
  }

  private ParsedResponse(response, errorMessage) {
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error(errorMessage) }
    return parsedResponse
  }
}