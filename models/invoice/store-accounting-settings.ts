import { AccountingSystem, InvoiceChannel } from '../../enums';

// A store's accounting/invoicing choice (GET/PUT stores/{id}/accounting-settings). Field names are
// the camelCase of the backend C# models; enums serialize as their member names.
export class StoreAccountingSettings {
  storeId: number;
  accountingSystem: AccountingSystem;
  invoiceChannel: InvoiceChannel;
  invoiceDueDays: number;
  // False when the store has never been configured, so the values above are the defaults.
  isConfigured: boolean;
}

export class UpdateStoreAccountingSettingsModel {
  accountingSystem: AccountingSystem;
  invoiceChannel: InvoiceChannel;
  invoiceDueDays: number;
}

// The resolved view (GET .../accounting-settings/effective): what admin and POS need in order to
// offer or hide "send invoice" without re-deriving whether the accounting system can issue today.
export class EffectiveAccountingSettings {
  storeId: number;
  accountingSystem: AccountingSystem;
  invoiceChannel: InvoiceChannel;
  invoiceDueDays: number;
  canInvoiceViaAccountingSystem: boolean;
  // Norwegian explanation when it cannot; null when it can.
  blockedReason: string | null;
}
