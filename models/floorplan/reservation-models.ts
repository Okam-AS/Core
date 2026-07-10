import { ReservationStatus } from "../../enums";

export class ReservationModel {
  reservationId: number;
  tableId: number | null;
  tableName: string | null;
  tables: Array<ReservationTableRefModel>;
  partySize: number;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
  customerName: string;
  customerPhone: string;
  comment: string | null;
  isWalkIn: boolean;
  createdByAdmin: boolean;
  createdAt: Date;
}

export class ReservationTableRefModel {
  tableId: number | null;
  tableName: string;
}

export class AdminReservationModel {
  tableId: number | null;
  tableIds: Array<number>;
  startTime: Date;
  durationMinutes: number;
  partySize: number;
  customerName: string;
  customerPhone: string;
  comment: string | null;
  status: ReservationStatus;
  isWalkIn: boolean;
  overrideCapacity: boolean;
}

export class ConsumerReservationRequestModel {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  comment: string | null;
}

export class ReservationConfirmationModel {
  reservationId: number;
  date: string;
  time: string;
  endTime: string;
  partySize: number;
  storeName: string;
  allowGuestCancellation: boolean;
  cancelToken: string | null;
}

export class ReservationPublicModel {
  storeName: string;
  date: string;
  time: string;
  partySize: number;
  status: ReservationStatus;
  canCancel: boolean;
}

export class ReservationAvailabilityModel {
  enabled: boolean;
  maxGuests: number;
  seatingMinutes: number;
  days: Array<ReservationAvailabilityDayModel>;
  date: string;
  slots: Array<string>;
}

export class ReservationAvailabilityDayModel {
  date: string;
  open: boolean;
}

export class ReservationSuggestionRequestModel {
  startTime: Date;
  durationMinutes: number;
  partySize: number;
  excludeReservationId: number | null;
}

export class ReservationSuggestionModel {
  tableId: number | null;
  tableIds: Array<number>;
}
