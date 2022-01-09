import { Product, ProductImage } from '../../models'

export class CartLineItem {
  id: number;
  product: Product;
  image: ProductImage;
  quantity: number;
  notes: string;
}