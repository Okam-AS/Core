import { z } from 'zod';

const consumerRemoteMediaUrlSchema = z.url({ protocol: /^https?$/u });
const consumerThumbHashBase64Pattern =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u;
const minimumThumbHashBytes = 5;
const maximumThumbHashBytes = 100;

function normalizeConsumerThumbHash(value: string): string | undefined {
  if (
    value.trim() !== value ||
    !consumerThumbHashBase64Pattern.test(value)
  ) {
    return undefined;
  }

  let paddingBytes = 0;
  if (value.endsWith('==')) {
    paddingBytes = 2;
  } else if (value.endsWith('=')) {
    paddingBytes = 1;
  }
  const decodedBytes = (value.length / 4) * 3 - paddingBytes;
  return decodedBytes >= minimumThumbHashBytes &&
    decodedBytes <= maximumThumbHashBytes
    ? value
    : undefined;
}

const consumerThumbHashSchema = z
  .string()
  .transform(normalizeConsumerThumbHash);

export const consumerStoreIdResponseSchema = z.object({
  id: z.number().int().positive(),
});

export const consumerImageSchema = z
  .object({
    imageUrl: consumerRemoteMediaUrlSchema.nullable().optional(),
    thumbnailUrl: consumerRemoteMediaUrlSchema.nullable().optional(),
    thumbHash: consumerThumbHashSchema.nullable().optional(),
    // Compatibility with pre-contract experimental payloads.
    thumbhash: consumerThumbHashSchema.nullable().optional(),
  })
  .nullable()
  .optional();

export const consumerProductOptionSchema = z.object({
  id: z.string().min(1),
  orderIndex: z.number().int().optional().default(0),
  name: z.string().min(1),
  negativeAmount: z.boolean().optional().default(false),
  amount: z.number().int().optional().default(0),
  selected: z.boolean().optional().default(false),
});

export const consumerProductVariantSchema = z.object({
  id: z.string().min(1),
  orderIndex: z.number().int().optional().default(0),
  name: z.string().min(1),
  options: z.array(consumerProductOptionSchema),
  multiselect: z.boolean().optional().default(false),
  required: z.boolean().optional().default(false),
});

export const consumerProductSchema = z.object({
  id: z.string().min(1),
  hide: z.boolean().optional().default(false),
  storeId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().nullish().default(''),
  image: consumerImageSchema,
  soldOut: z.boolean().optional().default(false),
  currency: z.string().min(3).max(3),
  baseAmount: z.number().int(),
  amount: z.number().int(),
  productVariants: z.array(consumerProductVariantSchema),
});

export const consumerCategoryListItemSchema = z
  .object({
    id: z.string().min(1),
    orderIndex: z.number().int().optional().default(0),
    isHeading: z.boolean().optional().default(false),
    heading: z.string().nullish(),
    product: consumerProductSchema.nullable(),
  })
  .superRefine((listItem, context) => {
    if (listItem.isHeading && !listItem.heading?.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Category heading rows require heading text',
        path: ['heading'],
      });
    }
    if (listItem.isHeading && listItem.product !== null) {
      context.addIssue({
        code: 'custom',
        message: 'Category heading rows cannot also contain a product',
        path: ['product'],
      });
    }
  });

export const consumerCategorySchema = z.object({
  id: z.string().min(1),
  orderIndex: z.number().int().optional().default(0),
  name: z.string().min(1),
  published: z.boolean().optional().default(true),
  categoryProductListEnabled: z.boolean().optional().default(true),
  categoryProductListItems: z
    .array(consumerCategoryListItemSchema)
    .optional()
    .default([]),
});

export const consumerAddressSchema = z
  .object({
    fullAddress: z.string().nullish(),
    zipCode: z.string().nullish(),
    city: z.string().nullish(),
  })
  .nullable()
  .optional();

export const consumerStorefrontSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().min(1),
  currencyCode: z.string().min(3).max(3),
  isOpenNow: z.boolean(),
  selfPickUp: z.boolean(),
  allowOrdersAfterOpeningHours: z.boolean().optional().default(false),
  statusMessage: z.string().nullish(),
  address: consumerAddressSchema,
  categories: z.array(consumerCategorySchema),
});

export const consumerLineItemSchema = z.object({
  product: consumerProductSchema,
});

export type ConsumerStoreIdResponse = z.output<
  typeof consumerStoreIdResponseSchema
>;
export type ConsumerImageWire = z.output<typeof consumerImageSchema>;
export type ConsumerProductOptionWire = z.output<
  typeof consumerProductOptionSchema
>;
export type ConsumerProductVariantWire = z.output<
  typeof consumerProductVariantSchema
>;
export type ConsumerProductWire = z.output<typeof consumerProductSchema>;
export type ConsumerCategoryListItemWire = z.output<
  typeof consumerCategoryListItemSchema
>;
export type ConsumerCategoryWire = z.output<typeof consumerCategorySchema>;
export type ConsumerAddressWire = z.output<typeof consumerAddressSchema>;
export type ConsumerStorefrontWire = z.output<
  typeof consumerStorefrontSchema
>;
export type ConsumerLineItemWire = z.output<typeof consumerLineItemSchema>;
