import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import {
  OpenCheckRequest,
  AddCheckLineRequest,
  FireCourseRequest,
  MoveCheckRequest,
  MergeCheckRequest,
  SetCouvertsRequest,
  ResumeCheckRequest,
  CheckModel,
  FireCourseResult,
  CheckSplitRequest,
  CheckSplitModel,
  ApplyLineDiscountRequest,
  ApplyOrderDiscountRequest,
  VoidCheckRequest,
  BoardStatusModel
} from '../models';

export class OpenCheckService {
  private _requestService: RequestService;
  public operatorSessionId: string = '';

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  private sessionHeaders(): Record<string, string> | undefined {
    return this.operatorSessionId ? { 'X-Operator-Session': this.operatorSessionId } : undefined;
  }

  public async OpenCheck(request: OpenCheckRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/open', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to open check');
    }
    return parsed;
  }

  public async GetCheck(orderId: number): Promise<CheckModel> {
    const response = await this._requestService.GetRequest('/pos/check/' + orderId, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get check');
    }
    return parsed;
  }

  public async AddLine(orderId: number, request: AddCheckLineRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/line', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to add check line');
    }
    return parsed;
  }

  public async RemoveLine(orderId: number, lineId: string): Promise<CheckModel> {
    const response = await this._requestService.DeleteRequest('/pos/check/' + orderId + '/line/' + lineId, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to remove check line');
    }
    return parsed;
  }

  public async FireLine(orderId: number, lineId: string, request: FireCourseRequest): Promise<FireCourseResult> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/line/' + lineId + '/fire', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to fire course');
    }
    return parsed;
  }

  public async Move(orderId: number, request: MoveCheckRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/move', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to move check');
    }
    return parsed;
  }

  public async Merge(orderId: number, request: MergeCheckRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/merge', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to merge check');
    }
    return parsed;
  }

  public async SetCouverts(orderId: number, request: SetCouvertsRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/couverts', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to set couverts');
    }
    return parsed;
  }

  public async Park(orderId: number): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/park', undefined, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to park check');
    }
    return parsed;
  }

  public async Split(orderId: number, request: CheckSplitRequest): Promise<CheckSplitModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/split', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to split check');
    }
    return parsed;
  }

  public async Resume(orderId: number, request: ResumeCheckRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/resume', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to resume check');
    }
    return parsed;
  }

  public async ApplyLineDiscount(orderId: number, request: ApplyLineDiscountRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/discount/line', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to apply line discount');
    }
    return parsed;
  }

  public async ApplyOrderDiscount(orderId: number, request: ApplyOrderDiscountRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/discount/order', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to apply order discount');
    }
    return parsed;
  }

  public async VoidCheck(orderId: number, request: VoidCheckRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/void', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to void check');
    }
    return parsed;
  }

  public async BoardStatus(storeId: number): Promise<BoardStatusModel> {
    const response = await this._requestService.GetRequest('/pos/board-status/' + storeId, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get board status');
    }
    return parsed;
  }
}
