import { PosReasonType } from '../../enums';

export class CashSaleRequest {
  cashPointId: number;
  orderId: number;
  amount: number;
}

export class CardInitiateRequest {
  cashPointId: number;
  orderId: number;
  currency: string;

  // Partial payment (split bill): the portion (øre) to charge on this tap and the open settlement
  // that owns the bill-level provider order. Both set → the portion flow (one provider order for
  // the whole check, one payment per portion); both omitted → the legacy full-order flow.
  amount?: number | null;
  posSettlementId?: string | null;
}

// Operator-facing status poll for a terminal payment (POST /pos/payment/card/{id}/reconcile).
// The split-payment flow polls this per portion — a completed portion never completes the check.
export class CardReconcileRequest {
  cashPointId: number;
}

export class CardReconcileResult {
  state: string; // TerminalPaymentState name, e.g. 'Captured', 'Authorized', 'Failed'
  rawStatus: string | null;
  capturedAmount: number;
  finalized: boolean;
}

export class CardCaptureRequest {
  cashPointId: number;
  amount: number | null;
}

export class CardVoidRequest {
  cashPointId: number;
}

export class CardRefundRequest {
  cashPointId: number;
  amount: number | null;
  // § 5-3-7 documentation: a predefined reason type + customer phone are required. reasonText is the
  // operator's free-text note, only required when reasonType is Annet. The cardholder's terminal
  // approval is the signature for a card refund, so no on-screen signature is captured here.
  reasonType: PosReasonType;
  reasonText: string;
  customerPhone: string;
  // Only consulted when the acting operator is not already a Godkjenner and the register keeps the
  // refund gate on.
  approverOperatorId: number;
  pin: string;
}

export class CardTimeoutRequest {
  cashPointId: number;
  reason: string;
}

// Refunds a finalized cash sale (RETREC + cash out of the drawer). Authorized per the register's
// internal-control refund gate.
export class CashRefundRequest {
  cashPointId: number;
  // Client-generated idempotency key (one fresh GUID per logical refund). Optional, but when sent
  // a retried request returns the already-journalled RETREC instead of a duplicate.
  returnId: string | null;
  amount: number | null;
  // § 5-3-7 documentation: a predefined reason type + customer phone + an on-screen signature are
  // all required. reasonText is only required when reasonType is Annet.
  reasonType: PosReasonType;
  reasonText: string;
  customerPhone: string;
  customerSignature: string;
  approverOperatorId: number;
  pin: string;
}

// Anonymous response of POST /pos/payment/card/initiate (PascalCase on the wire under the
// Newtonsoft default resolver).
export class CardInitiateResult {
  sessionId: string;
  merchantReference: string;
  paymentTransactionId: string;
  raw: string;
}
