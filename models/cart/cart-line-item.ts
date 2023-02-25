import { Product, ProductImage } from '../../models'

export class CartLineItem {
  id: string;
  product: Product;
  image: ProductImage;
  quantity: number;
  notes: string;
}