export class WoltDeliveryInfo {
  woltDeliveryInfoId: string;
  trackingUrl: string;
  woltOrderId: string;
  shipmentPromiseId: string;
  merchantOrderReferenceId: string;
  trackingReference: string;
  woltDriveMerchantKey: string;
  woltDriveMerchantId: string;
  woltDriveVenueId: string;
  status: string;
  pickupEta: Date | null;
  priceAmount: number | null;
  priceCurrency: string;
  orderNumber: string;
}
