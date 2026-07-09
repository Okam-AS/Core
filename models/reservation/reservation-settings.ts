// Per-store reservation settings (rules + booking's own opening hours). Read via GET and
// replaced wholesale via PUT. Mirrors ReservationSettingsModel on the API.
export class ReservationSettings {
  enabled: boolean;
  allowGuestCancellation: boolean;
  useStoreHours: boolean;
  slotMinutes: number;
  seatingMinutes: number;
  bufferMinutes: number;
  leadMinutes: number;
  maxDaysAhead: number;
  maxGuests: number;
  // Minutes after start before a never-seated booking stops blocking its tables in the
  // availability engine (0 = block until endTime).
  noShowGraceMinutes: number;
  days: Array<ReservationDayHours>;
  // Per-date exceptions: closed dates and dates with special booking hours.
  dateOverrides: Array<ReservationDateOverride>;
}

export class ReservationDayHours {
  // 0-6.
  dayOfWeek: number;
  open: boolean;
  // "HH:mm".
  from: string;
  to: string;
}

export class ReservationDateOverride {
  // "yyyy-MM-dd".
  date: string;
  // When true the date is closed for booking and from/to are ignored.
  closed: boolean;
  // "HH:mm"; special hours for the date when closed is false.
  from?: string;
  to?: string;
}
