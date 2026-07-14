import { ICoreInitializer } from '../interfaces';
import {
  UpsertTripletexConnectionModel,
  TripletexConnectionStatus,
  AccountingExportResult,
  TripletexPayoutReconciliation,
  TripletexVoucher,
  TripletexVoucherLogEntry
} from '../models';
import { RequestService } from './request-service';

// PowerUser-only Tripletex direct-accounting administration (TripletexAdminController): connect a
// store's Tripletex account by pasting its token, see status/config gaps, and manually re-run
// vouchers (online day voucher, POS per Z-report, and Dintero/Surfboard payouts). All re-runs are
// idempotent server-side.
export class TripletexService {
  private _requestService: RequestService;

  constructor (coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // --- Connection / onboarding ---

  // Paste a store's token to create/update the connection; validates it live and reports config gaps.
  public async upsertConnection (storeId: number, model: UpsertTripletexConnectionModel): Promise<TripletexConnectionStatus> {
    const response = await this._requestService.PostRequest('/tripletex-admin/stores/' + storeId + '/connection', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to save Tripletex connection'); }
    return parsed;
  }

  public async getStatus (storeId: number): Promise<TripletexConnectionStatus> {
    const response = await this._requestService.GetRequest('/tripletex-admin/stores/' + storeId + '/status');
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to load Tripletex status'); }
    return parsed;
  }

  // Re-validate the stored token live (mints a session, calls whoAmI, re-checks the accounts).
  public async validate (storeId: number): Promise<TripletexConnectionStatus> {
    const response = await this._requestService.PostRequest('/tripletex-admin/stores/' + storeId + '/validate', {});
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to validate Tripletex connection'); }
    return parsed;
  }

  public async getReconciliation (storeId: number): Promise<TripletexPayoutReconciliation> {
    const response = await this._requestService.GetRequest('/tripletex-admin/stores/' + storeId + '/reconciliation');
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to load reconciliation'); }
    return parsed;
  }

  // Fetch a single posted voucher (with its posting lines) live from Tripletex, to verify it
  // line-for-line against what Okam posted.
  public async getVoucher (storeId: number, voucherId: number): Promise<TripletexVoucher> {
    const response = await this._requestService.GetRequest('/tripletex-admin/stores/' + storeId + '/voucher/' + voucherId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to load voucher'); }
    return parsed;
  }

  // Reverse (credit) a wrongly-posted voucher on the given date (today when omitted). Returns the
  // reversal voucher; the original's local log entry is marked Reversed server-side.
  public async reverseVoucher (storeId: number, voucherId: number, date?: string): Promise<TripletexVoucher> {
    const query = date ? ('?date=' + encodeURIComponent(date)) : '';
    const response = await this._requestService.PostRequest('/tripletex-admin/stores/' + storeId + '/voucher/' + voucherId + '/reverse' + query, {});
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to reverse voucher'); }
    return parsed;
  }

  // The store's failed voucher-log entries (what did not post, why), for the go-live monitor.
  public async getFailedVouchers (storeId: number): Promise<TripletexVoucherLogEntry[]> {
    const response = await this._requestService.GetRequest('/tripletex-admin/stores/' + storeId + '/failed-vouchers');
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to load failed vouchers'); }
    return parsed;
  }

  // --- Manual re-run (idempotent) ---

  // Re-run the online day voucher for a date (Tripletex only; never re-fires the eMonkey webhook).
  public async exportOnline (storeId: number, date?: string): Promise<AccountingExportResult> {
    const query = date ? '?date=' + encodeURIComponent(date) : '';
    const response = await this._requestService.PostRequest('/tripletex-admin/stores/' + storeId + '/export/online' + query, {});
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to export online day voucher'); }
    return parsed;
  }

  // Export every Z-report generated for the store on a date.
  public async exportPos (storeId: number, date?: string): Promise<AccountingExportResult[]> {
    const query = date ? '?date=' + encodeURIComponent(date) : '';
    const response = await this._requestService.PostRequest('/tripletex-admin/stores/' + storeId + '/export/pos' + query, {});
    const parsed = this._requestService.TryParseResponse(response);
    return parsed === undefined ? [] : parsed;
  }

  public async exportPosZReport (storeId: number, zReportId: number): Promise<AccountingExportResult> {
    const response = await this._requestService.PostRequest('/tripletex-admin/stores/' + storeId + '/export/pos/zreport/' + zReportId, {});
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to export Z-report'); }
    return parsed;
  }

  public async exportDintero (storeId: number, from: string, to: string): Promise<AccountingExportResult[]> {
    const query = '?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to);
    const response = await this._requestService.PostRequest('/tripletex-admin/stores/' + storeId + '/export/dintero' + query, {});
    const parsed = this._requestService.TryParseResponse(response);
    return parsed === undefined ? [] : parsed;
  }

  public async exportSurfboard (storeId: number): Promise<AccountingExportResult[]> {
    const response = await this._requestService.PostRequest('/tripletex-admin/stores/' + storeId + '/export/surfboard', {});
    const parsed = this._requestService.TryParseResponse(response);
    return parsed === undefined ? [] : parsed;
  }
}
