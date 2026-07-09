import { ReservationStatus } from "../../enums";

// Guest booking request. Date is "yyyy-MM-dd", time is "HH:mm".
export class ConsumerReservationRequest {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  comment: string;
}

// Returned after a successful guest booking; feeds the confirmation card and the .ics
// download. cancelToken is only present when self-service cancellation is enabled.
export class ReservationConfirmation {
  reservationId: number;
  date: string;
  time: string;
  endTime: string;
  partySize: number;
  storeName: string;
  allowGuestCancellation: boolean;
  cancelToken?: string;
}

// Public view of a reservation looked up by its cancel token (the SMS cancellation page).
export class ReservationPublic {
  storeName: string;
  date: string;
  time: string;
  partySize: number;
  status: ReservationStatus;
  canCancel: boolean;
}

// Admin create/update payload (full-model PUT). durationMinutes of 0 means "use the store's
// default seating length". Table choice: tableIds (multi-table seating) wins over tableId
// (single); both empty means auto-assign, which may combine tables in the same zone.
export class AdminReservationPayload {
  tableId?: number;
  tableIds?: Array<number>;
  startTime: string;
  durationMinutes: number;
  partySize: number;
  customerName: string;
  customerPhone: string;
  comment: string;
  status: ReservationStatus;
  isWalkIn: boolean;
  overrideCapacity: boolean;
}
