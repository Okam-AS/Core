import { ImageSource, ImageCarouselItemMarker } from '../index'

export class ImageCarouselItem {
    id: string;
    orderIndex: number;
    markers: Array<ImageCarouselItemMarker>;
    image: ImageSource;
    categoryId: string;
}
