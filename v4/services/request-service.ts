import { HttpMethod, HttpProperty } from "../enums";
import { HttpModule } from "../platform";
import { ICoreInitializer } from "../interfaces";
import $config from "../helpers/configuration";

export class RequestService {
  private _coreInitializer: ICoreInitializer;
  private _httpModule: typeof HttpModule;

  constructor(coreInitializer: ICoreInitializer) {
    this._coreInitializer = coreInitializer;
    this._httpModule = new HttpModule();
  }

  public DeleteRequest(path: string): Promise<any> {
    const request = this.DefaultRequest(path, undefined, HttpMethod.DELETE);
    return this._httpModule.httpClient(request).then((response) => {
      console.log("📲 " + response.statusCode + " " + path + "");
      return response;
    });
  }

  public GetRequest(path: string): Promise<any> {
    const request = this.DefaultRequest(path, false, HttpMethod.GET);
    return this._httpModule.httpClient(request).then((response) => {
      console.log("📲 " + response.statusCode + " " + path + "");
      return response;
    });
  }

  public PostRequest(path: string, payload?: any): Promise<any> {
    const request = this.DefaultRequest(path, payload, HttpMethod.POST);

    return this._httpModule.httpClient(request).then((response) => {
      console.log("📲 " + response.statusCode + " " + path + "");
      return response;
    });
  }

  public PutRequest(path: string, payload?: any): Promise<any> {
    const request = this.DefaultRequest(path, payload, HttpMethod.PUT);
    return this._httpModule.httpClient(request).then((response) => {
      console.log("📲 " + response.statusCode + " " + path + "");
      return response;
    });
  }

  public GetHeadRequest(fullPath: string): Promise<any> {
    const request = this.BuildHeadRequest(fullPath, HttpMethod.GET);
    return this._httpModule.httpClient(request);
  }

  public TryParseResponse(response) {
    if (typeof response === "undefined" || !response) {
      return undefined;
    }
    const statusCode = $config.isNativeScript ? response.statusCode : response.status;
    if (statusCode === 200) {
      let parsedResponse;
      try {
        parsedResponse = $config.isNativeScript && response.content ? response.content.toJSON() : response.data;
      } catch (e) {
        return undefined;
      }
      return parsedResponse;
    } else {
      return undefined;
    }
  }

  private DefaultRequest(path: string, payload: any, method: HttpMethod): any {
    return this.BuildRequest(path, method, payload ? JSON.stringify(payload) : "", this._coreInitializer.bearerToken);
  }

  private BuildRequest(path: string, method: HttpMethod, content?: string, bearerToken?: string): any {
    const request = { headers: {}, data: null };
    request[HttpProperty.Url] = $config.okamApiBaseUrl + path;
    request[HttpProperty.Method] = method;
    request.headers[HttpProperty.ContentType] = "application/json; charset=utf-8";
    request.headers[HttpProperty.ClientPlatform] = this._coreInitializer.clientPlatformName || "Unknown";
    request.headers[HttpProperty.Language] = this._coreInitializer.cultureCode || "no";
    request.headers[HttpProperty.ClientAppVersion] = $config.version;
    request.headers[HttpProperty.SelectedTheme] = $config.selectedTheme || "";

    console.log("🚀 " + method + " " + request[HttpProperty.Url]);
    if (content) {
      if ($config.isNativeScript) {
        request[HttpProperty.Content] = content;
      } else {
        request[HttpProperty.Data] = JSON.parse(content);
      }
    }

    if (bearerToken) {
      request.headers[HttpProperty.Authorization] = "Bearer " + bearerToken;
    }
    return request;
  }

  private BuildHeadRequest(fullPath: string, method: HttpMethod): any {
    const request = { type: "HEAD", headers: {} };
    request[HttpProperty.Url] = fullPath;
    request[HttpProperty.Method] = method;
    request.headers[HttpProperty.Language] = this._coreInitializer.cultureCode || "no";
    return request;
  }
}
