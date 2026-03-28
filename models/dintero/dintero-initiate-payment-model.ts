import { PaymentType } from "../../enums";

export class DinteroInitiatePaymentModel {
  isApp: boolean;
  useAppSwitch: boolean;
  storeId: number;
  paymentType: PaymentType;
  amount: number;
  merchantReference?: string;
  cartId?: string;
  giftcardId?: string;
}
