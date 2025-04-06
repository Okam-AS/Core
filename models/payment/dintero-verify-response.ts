import { DinteroVerifyStatus } from '../../enums'

export class DinteroVerifyResponse {
    storeId: number;
    orderId: string;
    giftcardId?: string;
    status: DinteroVerifyStatus;
}
