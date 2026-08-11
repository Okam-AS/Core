import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import {
  DinteroTerminalInitiateModel,
  DinteroTerminalInitResponse,
  DinteroTerminalStatusResponse,
  DinteroTerminalRawResponse,
  DinteroTerminalRefundModel,
  DinteroTerminalOperationModel,
  DinteroTerminalDiagnosticsResponse
} from '../models';

export class DinteroTerminalService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async Initiate(model: DinteroTerminalInitiateModel): Promise<DinteroTerminalInitResponse> {
    const response = await this._requestService.PostRequest('/DinteroTerminal/initiate', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to initiate Dintero terminal payment');
    }
    return parsed;
  }

  public async Status(sessionId: string): Promise<DinteroTerminalStatusResponse> {
    const response = await this._requestService.GetRequest('/DinteroTerminal/status/' + sessionId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get Dintero terminal status');
    }
    return parsed;
  }

  public async Cancel(sessionId: string): Promise<DinteroTerminalRawResponse> {
    const response = await this._requestService.PostRequest('/DinteroTerminal/cancel/' + sessionId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to cancel Dintero terminal session');
    }
    return parsed;
  }

  public async Refund(transactionId: string, model: DinteroTerminalRefundModel): Promise<DinteroTerminalRawResponse> {
    const response = await this._requestService.PostRequest('/DinteroTerminal/refund/' + transactionId, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to refund Dintero terminal transaction');
    }
    return parsed;
  }

  public async Operation(model: DinteroTerminalOperationModel): Promise<DinteroTerminalRawResponse> {
    const response = await this._requestService.PostRequest('/DinteroTerminal/operation', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to send Dintero terminal operation');
    }
    return parsed;
  }

  public async Diagnostics(): Promise<DinteroTerminalDiagnosticsResponse> {
    const response = await this._requestService.GetRequest('/DinteroTerminal/diagnostics');
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get Dintero terminal diagnostics');
    }
    return parsed;
  }
}
