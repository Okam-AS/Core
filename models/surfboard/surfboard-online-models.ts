// Okam-facing request/response shapes for Surfboard online payment (consumer checkout) and the
// terminal tips configuration. Mirrors the backend SurfboardController request models and its
// anonymous response objects.

// Request body for POST /Surfboard/initiate.
export class SurfboardInitiateOnlineModel {
  storeId: number;
  cartId: string | null;
  redirectUrl: string;
  failureRedirectUrl: string;
}

// Response of POST /Surfboard/initiate. paymentUrl is the hosted payment page the customer is sent
// to; paymentTransactionId is our reference used to verify the payment afterwards.
export class SurfboardOnlineInitiateResult {
  orderId: string;
  paymentId: string;
  paymentUrl: string;
  paymentTransactionId: string;
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
