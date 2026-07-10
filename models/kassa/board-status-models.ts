import { OrderLineItemStatus, ReservationStatus } from '../../enums';

export class BoardStatusModel {
  storeId: number;
  generatedAt: Date;
  tables: Array<BoardTableModel>;
  parkedChecks: Array<BoardOpenCheckModel>;
  soldOutCategoryIds: Array<string>;
  soldOutProductIds: Array<string>;
}

export class BoardTableModel {
  tableId: number;
  tableNumber: number;
  name: string;
  zoneId: number;
  isActive: boolean;
  openCheck: BoardOpenCheckModel | null;
  nextReservation: BoardReservationModel | null;
}

export class BoardReservationModel {
  reservationId: number;
  startTime: Date;
  endTime: Date;
  partySize: number;
  customerName: string;
  status: ReservationStatus;
  isWalkIn: boolean;
}

export class BoardOpenCheckModel {
  orderId: number;
  tableId: number | null;
  tableName: string;
  couverts: number | null;
  itemsAmount: number;
  finalAmount: number;
  created: Date | null;
  lineCount: number;
  overallStatus: OrderLineItemStatus | null;
  lines: Array<BoardLineStatusModel>;
}

export class BoardLineStatusModel {
  orderLineItemId: string;
  name: string;
  quantity: number;
  courseSequence: number | null;
  status: OrderLineItemStatus | null;
  allergens: Array<string>;
}
