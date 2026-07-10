export enum TerminalPaymentState {
  Unknown = 'Unknown',
  NoTransaction = 'NoTransaction',
  Authorized = 'Authorized',
  PartiallyCaptured = 'PartiallyCaptured',
  Captured = 'Captured',
  Declined = 'Declined',
  Failed = 'Failed',
  AuthorizationVoided = 'AuthorizationVoided',
  PartiallyRefunded = 'PartiallyRefunded',
  Refunded = 'Refunded'
}
