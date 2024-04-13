export class StripeCreatePaymentIntent {
  public cartId?: string;
  public giftcardId?: string;

  public amount: number;
  public paymentMethodId: string;
  public setupFutureUsage: boolean;

  public currency: string;
  public clientMajorVersion: number;
}
