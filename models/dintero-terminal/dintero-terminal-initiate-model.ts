export class DinteroTerminalInitiateModel {
  // Amount in the smallest currency unit (e.g. 39900 = 399.00 NOK).
  amount: number;
  currency?: string;
  merchantReference?: string;
  description?: string;
  vatPercent?: number;
  // Optional overrides; fall back to the backend test defaults when omitted.
  storeId?: string;
  terminalId?: string;
  payoutDestinationId?: string;
  profileId?: string;
}
