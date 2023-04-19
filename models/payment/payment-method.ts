import { PaymentType } from '../../enums'

export class PaymentMethod {
    id: string;
    last4: string;
    expMonth: string;
    expYear: string;
    brand: string;
    paymentType: PaymentType;
}
