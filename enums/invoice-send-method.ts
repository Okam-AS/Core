// How an issued invoice reached its recipient. Ehf (Peppol) is attempted only for a company with an
// organisation number, and falls back to Email; Kravia issues and delivers in one step.
export enum InvoiceSendMethod {
  None = 'None',
  Ehf = 'Ehf',
  Email = 'Email',
  Kravia = 'Kravia',
  // Norwegian consumer e-invoice, delivered to the recipient's online bank. Okam never asks for it;
  // it appears only as a method a provider reports back having used.
  Efaktura = 'Efaktura',
  Sms = 'Sms',
  // Printed and posted by the provider.
  Letter = 'Letter',
  // The provider chose the channel itself. Its own value rather than the resolved channel, because
  // what the provider reported is a decision, not a channel.
  Auto = 'Auto'
}
