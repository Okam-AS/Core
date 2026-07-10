import { DinteroTerminalStatus } from "../../enums";

export class DinteroTerminalInitiateModel {
  orderId: number | null;
  cashPointId: number | null;
  operatorId: number | null;
  amount: number;
  currency: string;
  merchantReference: string;
  description: string;
  vatPercent: number;
  storeId: string;
  terminalId: string;
  payoutDestinationId: string;
  profileId: string;
}

export class DinteroTerminalInitResponse {
  sessionId: string;
  merchantReference: string;
  paymentTransactionId: string | null;
  raw: string;
}

export class DinteroTerminalStatusResponse {
  sessionId: string;
  transactionId: string;
  status: DinteroTerminalStatus;
  transactionStatus: string;
  rawSession: string;
  rawTransaction: string;
}

export class DinteroTerminalRawResponse {
  success: boolean;
  statusCode: number;
  raw: string;
}

export class DinteroTerminalTransactionResult {
  success: boolean;
  statusCode: number;
  transactionStatus: string;
  transactionId: string;
  merchantReference: string;
  isPending: boolean;
  raw: string;
}

export class DinteroTerminalDiagnosticsResponse {
  tokenOk: boolean;
  tokenError: string;
  accountId: string;
  checkoutUrl: string;
  tokenBaseUrl: string;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasProfileId: boolean;
  defaultStoreId: string;
  defaultTerminalId: string;
  defaultPayoutDestinationId: string;
  terminalsRaw: string;
  terminalsError: string;
  profilesRaw: string;
  profilesError: string;
  payoutDestinationsRaw: string;
  payoutDestinationsError: string;
}

export class DinteroTerminalRefundModel {
  amount: number;
  reason: string;
  terminalId: string;
}

export class DinteroTerminalOperationModel {
  operation: string;
  terminalId: string;
}
