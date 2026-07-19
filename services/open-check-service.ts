import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import {
  OpenCheckRequest,
  AddCheckLineRequest,
  FireCourseRequest,
  MoveCheckRequest,
  MergeCheckRequest,
  SetCouvertsRequest,
  SetDeliveryTypeRequest,
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
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async GetCheck(orderId: number): Promise<CheckModel> {
    const response = await this._requestService.SafeGetRequest('/pos/check/' + orderId, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw this._requestService.BuildError('Failed to get check', response);
    }
    return parsed;
  }

  public async AddLine(orderId: number, request: AddCheckLineRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/line', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  // Adds one more of an existing line (POS "+"), copying its recipe server-side — works after a
  // refresh or on a resumed check where the client no longer holds the original request.
  public async DuplicateLine(orderId: number, lineId: string): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/line/' + lineId + '/duplicate', {}, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async RemoveLine(orderId: number, lineId: string): Promise<CheckModel> {
    const response = await this._requestService.SafeDeleteRequest('/pos/check/' + orderId + '/line/' + lineId, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  // Sends the check's newly added ("Ny") lines to the kitchen: every Pending kitchen-print relevant
  // line becomes Sent. Not a sale (nothing is journalled); idempotent, so re-sending only picks up
  // lines added since the last send.
  public async SendToKitchen(orderId: number): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/send', undefined, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  // Sets or clears a line's free-text note (e.g. "uten løk", an allergy). Descriptive only — not a
  // sale (nothing is journalled) — and it does not change the line's kitchen status. An empty note
  // clears it.
  public async SetLineNote(orderId: number, lineId: string, notes: string): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/line/' + lineId + '/note', { notes }, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  // Sets or clears a line's seat (the guest at the table it belongs to), a 1-99 descriptive tag the
  // POS uses to prefill a by-item split. Descriptive only — not a sale (nothing is journalled) — and
  // it does not change the line's kitchen status. Null clears the seat.
  public async SetLineSeat(orderId: number, lineId: string, seatNumber: number | null): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/line/' + lineId + '/seat', { seatNumber }, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async FireLine(orderId: number, lineId: string, request: FireCourseRequest): Promise<FireCourseResult> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/line/' + lineId + '/fire', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async Move(orderId: number, request: MoveCheckRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/move', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async Merge(orderId: number, request: MergeCheckRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/merge', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async SetCouverts(orderId: number, request: SetCouvertsRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/couverts', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  // Switches the check between eat-in and take-away; the server re-prices every line for the new
  // VAT context and returns the updated check.
  public async SetDeliveryType(orderId: number, request: SetDeliveryTypeRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/delivery-type', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async Park(orderId: number): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/park', undefined, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async Split(orderId: number, request: CheckSplitRequest): Promise<CheckSplitModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/split', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  // Reverts a split while no part is paid: the parts are cancelled and the original check
  // reopens with all its lines. The backend refuses as soon as any part has registered a payment.
  public async Unsplit(orderId: number): Promise<void> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/unsplit', undefined, this.sessionHeaders());
    const { error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
  }

  public async Resume(orderId: number, request: ResumeCheckRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/resume', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async ApplyLineDiscount(orderId: number, request: ApplyLineDiscountRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/discount/line', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async ApplyOrderDiscount(orderId: number, request: ApplyOrderDiscountRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/discount/order', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async RemoveLineDiscount(orderId: number, lineId: string): Promise<CheckModel> {
    const response = await this._requestService.SafeDeleteRequest('/pos/check/' + orderId + '/discount/line/' + lineId, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async RemoveOrderDiscount(orderId: number): Promise<CheckModel> {
    const response = await this._requestService.SafeDeleteRequest('/pos/check/' + orderId + '/discount/order', this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async VoidCheck(orderId: number, request: VoidCheckRequest): Promise<CheckModel> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/void', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  // Discards an empty open check (no line, nothing journalled) with no VOIDTRANS — e.g. a table the
  // operator opened and left without ringing anything in. Returns whether it was discarded; a check
  // that carries any line or journalled event is left untouched (discarded = false).
  public async DiscardEmptyCheck(orderId: number): Promise<{ discarded: boolean }> {
    const response = await this._requestService.PostRequest('/pos/check/' + orderId + '/discard-empty', {}, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw this._requestService.BuildError(error, response); }
    return data;
  }

  public async BoardStatus(storeId: number): Promise<BoardStatusModel> {
    const response = await this._requestService.SafeGetRequest('/pos/board-status/' + storeId, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw this._requestService.BuildError('Failed to get board status', response);
    }
    return parsed;
  }
}
