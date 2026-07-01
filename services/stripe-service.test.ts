import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerTestPlatform } from "../tests/test-platform";
import { StripeService } from "./stripe-service";

// PullVerifyTwintResult is the client half of the TWINT completion flow: TWINT settles out-of-band
// (customer approves in their banking app; Stripe books the order via webhook), so the client cannot
// infer success from confirmTwintPayment — it polls GET /stripe/verify/{id} until the server reports a
// terminal StripeVerifyStatus (Waiting=100 / Success=200 / Fail=300, serialized as name OR number).
// These tests drive that poll with fake timers and a stubbed Verify(), asserting the right handler
// fires and — critically — that the polling interval is always cleared (a leaked interval would keep
// hammering the backend forever).
describe("StripeService.PullVerifyTwintResult", () => {
  let service: StripeService;

  beforeEach(() => {
    registerTestPlatform(); // so RequestService's constructor (getHttpModule) doesn't throw
    vi.useFakeTimers();
    // coreInitializer shape is irrelevant here: Verify is stubbed per-test, so the real network is
    // never reached.
    service = new StripeService({ bearerToken: "", clientPlatformName: "test", cultureCode: "no" } as any);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("fires the success handler and starts no interval when the leading verify already succeeds", async () => {
    const verify = vi.spyOn(service, "Verify").mockResolvedValue({ status: "Success" });
    const onSuccess = vi.fn();
    const onFail = vi.fn();

    service.PullVerifyTwintResult("pi_123", onSuccess, onFail);

    // Leading verify fires ~800ms in.
    await vi.advanceTimersByTimeAsync(800);

    expect(verify).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onFail).not.toHaveBeenCalled();
    // No polling interval should have been scheduled — the fast-approval path is fully terminal.
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps polling until a later verify returns Success (numeric 200), then clears the interval", async () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    // Leading verify still Waiting -> interval starts; second poll returns the numeric terminal code.
    const verify = vi
      .spyOn(service, "Verify")
      .mockResolvedValueOnce({ status: "Waiting" })
      .mockResolvedValueOnce({ status: 200 });
    const onSuccess = vi.fn();
    const onFail = vi.fn();

    service.PullVerifyTwintResult("pi_456", onSuccess, onFail);

    await vi.advanceTimersByTimeAsync(800); // leading verify -> Waiting -> setInterval(poll, 1800)
    expect(onSuccess).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(1); // exactly the poll interval is pending

    await vi.advanceTimersByTimeAsync(1800); // first poll -> 200
    expect(verify).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({ status: 200 });
    expect(onFail).not.toHaveBeenCalled();
    // Interval must be cleared: both the clearInterval call and zero remaining timers prove no leak.
    expect(clearSpy).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("fires the fail handler and clears the interval on a Fail (300) poll", async () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    vi.spyOn(service, "Verify")
      .mockResolvedValueOnce({ status: "Waiting" })
      .mockResolvedValueOnce({ status: 300 });
    const onSuccess = vi.fn();
    const onFail = vi.fn();

    service.PullVerifyTwintResult("pi_789", onSuccess, onFail);

    await vi.advanceTimersByTimeAsync(800);
    await vi.advanceTimersByTimeAsync(1800);

    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledWith({ status: 300 });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears the interval and fails when a poll rejects (network error mid-poll)", async () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    vi.spyOn(service, "Verify")
      .mockResolvedValueOnce({ status: "Waiting" })
      .mockRejectedValueOnce(new Error("network"));
    const onSuccess = vi.fn();
    const onFail = vi.fn();

    service.PullVerifyTwintResult("pi_err", onSuccess, onFail);

    await vi.advanceTimersByTimeAsync(800);
    await vi.advanceTimersByTimeAsync(1800);

    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("fails fast without scheduling anything when no paymentIntentId is given", () => {
    const onSuccess = vi.fn();
    const onFail = vi.fn();

    service.PullVerifyTwintResult("", onSuccess, onFail);

    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0); // no verify scheduled at all
  });
});
