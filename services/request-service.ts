import { HttpMethod, HttpProperty } from "../enums";
import { getHttpModule } from "../platform";
import { ICoreInitializer, IHttpModule } from "../interfaces";
import $config from "../helpers/configuration";

export class RequestService {
  private _coreInitializer: ICoreInitializer;
  private _httpModule: IHttpModule;

  constructor(coreInitializer: ICoreInitializer) {
    this._coreInitializer = coreInitializer;
    const HttpModule = getHttpModule();
    this._httpModule = new HttpModule();
  }

  public FormdataRequest(path: string, method: HttpMethod, fileParamName: string, filePath: string, otherParams?: Array<any>): any {
    const request = this.BuildRequest(path, method, '', this._coreInitializer.bearerToken);
    request.headers[HttpProperty.ContentType] = 'application/octet-stream';
    request.description = 'Uploading file';

    const params = (otherParams || []);
    params.push({ name: fileParamName, filename: filePath, mimeType: 'image/png' });
    const task = this._httpModule.bghttp.session('file-upload-id-' + Math.floor(Math.random() * 1000), true).multipartUpload(params, request);

    return task;
  }

  public DeleteRequest(path: string): Promise<any> {
    const request = this.DefaultRequest(path, undefined, HttpMethod.DELETE);
    return this._httpModule.httpClient(request).then((response) => {
      return response;
    });
  }

  public GetRequest(path: string): Promise<any> {
    const request = this.DefaultRequest(path, false, HttpMethod.GET);
    return this._httpModule.httpClient(request).then((response) => {
      return response;
    });
  }

  public PostFormDataRequest(path: string, formData: any): Promise<any> {
    const request = { headers: {}, data: null };
    request[HttpProperty.Url] = $config.okamApiBaseUrl + path;
    request[HttpProperty.Method] = HttpMethod.POST;
    request.headers[HttpProperty.ContentType] = 'multipart/form-data';
    request.headers[HttpProperty.ClientPlatform] = this._coreInitializer.clientPlatformName || 'Unknown';
    request.headers[HttpProperty.ClientAppVersion] = $config.version;
    request[HttpProperty.Data] = formData;

    const token = this._coreInitializer.bearerToken;
    if (token) { request.headers[HttpProperty.Authorization] = 'Bearer ' + token; }

    return this._httpModule.httpClient(request).then((response) => {
      return response;
    });
  }

  /**
   * `extraHeaders` exists for the endpoints whose CONTRACT is a header rather than a body field —
   * today that is the Meals `Idempotency-Key`, which the API refuses a mutation without. Building a
   * header bag at the call site instead would put the contract somewhere no other client can see it.
   *
   * Note the `.catch` below: a non-2xx does NOT reject out of this method, it resolves with the
   * axios error. Callers that need a typed refusal (an RFC 9457 `problem+json`) must read it with
   * `TryParseProblem`, because `TryParseResponse` answers `undefined` for every failure alike.
   */
  public PostRequest(path: string, payload?: any, extraHeaders?: Record<string, string>): Promise<any> {
    const request = this.DefaultRequest(path, payload, HttpMethod.POST, extraHeaders);
    return this._httpModule.httpClient(request).then((response) => {
      return response;
    }).catch((error) => {
      return error;
    });
  }

  public PutRequest(path: string, payload?: any): Promise<any> {
    const request = this.DefaultRequest(path, payload, HttpMethod.PUT);
    return this._httpModule.httpClient(request).then((response) => {
      return response;
    });
  }

  public PatchRequest(path: string, payload?: any): Promise<any> {
    const request = this.DefaultRequest(path, payload, HttpMethod.PATCH);
    return this._httpModule.httpClient(request).then((response) => {
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

  /**
   * The body of an RFC 9457 `problem+json` refusal, from either shape this class can hand back: a
   * resolved non-2xx response, or the axios error `PostRequest` resolves with. Returns `undefined`
   * when there is no problem body to read, so a caller can tell "the server refused and said why"
   * apart from "the request never arrived".
   */
  public TryParseProblem(responseOrError: any): any {
    const body = responseOrError?.response?.data ?? responseOrError?.data;
    if (!body || typeof body !== "object") { return undefined; }
    const status = responseOrError?.response?.status ?? responseOrError?.status;
    if (status && status >= 200 && status < 300) { return undefined; }
    return body;
  }

  private DefaultRequest(path: string, payload: any, method: HttpMethod, extraHeaders?: Record<string, string>): any {
    return this.BuildRequest(path, method, payload ? JSON.stringify(payload) : "", this._coreInitializer.bearerToken, extraHeaders);
  }

  private BuildRequest(path: string, method: HttpMethod, content?: string, bearerToken?: string, extraHeaders?: Record<string, string>): any {
    const request = { headers: {}, data: null };
    request[HttpProperty.Url] = $config.okamApiBaseUrl + path;
    request[HttpProperty.Method] = method;
    request.headers[HttpProperty.ClientPlatform] = this._coreInitializer.clientPlatformName || "Unknown";
    request.headers[HttpProperty.Language] = this._coreInitializer.cultureCode || "no";
    request.headers[HttpProperty.ClientAppVersion] = $config.version;
    request.headers[HttpProperty.ClientFeatures] = "kravia";
    request.headers[HttpProperty.SelectedTheme] = $config.selectedTheme || "";

    if (content) {
      request.headers[HttpProperty.ContentType] = "application/json; charset=utf-8";
      if ($config.isNativeScript) {
        request[HttpProperty.Content] = content;
      } else {
        request[HttpProperty.Data] = JSON.parse(content);
      }
    }

    if (bearerToken) {
      request.headers[HttpProperty.Authorization] = "Bearer " + bearerToken;
    }

    if (extraHeaders) {
      Object.keys(extraHeaders).forEach((name) => {
        if (extraHeaders[name] !== undefined && extraHeaders[name] !== null) { request.headers[name] = extraHeaders[name]; }
      });
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
