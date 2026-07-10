import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { XReportModel, ZReportModel } from '../models';

// X and Z reports for a cash point (ReportController, base /report). The X report (GET) is a pure
// projection of the journal; the Z report (POST) cuts the period and appends a signed ZREP entry —
// it is a POS write and resolves the operator session, so set operatorSessionId beforehand.
export class ReportService {
  private _requestService: RequestService;
  public operatorSessionId: string = '';

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  private sessionHeaders(): Record<string, string> | undefined {
    return this.operatorSessionId ? { 'X-Operator-Session': this.operatorSessionId } : undefined;
  }

  public async XReport(cashPointId: number): Promise<XReportModel> {
    const response = await this._requestService.GetRequest('/report/cashpoint/' + cashPointId + '/x', this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to get X report'); }
    return parsed;
  }

  public async ZReport(cashPointId: number): Promise<ZReportModel> {
    const response = await this._requestService.PostRequest('/report/cashpoint/' + cashPointId + '/z', undefined, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to produce Z report'); }
    return parsed;
  }
}
