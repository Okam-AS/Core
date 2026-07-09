import { DeliveryType } from "../../enums";
import { ImageSource, ImageCarouselItem, CategoryProductListItem, CategoryPublishRule, ProductVariant } from "../index";

export class Category {
  id: string;
  orderIndex: number;
  name: string;
  image: ImageSource;

  hide: boolean;
  soldOut: boolean;
  // Kitchen printing for the category (Okam Kassa serving); products may override per item.
  kitchenPrintEnabled: boolean;
  published: boolean;
  startPublish: Date;
  stopPublish: Date;

  imageCarouselEnabled: boolean;
  imageCarouselItems: Array<ImageCarouselItem>;

  categoryProductListEnabled: boolean;
  categoryProductListItems: Array<CategoryProductListItem>;

  storeId: number;

  hideFromDeliveryTypes: Array<DeliveryType>;

  publishRules: Array<CategoryPublishRule>;
  productVariants: Array<ProductVariant>;
  handlePublishRules: boolean;

  loaded: boolean;
}
