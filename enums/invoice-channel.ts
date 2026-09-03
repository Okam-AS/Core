// Who issues the store's invoices. Kravia is Okam's own channel (company recipients only, carries
// Okam's fee); AccountingSystem puts the receivable where the store's books are.
export enum InvoiceChannel {
  Kravia = 'Kravia',
  AccountingSystem = 'AccountingSystem'
}
