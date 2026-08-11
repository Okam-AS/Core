// Predefined "årsak" for a POS correction (bokføringsforskriften § 5-3-7). Picked with one tap so
// the operator does not type free text. Grouped by the context that offers each value; Annet carries
// an optional free-text note in the accompanying reasonText field.
export enum PosReasonType {
  None = "None",

  // Return / refund.
  AngretKjop = "AngretKjop",
  FeilVare = "FeilVare",
  Reklamasjon = "Reklamasjon",
  Feilslag = "Feilslag",

  // Void / cancelled sale.
  KundeAvbrot = "KundeAvbrot",

  // End-of-day cash difference.
  Tellefeil = "Tellefeil",
  FeilVekselGitt = "FeilVekselGitt",
  Ukjent = "Ukjent",

  // Free-text fallback; the accompanying reasonText carries the operator's note.
  Annet = "Annet"
}
