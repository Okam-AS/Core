// Availability for the guest booking widget: a cheap day list plus the concrete slot list
// for one date. Mirrors ReservationAvailabilityModel on the API.
export class ReservationAvailability {
  enabled: boolean;
  maxGuests: number;
  seatingMinutes: number;
  days: Array<ReservationAvailabilityDay>;
  date: string;
  slots: Array<string>;
}

export class ReservationAvailabilityDay {
  date: string;
  open: boolean;
}
