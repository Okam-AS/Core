// ---- WHY THIS FILE EXISTS ---------------------------------------------------------------------
//
// Two admin settings pages posted a PARTIAL FORM to a FULL-REPLACE endpoint, and both destroyed
// live configuration on the most ordinary action a person takes — pressing Save.
//
//   pages/admin/dintero.vue    never loaded the selected store's payment configuration on arrival.
//                              The watcher on `selectedStore` was not `immediate`, and the sidebar
//                              already carried the selected store id, so no change event ever
//                              fired. Save posted the EMPTY FORM DEFAULTS over the live record:
//                              Dintero account id, client id, CLIENT SECRET, split seller id,
//                              commission and the three Wolt fee fields.
//
//   pages/admin/surfboard.vue  omitted `tipsEnabled` from every save. The endpoint binds a missing
//                              key to the C# default, so each save silently turned tipping OFF,
//                              and the cost of that lands on staff rather than on the operator who
//                              pressed the button.
//
// Reading the two backend write models (OkamAPI 8e2b57de, Services/StoreService.cs:1266 and :1390,
// Models/{Dintero,Surfboard}/Update*StoreConfigurationModel.cs) shows both endpoints assign EVERY
// field of the write model unconditionally — there is no "leave it alone when absent" branch. A key
// the client does not send is therefore not "unchanged"; it is SET TO THE C# DEFAULT: `false` for a
// bool, `null` for a string, `0` for a number. That is what makes an omission destructive rather
// than merely incomplete.
//
// A third field was found by writing the contracts down: `kraviaMessage` is in the Dintero write
// model and in the GET projection, and dintero.vue has never sent it. Every Dintero save has been
// blanking it too. That is the argument for a guard rather than two patches — the shape recurs, and
// the third instance was already here before anyone went looking for it.
//
// ---- WHY A LOAD-BEFORE-EDIT GUARD, AND NOT PATCH ----------------------------------------------
//
// Three answers were available:
//
//   (a) PATCH-shaped request           — send only the fields the operator touched.
//   (b) server-side partial-update     — bind the write model to nullables and skip absent keys.
//   (c) load-before-edit guard         — refuse to post a full replacement that was not read first
//                                        and is not whole.
//
// (a) and (b) both require changing OkamAPI, which is a different repository. Neither can be landed
// or verified from here, and until the day both ship the client would still be free to send blanks.
// Worse, (b) makes "field absent" mean "keep" — which silently changes what EVERY existing caller's
// omission means, including callers written while the old meaning held.
//
// (c) is enforceable at the one seam every caller must pass through, `StoreService`, and it is
// fail-CLOSED: the write does not happen, and the operator is told why. A blocked save is a
// recoverable inconvenience; a save that blanks a client secret is not.
//
// This does not make (a)/(b) wrong. If OkamAPI later grows a partial-update contract, the right
// move is to keep this guard on the full-replace endpoints and give the partial ones no contract at
// all — an unregistered kind is refused, so the guard cannot be silently bypassed by a rename.
//
// ---- WHAT IS ENFORCED --------------------------------------------------------------------------
//
// For each registered full-replace endpoint, a write is allowed only when ALL of:
//
//   1. the endpoint has a declared contract naming every field it overwrites;
//   2. the record for THIS resource id was read successfully, by the matching read, first;
//   3. the payload carries every writable field, with a defined value.
//   4. the payload carries no field outside the contract.
//
// (2) is the dintero defect. (3) is the surfboard defect and the kraviaMessage one. (4) catches the
// misspelling that would otherwise satisfy (3) only by accident — `tipsEnable` reds twice, once as
// a missing field and once as an unknown one, instead of being read as "some other new field".
//
// (3) tests for `undefined`, not merely for key presence, because `JSON.stringify` DROPS an
// undefined value. `{ tipsEnabled: undefined }` reaches the server byte-for-byte identically to
// omitting the key, so a check that accepted key presence alone would pass a payload that is still
// destructive. That is not hypothetical here: surfboard.vue's `emptyConfig()` did not carry
// `tipsEnabled` at all, so reading it off the form object yields exactly that undefined.
//
// ---- SECRETS (C7) ------------------------------------------------------------------------------
//
// Both records carry a credential — Dintero's `clientSecret` and Surfboard's `webhookSecret`. This
// module therefore holds and reports FIELD NAMES ONLY. The ledger records that a read happened and
// when; it never keeps the record, and no code path here reads a payload VALUE or puts one in an
// Error message, a thrown object or a log call. Everything a `FullReplaceGuardError` carries is a
// key name, a resource id or a count.

// The declaration a full-replace endpoint must carry: which fields its write model overwrites.
// Mirrors the backend write model, and is the thing the author of the NEXT settings page has to
// write down — which is what makes an omission visible at authoring time instead of at save time.
export interface FullReplaceContract {
  kind: string;
  writableFields: ReadonlyArray<string>;
}

// Thrown instead of making the request. Callers surface `message` to the operator; the structured
// fields exist so a test can assert WHICH rule refused rather than matching on prose.
export class FullReplaceGuardError extends Error {
  public readonly isFullReplaceGuardError: boolean;
  public readonly reason: 'unregistered' | 'not-loaded' | 'incomplete';
  public readonly kind: string;
  public readonly resourceId: string | number;
  public readonly missingFields: Array<string>;
  public readonly unknownFields: Array<string>;

  constructor (
    reason: 'unregistered' | 'not-loaded' | 'incomplete',
    kind: string,
    resourceId: string | number,
    message: string,
    missingFields?: Array<string>,
    unknownFields?: Array<string>
  ) {
    super(message);
    // Subclassing Error across the TS/babel downlevel targets used here loses the prototype chain,
    // so `instanceof` is unreliable. `isFullReplaceGuardError` is the check callers should use.
    this.name = 'FullReplaceGuardError';
    this.isFullReplaceGuardError = true;
    this.reason = reason;
    this.kind = kind;
    this.resourceId = resourceId;
    this.missingFields = missingFields || [];
    this.unknownFields = unknownFields || [];
  }
}

const CONTRACTS: { [kind: string]: FullReplaceContract } = {};

// Module-level, deliberately. `StoreService` is constructed fresh on every access — both
// `core/pinia/services.ts` (`() => new StoreService(...)`) and `plugins/global-mixin.js`
// (`_storeService () { return new StoreService(...) }`) hand back a NEW instance each time — so the
// read and the write that follows it are never the same object, and instance state could not
// connect them.
//
// KNOWN LIMIT: under SSR this ledger is shared by every request served by the node process, so a
// read performed for one operator could satisfy the "was it read" rule for another operator's write
// of the same store within that process's lifetime. That is a false NEGATIVE (a write allowed that
// should have been refused), never a false positive, and the write is still authorised server-side
// by bearer token — this guard is a correctness guard over payload shape, not an access control.
// It does not arise on the two pages this exists for: both refuse to do anything until
// `mounted()` has checked `userIsLoggedIn` and the PowerUser claim, so every read and write here is
// issued client-side after login.
const READ_LEDGER: { [key: string]: number } = {};

function ledgerKey (kind: string, resourceId: string | number): string {
  return kind + '#' + String(resourceId);
}

export function registerFullReplaceContract (contract: FullReplaceContract): void {
  if (!contract || !contract.kind) {
    throw new Error('full-replace-guard: a contract must name its kind.');
  }
  if (!contract.writableFields || contract.writableFields.length === 0) {
    throw new Error('full-replace-guard: contract "' + contract.kind + '" declares no writable fields.');
  }
  const seen: { [field: string]: true } = {};
  for (const field of contract.writableFields) {
    if (seen[field]) {
      throw new Error('full-replace-guard: contract "' + contract.kind + '" names "' + field + '" twice.');
    }
    seen[field] = true;
  }
  CONTRACTS[contract.kind] = contract;
}

export function fullReplaceContractFor (kind: string): FullReplaceContract | undefined {
  return CONTRACTS[kind];
}

export function registeredFullReplaceKinds (): Array<string> {
  return Object.keys(CONTRACTS).sort();
}

// Called by the READ side, and only once the response has actually parsed. A failed or unparseable
// read must NOT record — "the request was attempted" is not "the record was read", and a form
// populated from a failed read holds defaults, which is the exact payload this guard exists to stop.
export function noteRecordLoaded (kind: string, resourceId: string | number): void {
  READ_LEDGER[ledgerKey(kind, resourceId)] = Date.now();
}

export function hasRecordBeenLoaded (kind: string, resourceId: string | number): boolean {
  return Object.prototype.hasOwnProperty.call(READ_LEDGER, ledgerKey(kind, resourceId));
}

// Drops the record of a read. Used when a page abandons a resource (e.g. the operator deselects the
// store and the form is reset to defaults), so that those defaults cannot later be posted as if
// they had been read.
export function forgetRecordLoaded (kind: string, resourceId: string | number): void {
  delete READ_LEDGER[ledgerKey(kind, resourceId)];
}

// Test-only. Not called by shipped code.
export function resetFullReplaceLedger (): void {
  for (const key of Object.keys(READ_LEDGER)) {
    delete READ_LEDGER[key];
  }
}

// The gate. Throws `FullReplaceGuardError` rather than returning a boolean so that it cannot be
// called and ignored: a caller who forgets to check a return value would ship the very defect this
// file is about.
export function assertFullReplaceIsSafe (kind: string, resourceId: string | number, payload: any): void {
  const contract = CONTRACTS[kind];
  if (!contract) {
    throw new FullReplaceGuardError(
      'unregistered',
      kind,
      resourceId,
      'Refusing to post "' + kind + '": no full-replace contract is registered for it. ' +
      'A full-replace endpoint must declare every field it overwrites before anything may be written through it.'
    );
  }

  if (!hasRecordBeenLoaded(kind, resourceId)) {
    throw new FullReplaceGuardError(
      'not-loaded',
      kind,
      resourceId,
      'Refusing to save: the current settings for this store were never loaded, so saving would ' +
      'overwrite them with the blank form. Reload the page and try again.'
    );
  }

  const carried = payload && typeof payload === 'object' ? payload : {};
  const missingFields: Array<string> = [];
  for (const field of contract.writableFields) {
    // `undefined` counts as missing: JSON.stringify drops it, so the request the server receives is
    // byte-identical to one that omitted the key, and the server writes its default over the record.
    if (!Object.prototype.hasOwnProperty.call(carried, field) || carried[field] === undefined) {
      missingFields.push(field);
    }
  }

  const writable: { [field: string]: true } = {};
  for (const field of contract.writableFields) { writable[field] = true; }
  const unknownFields = Object.keys(carried).filter(field => !writable[field]);

  if (missingFields.length > 0 || unknownFields.length > 0) {
    const parts: Array<string> = [];
    if (missingFields.length > 0) {
      parts.push('it does not carry ' + missingFields.join(', '));
    }
    if (unknownFields.length > 0) {
      parts.push('it carries ' + unknownFields.join(', ') + ', which this endpoint does not accept');
    }
    throw new FullReplaceGuardError(
      'incomplete',
      kind,
      resourceId,
      'Refusing to save: this request replaces the whole record, and ' + parts.join('; ') + '. ' +
      'Saving it would blank those fields.',
      missingFields,
      unknownFields
    );
  }
}
