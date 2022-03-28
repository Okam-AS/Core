import { PaymentType } from '../../enums'

export class PaymentMethod {
    id: string;
    last4: string;
    expMonth: string;
    expYear: string;
    paymentType: PaymentType;
}
