import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import {
  AccountingConnectionStatus,
  AccountRoleRequirement,
  AccountingReconciliation,
  AccountingPostingLogModel,
  AccountingPostingResult,
  SaveAccountRoleModel,
  RerunPayoutModel
} from '../models';
import { AccountingSystem } from '../enums';

// The inclusive Oslo calendar-date range (yyyy-MM-dd) the figures are summed over, filtered on the
// business date. Both absent sums everything. `system` names one accounting system explicitly;
// without it `allSystems` decides between the store's current system and every system it has ever
// posted through.
export interface ReconciliationQuery {
  allSystems?: boolean;
  from?: string;
  to?: string;
  system?: AccountingSystem;
}

// One accounting administration surface for every provider (AccountingAdminController). The store's
// chosen accounting system decides which implementation answers; the response shape does not change
// with it, so the admin UI is driven by capabilities and by the role list rather than by a branch
// per system.
//
// Authorisation is per action, not per class: the store's own setup surface — status, verify,
// ensure-accounts, the role map, reconciliation — authorises on the STORE, which a store admin
// passes for their own store. Only the re-runs and the retry, which post into a merchant's books on
// their behalf, require PowerUser.
export class AccountingAdminService {
  private _requestService: RequestService;

  constructor (coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // --- Connection ---

  // The stored state. Does not call the accounting system.
  public async Status (storeId: number): Promise<AccountingConnectionStatus> {
    return this.Send(this._requestService.GetRequest(this.Base(storeId) + '/status'), 'Kunne ikke hente regnskapsstatus');
  }

  // Proves the stored credential against the provider and records the outcome.
  public async Verify (storeId: number): Promise<AccountingConnectionStatus> {
    return this.Send(this._requestService.PostRequest(this.Base(storeId) + '/verify', {}), 'Kunne ikke verifisere tilkoblingen');
  }

  // Creates whatever operational accounts the provider is able to create. A provider that cannot
  // create ledger accounts answers with the same status and an unchanged missing-role list — the
  // honest answer, not a failure: the merchant creates those accounts themselves.
  public async EnsureAccounts (storeId: number): Promise<AccountingConnectionStatus> {
    return this.Send(this._requestService.PostRequest(this.Base(storeId) + '/ensure-accounts', {}), 'Kunne ikke opprette kontoer');
  }

  // --- Account roles ---

  public async GetRoleMappings (storeId: number): Promise<AccountRoleRequirement[]> {
    return this.Send(this._requestService.GetRequest(this.Base(storeId) + '/roles'), 'Kunne ikke hente kontoroller');
  }

  // Upserts the whole set in one call and answers with the re-read requirement list. A blank
  // accountCode deletes that row rather than storing an empty string.
  public async UpsertRoleMappings (storeId: number, roles: SaveAccountRoleModel[]): Promise<AccountRoleRequirement[]> {
    return this.Send(this._requestService.PutRequest(this.Base(storeId) + '/roles', roles), 'Kunne ikke lagre kontoroller');
  }

  // --- Reconciliation and re-runs ---

  // Filtering is the SERVER's: the totals are of the requested range, not of the whole history with
  // a filtered list beside them, so a client that narrows the range in its own code shows sums that
  // do not belong to the period it is displaying. The response echoes `from`/`to`.
  //
  // A date that is present but unparseable is refused by the backend rather than treated as absent.
  public async Reconciliation (storeId: number, query: ReconciliationQuery = {}): Promise<AccountingReconciliation> {
    const parameters: string[] = ['allSystems=' + (query.allSystems ? 'true' : 'false')];
    if (query.from) { parameters.push('from=' + encodeURIComponent(query.from)); }
    if (query.to) { parameters.push('to=' + encodeURIComponent(query.to)); }
    if (query.system) { parameters.push('system=' + encodeURIComponent(query.system)); }
    return this.Send(
      this._requestService.GetRequest(this.Base(storeId) + '/reconciliation?' + parameters.join('&')),
      'Kunne ikke hente avstemming');
  }

  // Re-runs the online day voucher. Idempotent server-side; an omitted date means yesterday.
  // PowerUser only.
  public async RerunDay (storeId: number, date?: string): Promise<AccountingPostingResult> {
    const query = date ? '?date=' + encodeURIComponent(date) : '';
    return this.Send(this._requestService.PostRequest(this.Base(storeId) + '/export/online' + query, {}), 'Kunne ikke kjøre dagsbilaget');
  }

  // Re-runs one Z-report's POS voucher. Identified by the Z-report, not by a date: a register can
  // close more than once a day. PowerUser only.
  public async RerunZ (storeId: number, zReportId: number): Promise<AccountingPostingResult> {
    return this.Send(this._requestService.PostRequest(this.Base(storeId) + '/export/register/' + zReportId, {}), 'Kunne ikke kjøre Z-bilaget');
  }

  // PowerUser only.
  public async RerunPayout (storeId: number, model: RerunPayoutModel): Promise<AccountingPostingResult> {
    return this.Send(this._requestService.PostRequest(this.Base(storeId) + '/export/payout', model), 'Kunne ikke kjøre utbetalingsbilaget');
  }

  // Clears a failed posting's claim so the next run may take the key again. It does NOT re-post —
  // call one of the re-run methods for that. The separation matters when the failure was a timeout
  // and the provider may have received the document after all. PowerUser only.
  public async RetryPosting (storeId: number, postingId: number): Promise<AccountingPostingLogModel> {
    return this.Send(this._requestService.PostRequest(this.Base(storeId) + '/postings/' + postingId + '/retry', {}), 'Kunne ikke nullstille posteringen');
  }

  private Base (storeId: number): string {
    return '/accounting-admin/stores/' + storeId;
  }

  private async Send (request: Promise<any>, fallback: string): Promise<any> {
    const response = await request.catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || fallback); }
    return parsed.data;
  }
}
