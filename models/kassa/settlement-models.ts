import { PaymentType } from '../../enums';
import { OrderPaymentStatus } from '../../enums';
import { PosSettlementStatus } from '../../enums';

// Opens a settlement (the payment resolution of one order) on a cash point.
export class SettlementOpenRequest {
  cashPointId: number;
  orderId: number;
}

// Adds one payment part to an open settlement. A card part carries the terminal
// paymentTransactionId to capture and the amount to apply; a cash part settles the
// remaining balance and carries the tendered amount so the change can be computed. Amounts are ore.
export class SettlementAllocationRequest {
  cashPointId: number;
  paymentType: PaymentType;
  amount: number;
  tenderedAmount: number | null;
  paymentTransactionId: string | null;
}

// Identifies the cash point for a settlement finalize / abort (store isolation).
export class SettlementActionRequest {
  cashPointId: number;
}

// Result of adding one payment part.
export class SettlementAllocationResult {
  orderPaymentId: string;
  paymentType: PaymentType;
  amount: number;
  status: OrderPaymentStatus;
  confirmedTotal: number;
  outstandingAmount: number;
  changeAmount: number;
  fullyCovered: boolean;
}

// A settlement and its payment parts.
export class SettlementModel {
  posSettlementId: string;
  orderId: number;
  storeId: number;
  cashPointId: number;
  status: PosSettlementStatus;
  created: Date;
  orderFinalAmount: number;
  confirmedTotal: number;
  outstandingAmount: number;
  payments: Array<SettlementAllocationModel>;
}

// One payment part of a settlement.
export class SettlementAllocationModel {
  orderPaymentId: string;
  paymentType: PaymentType;
  amount: number;
  status: OrderPaymentStatus;
  paymentTransactionId: string | null;
  cashDrawerTransactionId: number | null;
  journalEntryId: number | null;
}
