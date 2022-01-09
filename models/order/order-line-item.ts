import { ProductImage, OrderLineItemOption } from '../../models'

export class OrderLineItem {
  id: string;
  productId: string;
  image: ProductImage;
  quantity: number;
  notes: string;
  barcode: string;
  name: string;
  description: string;
  currency: string;
  negativeAmount: boolean;
  amount: number;
  amountPreDiscount: number;
  tax: number;
  options: Array<OrderLineItemOption>;
}
