import { Category, CategoryProductListItem, CategorySearchOptions } from '../models'
import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { HttpMethod } from '../enums'
import { RequestService, UserService } from '../services'
export class CategoryService {
    private _requestService: RequestService;
    private _userService: UserService;
    private _vuexModule: IVuexModule;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
      this._userService = new UserService(vuexModule)
    }

    public async Get (categoryId: string, forStore: boolean): Promise<Category> {
      const response = await this._requestService.GetRequest('/categories/' + categoryId + (forStore ? '?forStore=true' : ''))
      if (response.statusCode === 401 && this._vuexModule.state.currentUser.token) { this._userService.Logout() }
      return this.ParsedResponse(response, 'Kunne ikke hente kategori')
    }

    public async GetForConsumer (categoryId: string, searchOptions: CategorySearchOptions): Promise<Category> {
      const response = await this._requestService.PostRequest('/categories/' + categoryId + '/consumer', searchOptions)
      if (response.statusCode === 401 && this._vuexModule.state.currentUser.token) { this._userService.Logout() }
      return this.ParsedResponse(response, 'Kunne ikke hente kategori')
    }

    public async GetAll (storeId: number, forStore: boolean): Promise<Array<Category>> {
      const response = await this._requestService.GetRequest('/categories/store/' + storeId + (forStore ? '?forStore=true' : ''))
      return this.ParsedResponse(response, 'Kunne ikke hente kategorier')
    }

    public async GetAllForConsumer (storeId: number, searchOptions: CategorySearchOptions): Promise<Category> {
      const response = await this._requestService.PostRequest('/categories/store/' + storeId + '/consumer', searchOptions)
      return this.ParsedResponse(response, 'Kunne ikke hente kategorier')
    }

    public UploadImage (imagePath: string, categoryId: string) {
      this._requestService.FormdataRequest('/categories/' + categoryId + '/image', HttpMethod.POST, 'Image', imagePath)
    }

    public async DeleteImage (imageSourceId: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/categories/image/' + imageSourceId)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette kategoribilde') }
    }

    public async GetImageSelection (categoryId: string): Promise<Category> {
      const response = await this._requestService.GetRequest('/categories/' + categoryId + '/imageselection')
      return this.ParsedResponse(response, 'Kunne ikke hente bilder')
    }

    public async HasAnyValid (storeId: number): Promise<Boolean> {
      const response = await this._requestService.GetRequest('/categories/store/' + storeId + '/hasanyvalid')
      if (response.statusCode === 401 && this._vuexModule.state.currentUser.token) { this._userService.Logout() }
      return this.ParsedResponse(response, 'Kunne ikke hente kategori informasjon')
    }

    public async Update (category: Category): Promise<Category> {
      const response = await this._requestService.PutRequest('/categories', category)
      return this.ParsedResponse(response, 'Kunne ikke lagre kategori')
    }

    public async Reorder (storeId: number, categories: Array<Category>): Promise<Category> {
      const response = await this._requestService.PutRequest('/categories/reorder', { storeId, categories })
      return this.ParsedResponse(response, 'Kunne ikke lagre sortering')
    }

    public async Delete (categoryId: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/categories/' + categoryId)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette kategori') }
    }

    public async CreateOrUpdateCategoryProductList (categoryId: string, categoryProductListItems: Array<CategoryProductListItem>): Promise<Category> {
      const response = await this._requestService.PostRequest('/categories/categoryproductlistitem', { categoryId, categoryProductListItems })
      return this.ParsedResponse(response, 'Kunne ikke lagre prduktlisten')
    }

    public async DeleteCategoryProductListItem (categoryProductListItemId: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/categories/categoryproductlistitem/' + categoryProductListItemId)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette rad i produktlisten') }
    }

    public async Create (category: Category): Promise<Category> {
      const response = await this._requestService.PostRequest('/categories', category)
      return this.ParsedResponse(response, 'Kunne ikke lagre kategori')
    }

    private ParsedResponse (response, errorMessage) {
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error(errorMessage) }
      return parsedResponse
    }
}