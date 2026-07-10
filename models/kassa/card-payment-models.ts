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
  reason: string;
  approverOperatorId: number;
  pin: string;
}

export class CardTimeoutRequest {
  cashPointId: number;
  reason: string;
}

// Anonymous response of POST /pos/payment/card/initiate (PascalCase on the wire under the
// Newtonsoft default resolver).
export class CardInitiateResult {
  sessionId: string;
  merchantReference: string;
  paymentTransactionId: string;
  raw: string;
}
