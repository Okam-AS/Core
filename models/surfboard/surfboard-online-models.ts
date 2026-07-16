import { PaymentType } from '../../enums/payment-type';

// Okam-facing request/response shapes for Surfboard online payment (consumer checkout) and the
// terminal tips configuration. Mirrors the backend SurfboardController request models and its
// anonymous response objects.

// Request body for POST /Surfboard/initiate.
export class SurfboardInitiateOnlineModel {
  storeId: number;
  cartId: string | null;
  redirectUrl: string;
  failureRedirectUrl: string;
  // The online method: PaymentType.Surfboard (the hosted bundle — card/Vipps/etc.) or
  // PaymentType.SurfboardVipps (lock the page to Vipps, mirroring DinteroVipps). Omit for the bundle.
  paymentType?: PaymentType;
  // Native-app app-switch context (as for Dintero): when the app requests an app-switch for a
  // SurfboardVipps order, the response flags isVippsAppSwitch and carries the inter-app token.
  isApp?: boolean;
  useAppSwitch?: boolean;
}

// Response of POST /Surfboard/initiate. paymentUrl is the hosted payment page the customer is sent
// to; paymentTransactionId is our reference used to verify the payment afterwards.
export class SurfboardOnlineInitiateResult {
  orderId: string;
  paymentId: string;
  paymentUrl: string;
  paymentTransactionId: string;
  // True for a Vipps order from the app with app-switch: open paymentUrl (the hosted page locked to
  // Vipps); on mobile Vipps' own web-to-app redirect launches the app, then returns via the
  // app-scheme redirect. False for a plain hosted-page redirect.
  isVippsAppSwitch: boolean;
}

// Response of GET /Surfboard/verify/{reference}. status is 'success' | 'fail' | 'waiting'; orderId
// is the resulting order code (only present on success for cart-backed payments).
export class SurfboardVerifyResult {
  storeId: number;
  orderId: string;
  status: string;
  paymentStatus: string;
}

// Request body for POST /Surfboard/stores/{storeId}/tips-config.
export class SurfboardTipsConfigRequest {
  enabled: boolean;
  tipLevel1: number | null;
  tipLevel2: number | null;
  tipLevel3: number | null;
}
