// How far an order got through issuing its invoice. Pending also covers an attempt that died in
// flight; retry is safe because the issuer keys on the stored external id.
export enum InvoiceIssueStatus {
  None = 'None',
  Pending = 'Pending',
  Issued = 'Issued',
  Sent = 'Sent',
  Failed = 'Failed'
}
