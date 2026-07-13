import { DeliveryType, OrderStatus, OrderLineItemStatus } from '../../enums';
import { PosReceiptModel } from '../../models';

export class OpenCheckRequest {
  cashPointId: number;
  tableId: number | null;
  couverts: number | null;
  deliveryType: DeliveryType;
}

export class AddCheckLineRequest {
  quantity: number;
  notes: string;
  courseSequence: number | null;
  // Seat (guest) the line belongs to (1-99); descriptive, used to prefill a by-item split. Null
  // when the line is not seat-tagged.
  seatNumber: number | null;
  productId: string | null;
  selectedOptionIds: Array<string>;
  isOpenPrice: boolean;
  name: string;
  amount: number;
  tax: number;
  goodsGroupId: number | null;
}

export class FireCourseRequest {
  status: OrderLineItemStatus | null;
  capture: boolean;
  paymentTransactionId: string | null;
}

export class MoveCheckRequest {
  tableId: number;
}

export class MergeCheckRequest {
  sourceOrderId: number;
}

export class SetCouvertsRequest {
  couverts: number;
}

// Switches the check between the POS VAT contexts (eat-in 'TableDelivery' / take-away
// 'SelfPickup'); the server re-prices every line for the new context.
export class SetDeliveryTypeRequest {
  deliveryType: string;
}

export class ResumeCheckRequest {
  tableId: number | null;
}

export class CheckModel {
  orderId: number;
  storeId: number;
  cashPointId: number | null;
  operatorId: number | null;
  tableId: number | null;
  tableName: string;
  couverts: number | null;
  status: OrderStatus;
  deliveryType: DeliveryType;
  // Set once the sale is finalised (e.g. a card payment auto-finalised by the terminal webhook);
  // the POS polls this after a card tap and then fetches the receipt by journal entry id.
  journalEntryId: number | null;
  itemsAmount: number;
  finalAmount: number;
  created: Date | null;
  items: Array<CheckLineModel>;
}

export class CheckLineModel {
  orderLineItemId: string;
  productId: string;
  name: string;
  notes: string;
  quantity: number;
  unitAmount: number;
  lineAmount: number;
  discountAmount: number;
  discountReason: string;
  netLineAmount: number;
  tax: number;
  depositAmount: number;
  courseSequence: number | null;
  // Seat (guest) the line belongs to; descriptive metadata the POS uses to prefill a by-item
  // split. Null = unassigned.
  seatNumber: number | null;
  status: OrderLineItemStatus | null;
  isOpenPrice: boolean;
  // The goods group (SAF-T artGroupID) the line is classified under (own group for open-price lines,
  // the product's otherwise), so a bill row can become an unreferenced-return line without re-asking.
  goodsGroupId: number | null;
  // Whether this line prints to the kitchen (product ?? category flag, resolved server-side; open-price
  // lines default true). The POS "Send til kjøkken (N)" count includes only kitchen-relevant "Ny" lines.
  kitchenPrintEnabled: boolean;
  options: Array<CheckLineOptionModel>;
}

export class CheckLineOptionModel {
  parentName: string;
  name: string;
}

export class FireCourseResult {
  check: CheckModel;
  captured: boolean;
  capturedAmount: number | null;
  remainingAmount: number | null;
  finalized: boolean;
  receipt: PosReceiptModel | null;
}
