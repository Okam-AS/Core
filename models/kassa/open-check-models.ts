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
  status: OrderLineItemStatus | null;
  isOpenPrice: boolean;
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
