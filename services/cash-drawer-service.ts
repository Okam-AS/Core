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
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) {
      throw this._requestService.BuildError(error, response);
    }
    return data;
  }

  // Returns the cash point's open trading day, or null when no day is open (HTTP 404). Used at POS
  // startup to restore the open-day state without re-opening the day.
  public async GetCurrentDay(cashPointId: number): Promise<CashDrawerSession | null> {
    const response = await this._requestService.SafeGetRequest('/cashdrawer/' + cashPointId + '/current', this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed !== undefined) { return parsed; }
    // Only a 404 means "no trading day open"; a 401/500/network failure must surface, or a
    // transient error would wrongly show the Begin Day flow over an already-open day.
    if (this._requestService.TryGetStatusCode(response) === 404) { return null; }
    throw this._requestService.BuildError('Failed to get current day', response);
  }

  public async RecordTransaction(sessionId: number, request: CashDrawerTransactionRequest): Promise<CashDrawerTransaction> {
    const response = await this._requestService.PostRequest('/cashdrawer/' + sessionId + '/transaction', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) {
      throw this._requestService.BuildError(error, response);
    }
    return data;
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
    const response = await this._requestService.SafeGetRequest(path, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw this._requestService.BuildError('Failed to get end-of-day summary', response);
    }
    return parsed;
  }

  public async EndDay(sessionId: number, request: EndDayRequest): Promise<EodSummaryModel> {
    const response = await this._requestService.PostRequest('/cashdrawer/' + sessionId + '/end-day', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) {
      throw this._requestService.BuildError(error, response);
    }
    return data;
  }
}
