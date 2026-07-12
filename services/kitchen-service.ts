import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { KitchenBoardModel } from '../models';
import { OrderLineItemStatus } from '../enums';

// The unified kitchen display feed (KDS) and its bump / recall mutations (plan Fase 3). Unlike the
// POS serving surface (OpenCheckService), the kitchen is NOT an operator session: it is a
// back-of-house store read/write surface gated by the JWT caller's StoreAdmin / PowerUser access,
// so there is no X-Operator-Session header. Bumping a POS line sets its coursing status and never
// captures a payment. Every call returns the refreshed board.
export class KitchenService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // The unified board for a store: POS table checks (only kitchen-relevant lines already sent) plus
  // online orders that are Accepted / Processing.
  public async GetBoard(storeId: number): Promise<KitchenBoardModel> {
    const response = await this._requestService.GetRequest('/kitchen/' + storeId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get kitchen board');
    }
    return parsed;
  }

  // Bumps one POS check line to a target status (default Ready when status is omitted).
  public async BumpLine(storeId: number, orderId: number, lineId: string, status?: OrderLineItemStatus): Promise<KitchenBoardModel> {
    const response = await this._requestService.PostRequest('/kitchen/' + storeId + '/line/' + orderId + '/' + lineId + '/bump', { status: status ?? null });
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  // Bumps every kitchen-active line of a POS check's course to Ready.
  public async BumpCourse(storeId: number, orderId: number, courseSequence: number): Promise<KitchenBoardModel> {
    const response = await this._requestService.PostRequest('/kitchen/' + storeId + '/course/' + orderId + '/' + courseSequence + '/bump', undefined);
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  // Bumps a whole ticket: a POS check's kitchen-active lines to Ready, or an online order to its
  // delivery-type's ready status.
  public async BumpTicket(storeId: number, orderId: number): Promise<KitchenBoardModel> {
    const response = await this._requestService.PostRequest('/kitchen/' + storeId + '/ticket/' + orderId + '/bump', undefined);
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  // Recalls (undoes a bump on) one POS check line: Ready -> Fired, or Served -> Ready.
  public async RecallLine(storeId: number, orderId: number, lineId: string): Promise<KitchenBoardModel> {
    const response = await this._requestService.PostRequest('/kitchen/' + storeId + '/line/' + orderId + '/' + lineId + '/recall', undefined);
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }
}
