import { HttpMethod, HttpProperty, ActionName } from '../enums'
import { IVuexModule } from '../interfaces'
import { HttpModule } from '../platform'
import $config from '../helpers/configuration'

export class RequestService {
  private _baseUrl: string
  private _httpModule: typeof HttpModule
  private _vuexModule: IVuexModule

  constructor(vuexModule: IVuexModule, baseUrl: string) {
    this._baseUrl = baseUrl
    this._httpModule = new HttpModule()
    this._vuexModule = vuexModule
  }

  public FormdataRequest(path: string, method: HttpMethod, fileParamName: string, filePath: string, otherParams?: Array<any>) {
    const request = this.BuildRequest(path, method, '', this._vuexModule.state.currentUser?.token)
    request.headers[HttpProperty.ContentType] = 'application/octet-stream'
    request.description = 'Uploading file'

    const params = (otherParams || [])
    params.push({ name: fileParamName, filename: filePath, mimeType: 'image/png' })
    this._vuexModule.dispatch(ActionName.ClearFileUploadEvent)
    const task = this._httpModule.bghttp.session('file-upload-id-' + Math.floor(Math.random() * 1000), true).multipartUpload(params, request)

    task.on('progress', (e) => {
      this._vuexModule.dispatch(ActionName.FileUploadEvent, {
        event: {
          responseCode: e.responseCode,
          currentBytes: e.currentBytes,
          totalBytes: e.totalBytes,
          body: e.data,
          eventName: e.eventName
        }
      })
    })
    task.on('error', (e) => {
      this._vuexModule.dispatch(ActionName.FileUploadEvent, {
        event: {
          responseCode: e.responseCode,
          currentBytes: e.currentBytes,
          totalBytes: e.totalBytes,
          body: e.data,
          eventName: e.eventName
        }
      })
    })
    task.on('responded', (e) => {
      this._vuexModule.dispatch(ActionName.FileUploadEvent, {
        respondedEvent: {
          responseCode: e.responseCode,
          currentBytes: e.currentBytes,
          totalBytes: e.totalBytes,
          body: e.data,
          eventName: e.eventName
        }
      })
    })
  }

  public DeleteRequest(path: string): Promise<any> {
    const request = this.DefaultRequest(path, undefined, HttpMethod.DELETE)
    return this._httpModule.httpClient(request).then((response) => {
      return response
    })
  }

  public GetRequest(path: string): Promise<any> {
    const request = this.DefaultRequest(path, false, HttpMethod.GET)
    return this._httpModule.httpClient(request).then((response) => {
      return response
    })
  }

  public PostRequest(path: string, payload?: any): Promise<any> {
    const request = this.DefaultRequest(path, payload, HttpMethod.POST)
    return this._httpModule.httpClient(request).then((response) => {
      return response
    })
  }

  public PutRequest(path: string, payload?: any): Promise<any> {
    const request = this.DefaultRequest(path, payload, HttpMethod.PUT)
    return this._httpModule.httpClient(request).then((response) => {
      return response
    })
  }

  public GetHeadRequest(fullPath: string): Promise<any> {
    const request = this.BuildHeadRequest(fullPath, HttpMethod.GET)
    return this._httpModule.httpClient(request)
  }

  public TryParseResponse(response) {
    if (typeof response === 'undefined' || !response) { return undefined }
    const statusCode = $config.isNativeScript ? response.statusCode : response.status

    if (statusCode === 200) {
      let parsedResponse
      try {
        parsedResponse = $config.isNativeScript && response.content ? response.content.toJSON() : response.data
      } catch (e) {
        return undefined
      }
      return parsedResponse
    } else {
      return undefined
    }
  }

  public TryParseResponseWithError(response) {
    if (typeof response === "undefined" || !response) {
      return { error: "No response received" };
    }
    const statusCode = $config.isNativeScript ? response.statusCode : response.status;

    try {
      const parsedResponse = $config.isNativeScript && response.content ? response.content.toJSON() : response.data;
      if (statusCode === 200) {
        return { data: parsedResponse };
      } else {
        return { error: parsedResponse?.message || "Failed to parse response" };
      }
    } catch (e) {
      return { error: "Failed to parse response" };
    }
  }

  private DefaultRequest(path: string, payload: any, method: HttpMethod): any {
    return this.BuildRequest(path, method, payload ? JSON.stringify(payload) : '', this._vuexModule.state?.currentUser?.token)
  };

  private BuildRequest(path: string, method: HttpMethod, content?: string, bearerToken?: string): any {
    const request = { headers: {}, data: null }
    request[HttpProperty.Url] = this._baseUrl + path
    request[HttpProperty.Method] = method
    request.headers[HttpProperty.ContentType] = 'application/json; charset=utf-8'
    request.headers[HttpProperty.ClientPlatform] = this._vuexModule.getters.clientPlatformName || 'Unknown'
    request.headers[HttpProperty.ClientAppVersion] = $config.version

    if (content) {
      if ($config.isNativeScript) {
        request[HttpProperty.Content] = content
      } else {
        request[HttpProperty.Data] = JSON.parse(content)
      }
    }

    if (bearerToken) { request.headers[HttpProperty.Authorization] = 'Bearer ' + bearerToken }
    return request
  };

  private BuildHeadRequest(fullPath: string, method: HttpMethod): any {
    const request = { type: 'HEAD' }
    request[HttpProperty.Url] = fullPath
    request[HttpProperty.Method] = method
    return request
  };
}