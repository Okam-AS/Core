import { ICoreInitializer } from "../interfaces";
import { RequestService } from "./";

// NOR-102 (14.1) — server-driven client bootstrap. GET /bootstrap?region=NO|CH returns
// the per-region config (currency, locale, connected-account country, the Stripe
// publishable key for that region's platform account, enabled payment methods, allowed
// OTP phone prefixes). Only publishableKey is modeled here since it's the only field
// ConsumerWeb currently consumes (see WebApi.Models.Bootstrap.BootstrapConfig for the
// full backend shape).
export type BootstrapConfig = {
  publishableKey: string;
};

export class BootstrapService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async Get(region: string): Promise<BootstrapConfig> {
    const response = await this._requestService.GetRequest("/bootstrap?region=" + encodeURIComponent(region));
    const parsed = this._requestService.TryParseResponse(response);
    // Defensive against casing: the wire format is expected to be camelCase
    // (`publishableKey`), but a PascalCase payload (`PublishableKey`) is tolerated too so
    // a serializer difference degrades to the caller's env-key fallback instead of
    // silently sending the wrong region's key to Stripe.js.
    const publishableKey = parsed?.publishableKey || parsed?.PublishableKey || "";
    return { publishableKey };
  }
}
