import { ReservationStatus } from "../../enums";

// A reservation as seen on the admin timeline. Times are ISO strings in server-local
// Norwegian time; status mirrors the API's PascalCase enum. tableId/tableName describe the
// primary table (combined display name for a multi-table seating); tables lists every
// assigned table so the timeline can draw a block on each row.
export class Reservation {
  reservationId: number;
  tableId?: number;
  tableName: string;
  tables: Array<ReservationTableRef>;
  partySize: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  customerName: string;
  customerPhone: string;
  comment: string;
  isWalkIn: boolean;
  createdByAdmin: boolean;
  createdAt: string;
}

// One table assigned to a reservation. tableId is null when the table was later removed;
// tableName is the display snapshot from booking time.
export class ReservationTableRef {
  tableId?: number;
  tableName: string;
}
