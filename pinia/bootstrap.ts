import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useServices, useStore } from ".";
import $config from "../helpers/configuration";

// NOR-102 (14.1) consumer: resolves the server-driven, per-region Stripe publishable
// key (GET /bootstrap?region=NO|CH) instead of the single hardcoded NO key baked into
// env.ts. A CH PaymentIntent is created server-side on the CH Stripe platform account;
// confirming it client-side with the NO publishable key is a cross-account mismatch —
// this store is what both loadStripe() call sites (CheckoutPayment.vue,
// CheckoutSubmit.vue) use to get the correct key.
//
// Region is derived the same way core/pinia/checkout.ts derives isSwissStore: the Store
// model exposes no separate country/region field, only currencyCode ("CHF" => "CH").
//
// The fetch is cached in-memory per region for the life of the SPA session (Pinia store
// state is a singleton), so remounting the checkout components does not refetch — a
// hard page reload is the only thing that resets the cache, which is the safe failure
// mode for a payment-correctness fix (never serve a stale cross-region key).
//
// NOR-102 hardening: axios (core/services/request-service.ts) has no default timeout, so an
// unresponsive /bootstrap would otherwise hang this fetch — and getStripePublishableKey()
// with it — forever: loadStripe() never runs, leaving CheckoutPayment's card form blank and
// CheckoutSubmit's submit button latched disabled. BOOTSTRAP_FETCH_TIMEOUT_MS bounds the
// fetch so getStripePublishableKey() is guaranteed to settle quickly either way.
const BOOTSTRAP_FETCH_TIMEOUT_MS = 2500;

export const useBootstrap = defineStore("bootstrap", () => {
  const { bootstrapService } = useServices();
  const _store = useStore();

  const publishableKeyPrivate = ref("");
  const loadedForRegion = ref("");
  // Keyed by region (not just a bare Promise) so an in-flight fetch for one region can
  // never be silently reused to answer a concurrent call for a *different* region — that
  // would let getStripePublishableKey() resolve before loadedForRegion actually matches,
  // which is exactly the kind of cross-region mixup this store exists to prevent.
  let pendingRequest: { region: string; promise: Promise<void> } | null = null;

  const region = computed(() => (((_store.currentStore?.currencyCode || "").toUpperCase() === "CHF") ? "CH" : "NO"));

  const fetchPublishableKey = (currentRegion: string): Promise<void> => {
    if (!pendingRequest || pendingRequest.region !== currentRegion) {
      // Placeholder, replaced synchronously below once the real (raced) promise exists —
      // needed so `release` can close over `entry` by reference for the identity check.
      const entry: { region: string; promise: Promise<void> } = { region: currentRegion, promise: Promise.resolve() };

      // Identity-guarded, not just region-matched: the timeout below can clear
      // pendingRequest EARLY, before the real request finishes. That means a later call for
      // the same region can start a second, independent in-flight fetch while this one is
      // still running in the background. Without the identity check, whichever of the two
      // settles first would incorrectly clear the OTHER one's still-active slot.
      const release = () => {
        if (pendingRequest === entry) pendingRequest = null;
      };

      const request = bootstrapService()
        .Get(currentRegion)
        .then((result) => {
          if (result?.publishableKey) {
            publishableKeyPrivate.value = result.publishableKey;
            loadedForRegion.value = currentRegion;
          }
        })
        .catch(() => {
          // Swallowed: getStripePublishableKey() below applies the env-key fallback.
        })
        .finally(release);

      // setTimeout-based rejector raced against the real request. `request` above never
      // itself rejects (its own .catch swallows failures), so only this can lose the race.
      let timeoutId!: ReturnType<typeof setTimeout>;
      const timeout = new Promise<never>((_resolve, reject) => {
        timeoutId = setTimeout(() => reject(new Error("bootstrap fetch timed out")), BOOTSTRAP_FETCH_TIMEOUT_MS);
      });

      entry.promise = Promise.race([request, timeout])
        .catch(() => {
          // Timeout won the race. Do NOT poison the cache: publishableKeyPrivate and
          // loadedForRegion are left untouched here, exactly as on genuine failure — so
          // getStripePublishableKey() below falls through to the env-key fallback and warns
          // once, same as any other failure. Just release this region's slot so the next
          // call retries with a fresh fetch instead of waiting on this same slow one again.
          release();
        })
        .finally(() => clearTimeout(timeoutId));

      pendingRequest = entry;
    }
    return pendingRequest.promise;
  };

  // Single entry point for both loadStripe() call sites. Resolves the region-correct
  // Stripe publishable key, degrading to $config.stripePublishableKey (never throws,
  // never blocks checkout) if the bootstrap fetch failed or returned an empty key.
  const getStripePublishableKey = async (): Promise<string> => {
    const currentRegion = region.value;
    if (!(publishableKeyPrivate.value && loadedForRegion.value === currentRegion)) {
      await fetchPublishableKey(currentRegion);
    }
    if (publishableKeyPrivate.value && loadedForRegion.value === currentRegion) {
      return publishableKeyPrivate.value;
    }
    console.warn("[bootstrap] GET /bootstrap returned no publishableKey for region " + currentRegion + "; falling back to the env Stripe publishable key.");
    return $config.stripePublishableKey;
  };

  return {
    getStripePublishableKey,
  };
});
