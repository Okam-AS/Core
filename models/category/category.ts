import { DeliveryType } from "../../enums";
import { ImageSource, ImageCarouselItem, CategoryProductListItem } from "../index";

export class Category {
  id: string;
  orderIndex: number;
  name: string;
  image: ImageSource;

  hide: boolean;
  soldOut: boolean;
  published: boolean;

  imageCarouselEnabled: boolean;
  imageCarouselItems: Array<ImageCarouselItem>;

  categoryProductListEnabled: boolean;
  categoryProductListItems: Array<CategoryProductListItem>;

  storeId: number;

  hideFromDeliveryTypes: Array<DeliveryType>;

  loaded: boolean;
}
