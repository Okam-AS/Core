import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { SaftEmailExportModel, SaftEmailExportResult } from '../models';

// SAF-T Cash Register export for a store (SaftController, base /saft). Store read access
// (StoreAdmin or PowerUser); no operator-session header. The from / to values are inclusive local
// (Europe/Oslo) dates.
export class SaftService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // GET /saft/export -> raw SAF-T XML (application/xml). Returns the XML body as a string; it is
  // NOT JSON, so the response is read directly rather than through TryParseResponse.
  public async Export(storeId: number, from: string, to: string): Promise<string> {
    const path = '/saft/export?storeId=' + encodeURIComponent(storeId) + '&from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to);
    const response = await this._requestService.GetRequest(path);
    if (!response) { throw new Error('Failed to export SAF-T'); }
    if (response.data !== undefined && response.data !== null) {
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    }
    if (response.content && typeof response.content.toString === 'function') {
      return response.content.toString();
    }
    throw new Error('Failed to export SAF-T');
  }

  // POST /saft/export/email -> emails the export as an attachment.
  public async ExportEmail(model: SaftEmailExportModel): Promise<SaftEmailExportResult> {
    const response = await this._requestService.PostRequest('/saft/export/email', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to email SAF-T export'); }
    return parsed;
  }
}
