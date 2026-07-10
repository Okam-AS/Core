import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import {
  BeginDayRequest,
  CashDrawerTransactionRequest,
  EndDayRequest,
  EodSummaryModel,
  CashDrawerSession,
  CashDrawerTransaction
} from '../models';

export class CashDrawerService {
  private _requestService: RequestService;

  // Set once by the caller after login; sent as X-Operator-Session on every cash-drawer endpoint.
  public operatorSessionId: string = '';

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  private sessionHeaders(): Record<string, string> | undefined {
    return this.operatorSessionId ? { 'X-Operator-Session': this.operatorSessionId } : undefined;
  }

  public async BeginDay(cashPointId: number, request: BeginDayRequest): Promise<CashDrawerSession> {
    const response = await this._requestService.PostRequest('/cashdrawer/' + cashPointId + '/begin-day', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to begin day');
    }
    return parsed;
  }

  public async RecordTransaction(sessionId: number, request: CashDrawerTransactionRequest): Promise<CashDrawerTransaction> {
    const response = await this._requestService.PostRequest('/cashdrawer/' + sessionId + '/transaction', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to record cash drawer transaction');
    }
    return parsed;
  }

  public async EodSummary(sessionId: number, countedAmount?: number, bankDepositAmount?: number): Promise<EodSummaryModel> {
    let path = '/cashdrawer/' + sessionId + '/eod-summary';
    const params: Array<string> = [];
    if (countedAmount !== undefined && countedAmount !== null) {
      params.push('countedAmount=' + encodeURIComponent(countedAmount));
    }
    if (bankDepositAmount !== undefined && bankDepositAmount !== null) {
      params.push('bankDepositAmount=' + encodeURIComponent(bankDepositAmount));
    }
    if (params.length > 0) {
      path += '?' + params.join('&');
    }
    const response = await this._requestService.GetRequest(path, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get end-of-day summary');
    }
    return parsed;
  }

  public async EndDay(sessionId: number, request: EndDayRequest): Promise<EodSummaryModel> {
    const response = await this._requestService.PostRequest('/cashdrawer/' + sessionId + '/end-day', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to end day');
    }
    return parsed;
  }
}
