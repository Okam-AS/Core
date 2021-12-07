import { Product, ProductImage } from '~/core/models'

export class CartLineItem {
  id: number;
  product: Product;
  image: ProductImage;
  quantity: number;
  notes: string;
}