// The VAT treatment of a sales line in Okam's own terms, so that generic accounting code never
// carries a provider's VAT identifier. Each provider owns its own map from these members, and no
// map is ever reused: Tripletex's id for outgoing 12 % is 32, while Fiken's code 32 is RAW_FISH.
export enum VatCategory {
  None = 'None',
  Zero = 'Zero',
  Exempt = 'Exempt',
  OutsideVatAct = 'OutsideVatAct',
  Export = 'Export',
  Low12 = 'Low12',
  Reduced15 = 'Reduced15',
  Standard25 = 'Standard25'
}
