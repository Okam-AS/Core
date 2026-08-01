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
  Twint = "Twint",

  // Company Meals credit sale. Round-trips to the backend PaymentType.CompanyAccount (= 120).
  // NOT a payment rail: an order carrying this tender is authorized by a Meals funding
  // reservation, and cart completion is REFUSED unless the reservation's authorization token
  // travels with it (CartService.Complete's reservationToken). Never offer it from
  // GetPaymentMethods — the backend does not return it there; the only thing that may surface
  // it is an eligible Meals context (MealsService.GetContext).
  CompanyAccount = "CompanyAccount"
}
