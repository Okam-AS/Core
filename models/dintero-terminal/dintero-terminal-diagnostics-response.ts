export class DinteroTerminalDiagnosticsResponse {
  tokenOk: boolean;
  tokenError?: string;
  accountId: string;
  checkoutUrl: string;
  tokenBaseUrl: string;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasProfileId: boolean;
  defaultStoreId: string;
  defaultTerminalId: string;
  defaultPayoutDestinationId: string;
  terminalsRaw?: string;
  terminalsError?: string;
  profilesRaw?: string;
  profilesError?: string;
  payoutDestinationsRaw?: string;
  payoutDestinationsError?: string;
}
