import { DeliveryType } from '../enums'

export interface ICartRootProperties {
   storeId: number;
   homeDeliveryMethodId: string;
   isWaiterOrder: boolean;
   ignoreLegecyIsSelfPickupBool: boolean;
   deliveryType: DeliveryType;
   discountCode: string;
   fullAddress: string;
   zipCode: string;
   city: string;
   paymentIntentId: string;
   comment: string;
   tipPercent: number;
   tableName: string;
}