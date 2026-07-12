import { OrderLineItemStatus, OrderStatus, DeliveryType, KitchenTicketSource } from '../../enums';

// The unified kitchen display feed (KDS): one ticket list merging in-house POS table checks
// (per-line coursing) and online consumer orders (order-level). Mirrors the backend
// KitchenBoardModel. The KDS polls the board endpoint.
export class KitchenBoardModel {
  storeId: number;
  generatedAt: Date;
  // Tickets ordered oldest-first, so the kitchen works the longest-waiting order first.
  tickets: Array<KitchenTicketModel>;
}

export class KitchenTicketModel {
  source: KitchenTicketSource;
  orderId: number;
  friendlyId: string;
  tableName: string;
  couverts: number | null;
  comment: string | null;
  // Elapsed-time source for the ticket timer. There is no per-line sent-at timestamp yet, so sentAt
  // is null and the client times off createdAt (follow-up for the UI pass).
  createdAt: Date | null;
  sentAt: Date | null;
  deliveryType: DeliveryType;
  // Order-level status: online orders use this (Accepted / Processing); a POS check is always OpenCheck.
  status: OrderStatus;
  // Least-advanced service state across the ticket's lines (for an expo "ready to run" view), or null.
  overallStatus: OrderLineItemStatus | null;
  lines: Array<KitchenTicketLineModel>;
}

export class KitchenTicketLineModel {
  orderLineItemId: string;
  name: string;
  quantity: number;
  courseSequence: number | null;
  status: OrderLineItemStatus | null;
  notes: string | null;
  allergens: Array<string>;
  options: Array<KitchenTicketLineOptionModel>;
}

export class KitchenTicketLineOptionModel {
  parentName: string;
  name: string;
}

// Bumps a single kitchen line to a target status (default Ready when status is omitted).
export class KitchenBumpRequest {
  status?: OrderLineItemStatus | null;
}
