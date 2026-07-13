// A dated override of the weekly opening hours. open = false means closed that day; open = true uses
// openingTime/closingTime. This is the consumer-facing shape embedded in Store: it deliberately has
// no note (the note is internal, staff-only text).
export class SpecialOpeningHour {
    specialOpeningHourId: string;
    date: string;
    open: boolean;
    openingTime: string;
    closingTime: string;
}

// Admin-facing view of a special opening day: the consumer fields plus the internal note (e.g.
// "Julaften"). Used for the admin CRUD endpoints; never present in consumer payloads.
export class SpecialOpeningHourAdmin extends SpecialOpeningHour {
    note: string;
}
