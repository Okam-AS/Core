export class CashSaleRequest {
  cashPointId: number;
  orderId: number;
  amount: number;
}

export class CardInitiateRequest {
  cashPointId: number;
  orderId: number;
  currency: string;
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
  // § 5-3-7 documentation: reason + customer phone are required. The cardholder's terminal approval
  // is the signature for a card refund, so no on-screen signature is captured here.
  reason: string;
  customerPhone: string;
  approverOperatorId: number;
  pin: string;
}

export class CardTimeoutRequest {
  cashPointId: number;
  reason: string;
}

// Refunds a finalized cash sale (RETREC + cash out of the drawer). Requires a Leder-level PIN.
export class CashRefundRequest {
  cashPointId: number;
  // Client-generated idempotency key (one fresh GUID per logical refund). Optional, but when sent
  // a retried request returns the already-journalled RETREC instead of a duplicate.
  returnId: string | null;
  amount: number | null;
  // § 5-3-7 documentation: reason + customer phone + an on-screen signature are all required.
  reason: string;
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
