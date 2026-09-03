// How an issued invoice reached its recipient. Ehf (Peppol) is attempted only for a company with an
// organisation number, and falls back to Email; Kravia issues and delivers in one step.
export enum InvoiceSendMethod {
  None = 'None',
  Ehf = 'Ehf',
  Email = 'Email',
  Kravia = 'Kravia'
}
