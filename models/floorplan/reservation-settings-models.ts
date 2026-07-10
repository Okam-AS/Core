export class ReservationSettingsModel {
  enabled: boolean;
  allowGuestCancellation: boolean;
  useStoreHours: boolean;
  slotMinutes: number;
  seatingMinutes: number;
  bufferMinutes: number;
  leadMinutes: number;
  maxDaysAhead: number;
  maxGuests: number;
  noShowGraceMinutes: number;
  days: Array<ReservationDayHoursModel>;
  dateOverrides: Array<ReservationDateOverrideModel>;
}

export class ReservationDateOverrideModel {
  date: string;
  closed: boolean;
  from: string;
  to: string;
}

export class ReservationDayHoursModel {
  dayOfWeek: number;
  open: boolean;
  from: string;
  to: string;
}
