import { PosReceiptModel } from '../../models';
import { TerminalPaymentState } from '../../enums';

// Result of reconciling a terminal transaction against the provider's authoritative status.
export class TerminalReconcileResult {
  state: TerminalPaymentState;
  rawStatus: string;
  finalized: boolean;
  journalEntryId: number | null;
  capturedAmount: number;
  refundedAmount: number;
  receipt: PosReceiptModel | null;
}

// Result of an operator-initiated capture (possibly partial).
export class TerminalCaptureResult {
  finalized: boolean;
  capturedAmount: number;
  remainingAmount: number;
  transactionStatus: string;
  receipt: PosReceiptModel | null;
}

// Result of an operator-initiated void of an uncaptured authorization.
export class TerminalVoidResult {
  success: boolean;
  transactionStatus: string;
  raw: string;
}

// Result of an operator-initiated refund.
export class TerminalRefundResult {
  confirmed: boolean;
  pending: boolean;
  refundedAmount: number;
  transactionStatus: string;
  returnReceipt: PosReceiptModel | null;
  // The return transaction to poll for a still-pending refund. Populated for an unreferenced (open)
  // card return, where the server created a fresh transaction the client does not yet know; null for
  // a referenced refund, where the client already holds the sale transaction id.
  paymentTransactionId: string | null;
}

// Normalized outcome of a terminal provider operation (get / capture / void / refund).
export class TerminalProviderResult {
  success: boolean;
  isPending: boolean;
  statusCode: number;
  state: TerminalPaymentState;
  rawStatus: string;
  raw: string;
  providerTransactionReference: string;
  capturedAmount: number | null;
  merchantReference: string;
}

// Result of initiating an order-anchored terminal payment.
export class TerminalInitiateResult {
  paymentTransactionId: string;
  sessionReference: string;
  merchantReference: string;
  raw: string;
}
