import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { freshPinia } from "../tests/test-platform";
import { useCheckout } from "./checkout";
import { StripeService } from "../services";

// FREE-ORDER GUARD (the money-critical unit).
//
// For WEB TWINT the backend creates the PaymentIntent with Confirm=false: the intent is NOT paid yet
// and returns NO nextAction — the customer still has to approve in the TWINT app, after which the order
// is booked server-side (webhook + GET /stripe/verify polling). The danger is the generic "no nextAction
// => captured" branch in createStripePaymentIntent: if a Confirm=false response fell through to it, the
// client would resolve isPaid:true and complete a free, unpaid order. createStripePaymentIntent guards
// this by intercepting (paymentMethodType === "twint" && !isApp) BEFORE that branch. These tests pin
// that behaviour.
//
// stripeService() does `new StripeService(...)` per call, so we stub the shared prototype method
// CreatePaymentIntent to feed createStripePaymentIntent an arbitrary backend response without a network.
describe("useCheckout.createStripePaymentIntent — web-TWINT free-order guard", () => {
  let checkout: ReturnType<typeof useCheckout>;
  let createPaymentIntent: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    freshPinia();
    checkout = useCheckout();
    createPaymentIntent = vi.spyOn(StripeService.prototype, "CreatePaymentIntent");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does NOT complete the order for a web-TWINT Confirm=false response (no succeeded state, no nextAction)", async () => {
    // This is exactly the Confirm=false shape: an intent id and a client secret, but NO nextAction and
    // NO succeeded/paid flag. It must never be treated as paid.
    createPaymentIntent.mockResolvedValue({
      paymentIntentId: "pi_web_twint",
      secret: "pi_web_twint_secret_abc",
      // deliberately: no nextAction, no `succeeded`/`status: "succeeded"`
    });

    const result = await checkout.createStripePaymentIntent({
      amount: 5000,
      cartId: "cart_1",
      paymentMethodType: "twint",
      isApp: false,
    } as any);

    // The guard hands back the client secret for stripe.confirmTwintPayment and marks the order as
    // NOT paid + requiring client confirmation. isPaid must be false.
    expect(result.isPaid).toBe(false);
    expect(result.requiresClientConfirmation).toBe(true);
    expect(result.clientSecret).toBe("pi_web_twint_secret_abc");
  });

  it("rejects (does not complete) a web-TWINT response that is missing the client secret", async () => {
    // Confirm=false but the backend gave us no secret — the client cannot confirm, so this must be a
    // hard failure, never a silent completion.
    createPaymentIntent.mockResolvedValue({
      paymentIntentId: "pi_web_twint_no_secret",
      // no secret, no nextAction
    });

    await expect(
      checkout.createStripePaymentIntent({
        amount: 5000,
        cartId: "cart_1",
        paymentMethodType: "twint",
        isApp: false,
      } as any)
    ).rejects.toBeUndefined();

    expect(checkout.errorMessage).toBeTruthy(); // an error surfaced to the user
  });

  it("rejects when the backend returns no paymentIntentId at all", async () => {
    createPaymentIntent.mockResolvedValue({});

    await expect(
      checkout.createStripePaymentIntent({
        amount: 5000,
        cartId: "cart_1",
        paymentMethodType: "twint",
        isApp: false,
      } as any)
    ).rejects.toBeUndefined();
  });

  // Positive control: the guard is scoped to WEB TWINT only. A normal card intent with no nextAction is
  // server-captured and SHOULD resolve isPaid:true — proving we did not over-block the happy path.
  it("still completes a normal CARD intent with no nextAction (server-captured => isPaid:true)", async () => {
    createPaymentIntent.mockResolvedValue({
      paymentIntentId: "pi_card",
      // card path: no nextAction means the charge was captured
    });

    const result = await checkout.createStripePaymentIntent({
      amount: 5000,
      cartId: "cart_1",
      paymentMethodType: "card",
      isApp: false,
    } as any);

    expect(result.isPaid).toBe(true);
  });

  // A 3D-Secure / hosted redirect (also native TWINT server-confirm) is not paid yet but must not be
  // rejected either — it returns the redirect URL and isPaid:false.
  it("returns a redirect (isPaid:false) for a redirect_to_url nextAction", async () => {
    createPaymentIntent.mockResolvedValue({
      paymentIntentId: "pi_redirect",
      nextAction: {
        type: "redirect_to_url",
        redirect_to_url: { url: "https://hooks.stripe.test/3ds", return_url: "https://app.test/return" },
      },
    });

    const result = await checkout.createStripePaymentIntent({
      amount: 5000,
      cartId: "cart_1",
      paymentMethodType: "card",
      isApp: false,
    } as any);

    expect(result.isPaid).toBe(false);
    expect(result.redirectUrl).toBe("https://hooks.stripe.test/3ds");
  });
});
