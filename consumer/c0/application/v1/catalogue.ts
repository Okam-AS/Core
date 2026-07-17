import {
  consumerLineItemSchema,
  consumerStorefrontSchema,
  type ConsumerAddressWire,
  type ConsumerCategoryListItemWire,
  type ConsumerImageWire,
  type ConsumerProductWire,
  type ConsumerStorefrontWire,
} from '../../contracts/catalogue';
import type {
  ConsumerCategoryEntry,
  ConsumerMediaMetadata,
  ConsumerMenuItem,
  ConsumerProduct,
  StorefrontCatalog,
} from '../../domain/v1/catalogue';

type ImageVariant = 'thumbnail' | 'hero';

function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '0.0.0.0' ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
  );
}

export function normalizeConsumerMediaUrl(
  mediaUrl: string,
  apiBaseUrl: string,
): string {
  const media = new URL(mediaUrl);
  const api = new URL(apiBaseUrl);

  if (isLoopbackHost(media.hostname) && !isLoopbackHost(api.hostname)) {
    media.hostname = api.hostname;
  }
  return media.toString();
}

function imageUrl(
  image: ConsumerImageWire,
  variant: ImageVariant,
  apiBaseUrl: string,
): string | undefined {
  const url =
    variant === 'thumbnail'
      ? image?.thumbnailUrl || image?.imageUrl
      : image?.imageUrl || image?.thumbnailUrl;
  return url ? normalizeConsumerMediaUrl(url, apiBaseUrl) : undefined;
}

function mapMedia(
  image: ConsumerImageWire,
  apiBaseUrl: string,
): ConsumerMediaMetadata | undefined {
  const thumbnailUrl = imageUrl(image, 'thumbnail', apiBaseUrl);
  const heroUrl = imageUrl(image, 'hero', apiBaseUrl);
  const thumbHash = image?.thumbHash ?? image?.thumbhash ?? undefined;

  if (!thumbnailUrl && !heroUrl && !thumbHash) {
    return undefined;
  }
  return {
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(heroUrl ? { heroUrl } : {}),
    ...(thumbHash ? { thumbHash } : {}),
  };
}

function addressLabel(address: ConsumerAddressWire): string | undefined {
  if (!address) {
    return undefined;
  }
  const line = [address.fullAddress, address.zipCode, address.city]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ');
  return line || undefined;
}

export function mapConsumerMenuItem(
  product: ConsumerProductWire,
  apiBaseUrl: string,
): ConsumerMenuItem {
  const media = mapMedia(product.image, apiBaseUrl);
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    description: product.description || '',
    priceMinor: product.amount,
    currency: product.currency,
    soldOut: product.soldOut,
    requiresConfiguration: product.productVariants.length > 0,
    ...(media ? { media } : {}),
  };
}

function mapCategoryEntries(
  listItems: readonly ConsumerCategoryListItemWire[],
  apiBaseUrl: string,
): ConsumerCategoryEntry[] {
  return listItems
    .slice()
    .sort((left, right) => left.orderIndex - right.orderIndex)
    .flatMap((listItem): ConsumerCategoryEntry[] => {
      if (listItem.isHeading) {
        return [
          {
            kind: 'heading',
            id: listItem.id,
            title: listItem.heading!.trim(),
          },
        ];
      }
      if (listItem.product && !listItem.product.hide) {
        return [
          {
            kind: 'product',
            id: listItem.id,
            item: mapConsumerMenuItem(listItem.product, apiBaseUrl),
          },
        ];
      }
      return [];
    });
}

export function mapConsumerStorefront(
  response: ConsumerStorefrontWire,
  apiBaseUrl: string,
): StorefrontCatalog {
  const mappedAddressLabel = addressLabel(response.address);
  const categories = response.categories
    .filter(
      (category) =>
        category.published && category.categoryProductListEnabled,
    )
    .sort((left, right) => left.orderIndex - right.orderIndex)
    .map((category) => {
      const entries = mapCategoryEntries(
        category.categoryProductListItems,
        apiBaseUrl,
      );
      return {
        id: category.id,
        name: category.name,
        entries,
        items: entries.flatMap((entry) =>
          entry.kind === 'product' ? [entry.item] : [],
        ),
      };
    });

  return {
    storeId: response.id,
    storeName: response.name,
    slug: response.slug,
    currencyCode: response.currencyCode,
    isOpenNow: response.isOpenNow,
    pickupEnabled: response.selfPickUp,
    afterHoursOrdersEnabled: response.allowOrdersAfterOpeningHours,
    ...(response.statusMessage
      ? { statusMessage: response.statusMessage }
      : {}),
    ...(mappedAddressLabel ? { addressLabel: mappedAddressLabel } : {}),
    categories,
  };
}

export function parseAndMapConsumerStorefront(
  payload: unknown,
  apiBaseUrl: string,
): StorefrontCatalog {
  return mapConsumerStorefront(
    consumerStorefrontSchema.parse(payload),
    apiBaseUrl,
  );
}

export function mapConsumerProduct(
  product: ConsumerProductWire,
  apiBaseUrl: string,
): ConsumerProduct {
  return {
    item: mapConsumerMenuItem(product, apiBaseUrl),
    variants: product.productVariants
      .slice()
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map((variant) => ({
        id: variant.id,
        name: variant.name,
        required: variant.required,
        multiselect: variant.multiselect,
        options: variant.options
          .slice()
          .sort((left, right) => left.orderIndex - right.orderIndex)
          .map((option) => ({
            id: option.id,
            name: option.name,
            priceDeltaMinor: option.negativeAmount
              ? -option.amount
              : option.amount,
            selected: option.selected,
          })),
      })),
  };
}

export function parseAndMapConsumerProduct(
  payload: unknown,
  apiBaseUrl: string,
): ConsumerProduct {
  return mapConsumerProduct(
    consumerLineItemSchema.parse(payload).product,
    apiBaseUrl,
  );
}
