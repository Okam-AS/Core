import { z } from 'zod';

export const consumerMarketV1Schema = z.enum(['CH', 'NO']);
export const consumerCurrencyV1Schema = z.enum(['CHF', 'NOK']);
export const opaqueStoreIdV1Schema = z.string().min(1);
export const nonNegativeMinorV1Schema = z.number().int().safe().nonnegative();
export const positiveMinorV1Schema = z.number().int().safe().positive();
export const cartQuantityV1Schema = z.number().int().min(1).max(99);
export const cartQuantityUpdateV1Schema = z.number().int().min(0).max(99);

export const consumerStoreScopeV1Schema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('explicit'),
    allowedStoreIds: z.array(opaqueStoreIdV1Schema).min(1),
  }).strict(),
  z.object({
    kind: z.literal('organization-derived'),
    organizationId: z.string().min(1),
    resolvedStoreIds: z.array(opaqueStoreIdV1Schema).min(1),
  }).strict(),
]);

export const consumerManifestV1Schema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  version: z.union([z.string().min(1), z.number().finite()]),
  publicationState: z.enum(['draft', 'published', 'retired']),
  displayName: z.string().min(1),
  showOkamTrace: z.boolean(),
  storeScope: consumerStoreScopeV1Schema,
}).strict();

/**
 * These are the five first-party delivery values the existing ConsumerApp
 * exposes. NotSet and WoltMarketplaceDelivery are backend values, but not
 * customer-selectable fulfilment methods in the Okam consumer.
 */
export const fulfilmentKindV1Schema = z.enum([
  'SelfPickup',
  'TableDelivery',
  'InstantHomeDelivery',
  'DineHomeDelivery',
  'WoltDelivery',
]);

/** No client-created timestamp is accepted until a server slot contract exists. */
export const fulfilmentTimingV1Schema = z.object({
  kind: z.literal('asap'),
}).strict();

export const fulfilmentAddressV1Schema = z.object({
  city: z.string().trim().min(1).max(50),
  deliveryInstructions: z.string().trim().max(499),
  fullAddress: z.string().trim().min(1).max(200),
  zipCode: z.string().trim().length(4),
}).strict();

function isHomeDeliveryV1(kind: z.infer<typeof fulfilmentKindV1Schema>): boolean {
  return (
    kind === 'InstantHomeDelivery' ||
    kind === 'DineHomeDelivery' ||
    kind === 'WoltDelivery'
  );
}

export const fulfilmentSelectionV1Schema = z.object({
  kind: fulfilmentKindV1Schema,
  timing: fulfilmentTimingV1Schema,
  address: fulfilmentAddressV1Schema.optional(),
  tableName: z.string().trim().min(1).max(50).optional(),
}).strict().superRefine((value, context) => {
  if (isHomeDeliveryV1(value.kind) !== (value.address !== undefined)) {
    context.addIssue({
      code: 'custom',
      path: ['address'],
      message: isHomeDeliveryV1(value.kind)
        ? 'Home delivery requires an address.'
        : 'This fulfilment method cannot carry a delivery address.',
    });
  }
  if ((value.kind === 'TableDelivery') !== (value.tableName !== undefined)) {
    context.addIssue({
      code: 'custom',
      path: ['tableName'],
      message: value.kind === 'TableDelivery'
        ? 'Table delivery requires a table name.'
        : 'This fulfilment method cannot carry a table name.',
    });
  }
});

export const cartSelectedOptionV1Schema = z.object({
  optionId: z.string().min(1),
  optionName: z.string(),
  priceDeltaMinor: z.number().int().safe().optional(),
}).strict();

export const cartVariantSelectionV1Schema = z.object({
  variantId: z.string().min(1),
  variantName: z.string(),
  options: z.array(cartSelectedOptionV1Schema).min(1),
}).strict();

export const cartProductIdentityV1Schema = z.object({
  id: z.string().min(1),
  storeId: opaqueStoreIdV1Schema,
  name: z.string().min(1),
  description: z.string(),
  basePriceMinor: nonNegativeMinorV1Schema.optional(),
  unitPriceMinor: nonNegativeMinorV1Schema,
  currency: consumerCurrencyV1Schema,
  soldOut: z.boolean().optional(),
  requiresConfiguration: z.boolean().optional(),
}).strict();

export const cartLineInputV1Schema = z.object({
  product: cartProductIdentityV1Schema,
  quantity: cartQuantityV1Schema,
  modifier: z.string().optional(),
  note: z.string().max(300).optional(),
  selections: z.array(cartVariantSelectionV1Schema),
  serverLineItemId: z.string().min(1).optional(),
}).strict().superRefine((line, context) => {
  const variantIds = new Set<string>();
  const optionIds = new Set<string>();
  let optionTotalMinor = 0;
  let hasCompletePriceEvidence = line.product.basePriceMinor !== undefined;

  for (const [variantIndex, variant] of line.selections.entries()) {
    if (variantIds.has(variant.variantId)) {
      context.addIssue({
        code: 'custom',
        path: ['selections', variantIndex, 'variantId'],
        message: 'A variant can appear only once on a cart line.',
      });
    }
    variantIds.add(variant.variantId);
    for (const [optionIndex, option] of variant.options.entries()) {
      if (optionIds.has(option.optionId)) {
        context.addIssue({
          code: 'custom',
          path: ['selections', variantIndex, 'options', optionIndex, 'optionId'],
          message: 'A selected option can appear only once on a cart line.',
        });
      }
      optionIds.add(option.optionId);
      if (option.priceDeltaMinor === undefined) {
        hasCompletePriceEvidence = false;
        continue;
      }
      optionTotalMinor += option.priceDeltaMinor;
      if (!Number.isSafeInteger(optionTotalMinor)) {
        context.addIssue({
          code: 'custom',
          path: ['selections'],
          message: 'Selected option total exceeds safe integer range.',
        });
        return;
      }
    }
  }

  const configuredUnitPrice =
    (line.product.basePriceMinor ?? 0) + optionTotalMinor;
  if (hasCompletePriceEvidence && (
    !Number.isSafeInteger(configuredUnitPrice) ||
    configuredUnitPrice < 0 ||
    configuredUnitPrice !== line.product.unitPriceMinor
  )) {
    context.addIssue({
      code: 'custom',
      path: ['product', 'unitPriceMinor'],
      message: 'Configured unit price must equal base price plus selected options.',
    });
  }
});

export const cartSnapshotV1Schema = z.object({
  version: z.literal(1),
  manifestId: z.string().min(1),
  manifestVersion: z.union([z.string().min(1), z.number().finite()]),
  brandKey: z.string().min(1),
  storeId: opaqueStoreIdV1Schema,
  market: consumerMarketV1Schema,
  currency: consumerCurrencyV1Schema,
  revision: z.number().int().safe().nonnegative(),
  lines: z.array(cartLineInputV1Schema),
  fulfilment: fulfilmentSelectionV1Schema.optional(),
}).strict().superRefine((cart, context) => {
  let totalMinor = 0;
  const serverLineIds = new Set<string>();
  const localLineIdentities = new Set<string>();
  for (const [index, line] of cart.lines.entries()) {
    if (line.product.storeId !== cart.storeId) {
      context.addIssue({
        code: 'custom',
        path: ['lines', index, 'product', 'storeId'],
        message: 'Every product must belong to the authorized cart store.',
      });
    }
    if (line.product.currency !== cart.currency) {
      context.addIssue({
        code: 'custom',
        path: ['lines', index, 'product', 'currency'],
        message: 'Every product must use the authorized cart currency.',
      });
    }
    if (
      line.serverLineItemId !== undefined &&
      serverLineIds.has(line.serverLineItemId)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['lines', index, 'serverLineItemId'],
        message: 'Persisted server line IDs must be unique.',
      });
    }
    if (line.serverLineItemId !== undefined) {
      serverLineIds.add(line.serverLineItemId);
    }
    const localIdentity = JSON.stringify({
      itemId: line.product.id,
      unitPriceMinor: line.product.unitPriceMinor,
      modifier: line.modifier ?? '',
      note: line.note ?? '',
      selections: JSON.stringify(
        line.selections.map((selection) => ({
          variantId: selection.variantId,
          optionIds: selection.options.map((option) => option.optionId),
        })),
      ),
    });
    if (localLineIdentities.has(localIdentity)) {
      context.addIssue({
        code: 'custom',
        path: ['lines', index],
        message: 'Equivalent local cart lines must be merged.',
      });
    }
    localLineIdentities.add(localIdentity);
    const lineTotal = line.product.unitPriceMinor * line.quantity;
    totalMinor += lineTotal;
    if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(totalMinor)) {
      context.addIssue({
        code: 'custom',
        path: ['lines', index],
        message: 'Cart total exceeds safe integer range.',
      });
      return;
    }
  }
});

export const cartEventV1Schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('line-added'),
    line: cartLineInputV1Schema,
  }).strict(),
  z.object({
    type: z.literal('line-quantity-set'),
    identity: z.string().min(1),
    quantity: cartQuantityUpdateV1Schema,
  }).strict(),
  z.object({
    type: z.literal('line-removed'),
    identity: z.string().min(1),
  }).strict(),
  z.object({
    type: z.literal('line-reconfigured'),
    identity: z.string().min(1),
    line: cartLineInputV1Schema,
  }).strict(),
  z.object({
    type: z.literal('fulfilment-selected'),
    selection: fulfilmentSelectionV1Schema,
  }).strict(),
  z.object({ type: z.literal('cart-cleared') }).strict(),
]);

export type ConsumerMarketWireV1 = z.output<typeof consumerMarketV1Schema>;
export type ConsumerCurrencyWireV1 = z.output<typeof consumerCurrencyV1Schema>;
export type ConsumerStoreScopeWireV1 = z.output<typeof consumerStoreScopeV1Schema>;
export type ConsumerManifestWireV1 = z.output<typeof consumerManifestV1Schema>;
export type FulfilmentSelectionWireV1 = z.output<typeof fulfilmentSelectionV1Schema>;
export type CartLineInputWireV1 = z.output<typeof cartLineInputV1Schema>;
export type CartSnapshotWireV1 = z.output<typeof cartSnapshotV1Schema>;
export type CartEventWireV1 = z.output<typeof cartEventV1Schema>;
