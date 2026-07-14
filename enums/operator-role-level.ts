// POS operator access levels (kassa). These are authorization tiers, not job titles: a new level
// is introduced only when it gates behavior that actually differs.
export enum OperatorRoleLevel {
  // Everyday operation: sales, payments, cash drawer, begin/end day, receipts.
  Standard = "Standard",
  // Everything a Standard operator can do, plus approving voids, refunds, unreferenced returns and
  // PIN-gated discounts.
  Godkjenner = "Godkjenner"
}
