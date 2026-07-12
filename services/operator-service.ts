import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import {
  OperatorModel,
  OperatorUpsertModel,
  SetOperatorPinRequest,
  OperatorLoginRequest,
  OperatorSessionModel
} from '../models';

export class OperatorService {
  private _requestService: RequestService;

  // Set once by the caller after login; sent as X-Operator-Session on session-scoped endpoints.
  public operatorSessionId: string = '';

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  private sessionHeaders(): Record<string, string> | undefined {
    return this.operatorSessionId ? { 'X-Operator-Session': this.operatorSessionId } : undefined;
  }

  public async GetForStore(storeId: number): Promise<Array<OperatorModel>> {
    const response = await this._requestService.GetRequest('/Operator?storeId=' + encodeURIComponent(storeId));
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get operators');
    }
    return parsed;
  }

  public async Get(id: number): Promise<OperatorModel> {
    const response = await this._requestService.GetRequest('/Operator/' + id);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get operator');
    }
    return parsed;
  }

  // Restores the operator session tied to operatorSessionId (X-Operator-Session) without a PIN,
  // e.g. after a page refresh. Rejects (401) when the session is missing / ended / expired.
  public async GetSession(): Promise<OperatorSessionModel> {
    const response = await this._requestService.GetRequest('/Operator/session', this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get operator session');
    }
    return parsed;
  }

  public async Create(model: OperatorUpsertModel): Promise<OperatorModel> {
    const response = await this._requestService.PostRequest('/Operator', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to create operator');
    }
    return parsed;
  }

  public async Update(id: number, model: OperatorUpsertModel): Promise<OperatorModel> {
    const response = await this._requestService.PutRequest('/Operator/' + id, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to update operator');
    }
    return parsed;
  }

  public async SetPin(id: number, request: SetOperatorPinRequest): Promise<boolean> {
    const response = await this._requestService.PostRequest('/Operator/' + id + '/pin', request);
    return this._requestService.TryParseResponse(response) !== undefined;
  }

  public async Delete(id: number): Promise<boolean> {
    const response = await this._requestService.DeleteRequest('/Operator/' + id);
    return this._requestService.TryParseResponse(response) !== undefined;
  }

  public async Login(request: OperatorLoginRequest): Promise<OperatorSessionModel> {
    const response = await this._requestService.PostRequest('/Operator/login', request);
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) {
      throw new Error(error);
    }
    return data;
  }

  public async Switch(request: OperatorLoginRequest): Promise<OperatorSessionModel> {
    const response = await this._requestService.PostRequest('/Operator/switch', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) {
      throw new Error(error);
    }
    return data;
  }

  public async Logout(): Promise<boolean> {
    const response = await this._requestService.PostRequest('/Operator/logout', undefined, this.sessionHeaders());
    return this._requestService.TryParseResponse(response) !== undefined;
  }
}
