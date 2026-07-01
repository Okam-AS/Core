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
  // Swiss TWINT rail. String value round-trips to the backend PaymentType.Twint (= 210);
  // the numeric mapping lives server-side. Additive — never surfaced for NO stores.
  Twint = "Twint"
}
