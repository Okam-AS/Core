export class AccountingConfiguration {
  public accountNumber0Percent: string
  // Tips fall outside the VAT base (not zero-rated sales), so they post to their own account when
  // set, falling back to accountNumber0Percent. Optional.
  public accountNumberTips: string
  // Low rate (12%, SAF-T 33). Optional — most stores don't sell on the low rate.
  public accountNumber12Percent: string
  public accountNumber15Percent: string
  public accountNumber25Percent: string
  public accountNumberReceivables: string
  public enabled: boolean
  public callbackUrl: string
}
