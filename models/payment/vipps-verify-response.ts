import { VippsVerifyStatus } from '../../enums'

export class VippsVerifyResponse {
    storeId: number;
    orderId: string;
    status: VippsVerifyStatus;
}