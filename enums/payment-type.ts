export enum PaymentType {
  NotSet = "NotSet",
  Giftcard = "Giftcard",
  PayInStore = "PayInStore",
  Stripe = "Stripe",
  Vipps = "Vipps",
  Dintero = "Dintero",
  DinteroVipps = "DinteroVipps",
  DinteroBillie = "DinteroBillie",
  DinteroKlarna = "DinteroKlarna",
  DinteroKravia = "DinteroKravia",
  WoltMarketplace = "WoltMarketplace",
  Cash = "Cash",
  DinteroTerminal = "DinteroTerminal",
  Surfboard = "Surfboard",
  SurfboardVipps = "SurfboardVipps",
  SurfboardTerminal = "SurfboardTerminal",
  // Invoiced through the store's own accounting system: a credit sale, not a cash sale.
  Invoice = "Invoice"
}
