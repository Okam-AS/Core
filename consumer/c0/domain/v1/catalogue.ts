export type ConsumerMediaMetadata = Readonly<{
  thumbnailUrl?: string;
  heroUrl?: string;
  thumbHash?: string;
}>;

export type ConsumerMenuItem = Readonly<{
  id: string;
  storeId: number;
  name: string;
  description: string;
  priceMinor: number;
  currency: string;
  soldOut?: boolean;
  /**
   * `undefined` means the catalogue response cannot prove whether configuration
   * is required. C0's validated catalogue mapper always emits this value.
   */
  requiresConfiguration?: boolean;
  media?: ConsumerMediaMetadata;
}>;

export type ConsumerVariantOption = Readonly<{
  id: string;
  name: string;
  priceDeltaMinor: number;
  selected: boolean;
}>;

export type ConsumerVariant = Readonly<{
  id: string;
  name: string;
  required: boolean;
  multiselect: boolean;
  options: readonly ConsumerVariantOption[];
}>;

export type ConsumerProduct = Readonly<{
  item: ConsumerMenuItem;
  variants: readonly ConsumerVariant[];
}>;

export type ConsumerCategoryEntry =
  | Readonly<{
      kind: 'heading';
      id: string;
      title: string;
    }>
  | Readonly<{
      kind: 'product';
      id: string;
      item: ConsumerMenuItem;
    }>;

export type ConsumerCategory = Readonly<{
  id: string;
  name: string;
  entries: readonly ConsumerCategoryEntry[];
  items: readonly ConsumerMenuItem[];
}>;

export type StorefrontCatalog = Readonly<{
  storeId: number;
  storeName: string;
  slug: string;
  currencyCode: string;
  isOpenNow: boolean;
  pickupEnabled: boolean;
  afterHoursOrdersEnabled: boolean;
  statusMessage?: string;
  addressLabel?: string;
  categories: readonly ConsumerCategory[];
}>;

export type ConsumerProductScope = Readonly<{
  storeId: number;
  currencyCode: string;
}>;
