import { DeliveryType, PosReasonType } from '../../enums';

// Unreferenced (open) return: a refund rung in without looking up the original sale. Each line
// classifies the refunded goods with a goods group (for VAT / SAF-T), like an open-price sale line.
// Amounts are ore. § 5-3-7 documentation (reason + phone + signature) is captured on the request.
export class UnreferencedReturnLineModel {
  name: string;
  quantity: number;
  unitAmount: number;
  vatPercent: number;
  goodsGroupId: number | null;
}

// Unreferenced cash return: cash paid back out of the drawer, authorized per the register's return
// gate. A predefined reason type + phone + on-screen signature are all required (§ 5-3-7).
export class UnreferencedCashReturnRequest {
  cashPointId: number;
  // Client-generated idempotency key (one fresh GUID per logical return). Required: with no
  // original sale to reconcile against, this is what lets a retried request (lost response) get
  // the already-journalled RETREC back instead of paying out twice.
  returnId: string;
  approverOperatorId: number;
  pin: string;
  reasonType: PosReasonType;
  reasonText: string;
  customerPhone: string;
  customerSignature: string;
  // Per-document eat-in/take-away context (SelfPickup = take-away, default; TableDelivery = eat-in).
  // When set, a line whose goods group has a VAT profile takes its rate from group x this context
  // (superseding the submitted vatPercent). Null leaves the submitted rates untouched.
  vatContext: DeliveryType | null;
  lines: Array<UnreferencedReturnLineModel>;
}

// Initiate an unreferenced card return: the return order is pushed to the terminal and the cardholder
// taps the card to be credited. Asynchronous — poll the returned paymentTransactionId via
// RefundStatusCard. The terminal approval is the signature, so only reason + phone are captured.
export class UnreferencedCardReturnRequest {
  cashPointId: number;
  approverOperatorId: number;
  pin: string;
  reasonType: PosReasonType;
  reasonText: string;
  customerPhone: string;
  // Per-document eat-in/take-away context (see UnreferencedCashReturnRequest.vatContext).
  vatContext: DeliveryType | null;
  lines: Array<UnreferencedReturnLineModel>;
}
