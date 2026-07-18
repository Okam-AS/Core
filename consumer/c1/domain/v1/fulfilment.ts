import {
  fulfilmentSelectionV1Schema,
  type FulfilmentSelectionWireV1,
} from '../../contracts/v1';
import { deepFreezeV1, type DeepReadonlyV1 } from './immutable';

export type FulfilmentKindV1 =
  | 'SelfPickup'
  | 'TableDelivery'
  | 'InstantHomeDelivery'
  | 'DineHomeDelivery'
  | 'WoltDelivery';
export type FulfilmentSelectionV1 =
  DeepReadonlyV1<FulfilmentSelectionWireV1>;

export type FulfilmentCapabilityV1 = Readonly<{
  kind: FulfilmentKindV1;
  enabled: boolean;
}>;

export type FulfilmentDecisionV1 =
  | Readonly<{ accepted: true; selection: FulfilmentSelectionV1 }>
  | Readonly<{
      accepted: false;
      reason: 'selection-invalid' | 'kind-unavailable';
    }>;

export function selectFulfilmentV1(input: Readonly<{
  available: readonly FulfilmentCapabilityV1[];
  selection: unknown;
}>): FulfilmentDecisionV1 {
  const parsed = fulfilmentSelectionV1Schema.safeParse(input.selection);
  if (!parsed.success) return { accepted: false, reason: 'selection-invalid' };
  const enabled = input.available.some(
    (capability) =>
      capability.kind === parsed.data.kind && capability.enabled === true,
  );
  return enabled
    ? { accepted: true, selection: deepFreezeV1(parsed.data) }
    : { accepted: false, reason: 'kind-unavailable' };
}
