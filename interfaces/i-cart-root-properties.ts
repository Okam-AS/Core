import { DeliveryType } from '../enums'

export interface ICartRootProperties {
   storeId: number;
   homeDeliveryMethodId: string;
   ignoreLegecyIsSelfPickupBool: boolean;
   ignoreLegecyIsWaiterOrderBool: boolean;
   deliveryType: DeliveryType;
   discountCode: string;
   fullAddress: string;
   zipCode: string;
   city: string;
   paymentIntentId: string;
   comment: string;
   requestedCompletion: Date;
   tipPercent: number;
   tableName: string;
}