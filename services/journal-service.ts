import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import {
  JournalEntry,
  JournalEntryPageModel,
  JournalVerificationResult
} from '../models';

// Read-only, audited access to the append-only kassa journal (JournalController, base /journal).
// StoreAdmin (JWT) — PowerUser is allowed; no operator-session header.
export class JournalService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // Paged journal entries for a cash point, optionally windowed on the local timestamp.
  public async GetForCashPoint(cashPointId: number, from?: string, to?: string, page: number = 1, pageSize: number = 100): Promise<JournalEntryPageModel> {
    let path = '/journal/cashpoint/' + cashPointId + '?page=' + encodeURIComponent(page) + '&pageSize=' + encodeURIComponent(pageSize);
    if (from) { path += '&from=' + encodeURIComponent(from); }
    if (to) { path += '&to=' + encodeURIComponent(to); }
    const response = await this._requestService.GetRequest(path);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to get journal page'); }
    return parsed;
  }

  // Store-wide history, newest first — the register's receipt browser. Same auth as the
  // per-cash-point read; it exists because a customer returns to whichever register is free.
  // receiptsOnly (server default true) drops the events that are not documents issued to a
  // customer — drawer opens, day open/close, X reports — so paging counts purchases, not noise.
  public async GetForStore(storeId: number, from?: string, to?: string, page: number = 1, pageSize: number = 100, receiptsOnly: boolean = true): Promise<JournalEntryPageModel> {
    let path = '/journal/store/' + storeId + '?page=' + encodeURIComponent(page) + '&pageSize=' + encodeURIComponent(pageSize) + '&receiptsOnly=' + (receiptsOnly ? 'true' : 'false');
    if (from) { path += '&from=' + encodeURIComponent(from); }
    if (to) { path += '&to=' + encodeURIComponent(to); }
    const response = await this._requestService.GetRequest(path);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to get journal entries'); }
    return parsed;
  }

  public async GetEntry(journalEntryId: number): Promise<JournalEntry> {
    const response = await this._requestService.GetRequest('/journal/entry/' + journalEntryId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to get journal entry'); }
    return parsed;
  }

  public async Verify(cashPointId: number): Promise<JournalVerificationResult> {
    const response = await this._requestService.GetRequest('/journal/verify/' + cashPointId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to verify journal'); }
    return parsed;
  }
}
