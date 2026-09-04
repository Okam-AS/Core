// What one row of the accounting posting log describes.
export enum AccountingPostingKind {
  OnlineDaily = 'OnlineDaily',
  PosZ = 'PosZ',
  Payout = 'Payout',
  Correction = 'Correction',
  // A balance-sheet movement posted separately from the sale it belongs to, because the provider
  // cannot express it on the sale (a cash-count difference or a bank deposit on Fiken).
  Adjustment = 'Adjustment'
}
