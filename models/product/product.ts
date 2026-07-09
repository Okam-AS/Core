import { DeliveryType } from "../../enums";
import { ImageSource, ProductVariant } from "../index";
export class Product {
  id: string;
  name: string;
  description: string;

  hide: boolean;
  hideFromDeliveryTypes: Array<DeliveryType>;

  image: ImageSource;
  barcode: string;
  soldOut: boolean;
  depositAmount: number;

  productVariants: Array<ProductVariant>;
  productVariantEnabled: boolean;
  // Kitchen-print override (Okam Kassa serving): null/undefined inherits the flag of the
  // category the product is picked from; true/false forces printing on/off.
  kitchenPrintEnabled?: boolean;
  errorMessage: string;
  selectedOptionsAmount: number;
  selectedOptionNames: string;
  currency: string;
  amount: number;
  baseAmount: number;
  wholeAmount: number;
  fractionAmount: string;
  tax: number;
  otherInformation: string;

  manualRewardAmountEnabled: boolean;
  manualRewardAmount: number;

  hasDiscount: boolean;
  discountLabel: string;
  discountAmount: number;

  storeId: number;
  storeName: string;
  regularDiscountId: string;

  tableAdditionalAmount: number;
  deliveryAdditionalAmount: number;
}
