export class StripeCreatePaymentIntent {
  public cartId?: string;
  public giftcardId?: string;

  public amount: number;
  public paymentMethodId?: string; // absent for wallet flows (e.g. TWINT) that have no saved PM
  public setupFutureUsage?: boolean; // omitted for one-shot payments

  // Region-aware charge currency (ISO-4217). Set from the store/cart context in
  // pinia/checkout.ts; optional here so callers may omit it (service defaults to "NOK").
  public currency?: string;
  public clientMajorVersion?: number; // set by StripeService.CreatePaymentIntent

  // Discriminates the payment rail for the backend. Undefined ⇒ card (legacy default).
  public paymentMethodType?: "card" | "twint";
  // True for native app-initiated flows (server-confirm); false/undefined for web.
  public isApp?: boolean;
}
