import { DeliveryType } from '../../enums';

// HTTP body for producing a copy (reprint) of an existing receipt. The journal entry being copied
// is taken from the route; the cash point resolves and validates the operator session.
export class CopyReceiptRequest {
  cashPointId: number;
}

// HTTP body for a provisional / handover receipt (PROREC). Built from a working order before it is
// paid; it is explicitly NOT a proof of purchase.
export class ProvisionalReceiptRequest {
  cashPointId: number;
  orderId: number;
  // Per-order VAT context: eat-in (TableDelivery) vs take-away. Unset uses the order's DeliveryType.
  vatContext: DeliveryType;
}

// HTTP body for a training-mode sale receipt (TRAINREC). Journalled for the audit trail and the
// training totals but never affects the grand totals or real payment figures.
export class TrainingReceiptRequest {
  cashPointId: number;
  orderId: number;
  vatContext: DeliveryType;
}

// HTTP body for sending a receipt link by SMS.
export class ReceiptSmsRequest {
  phoneNumber: string;
}

// Result of an SMS receipt send.
export class ReceiptSmsResult {
  sent: boolean;
  // The public receipt link that was sent (returned so the client can display / retry it).
  link: string;
}

// One field on screen: the operator types whatever the customer offers and the server routes it.
export class SendReceiptRequest {
  recipient: string;
}

export class SendReceiptResult {
  sent: boolean;
  // 'Sms' | 'Email' — the channel actually used, so the confirmation is never a guess.
  channel: string;
  recipient: string;
  link: string;
}
