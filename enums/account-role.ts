// What an account is FOR, independent of its number and of which accounting system holds it.
// Generic accounting code names a role; the store's account-role mapping turns that into the
// account code the provider wants.
//
// The PSP and the VAT rate are a QUALIFIER, not a member: Sales is qualified by a VatCategory
// member name and PspIntermediary by the provider name ("Dintero", "Surfboard"), so a third
// payment provider or a fifth VAT rate needs no enum change on either side.
export enum AccountRole {
  // Turnover. Qualified by the VatCategory member name.
  Sales = 'Sales',
  // Tips. Outside the VAT act, and on Fiken a cost or an income depending on company form.
  Tips = 'Tips',
  Rounding = 'Rounding',
  Bank = 'Bank',
  Cashbox = 'Cashbox',
  CashDifference = 'CashDifference',
  BankDeposit = 'BankDeposit',
  // The shared customer receivable (online card takings, Kravia).
  Receivables = 'Receivables',
  // The Company Meals credit sale's own interim account, deliberately not Receivables.
  CompanyReceivable = 'CompanyReceivable',
  // A payment provider's interim account ("mellomkonto"), qualified by the provider name.
  PspIntermediary = 'PspIntermediary',
  Fee = 'Fee'
}
