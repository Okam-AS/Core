import { ICoreInitializer } from "../interfaces";
import { MealsCompaniesResponse, MealsContext, CreateMealsQuoteRequest, MealsQuote } from "../models";
import { RequestService } from "./request-service";

/**
 * Company Meals — the employee-facing funding surface (backend spec 20 §5).
 *
 * ROUTE PREFIX. These three are the only core endpoints under `/v1`; everything else in this
 * library is unversioned. That is the backend's own shape (`[Route("v1")]` on
 * MealsFundingController), not a mistake to normalise away.
 *
 * THE MODULE IS DARK BY DEFAULT. With the Meals flags off the API answers an opaque 404 rather
 * than a typed refusal, and a non-member gets the same 404 — so `GetMyCompanies` answering empty
 * and `GetMyCompanies` 404ing must both mean "there is no company tender here", never an error
 * shown to a guest who was only trying to buy lunch. Hence the resolve-to-empty below.
 */
export class MealsService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  /** The entry read. Resolves to an empty list when the module is dark or the caller is in no company. */
  public async GetMyCompanies(): Promise<MealsCompaniesResponse> {
    try {
      const response = await this._requestService.GetRequest("/v1/meals/me/companies");
      const parsed = this._requestService.TryParseResponse(response);
      return parsed && Array.isArray(parsed.companies) ? parsed : ({ companies: [] } as MealsCompaniesResponse);
    } catch (e) {
      return { companies: [] } as MealsCompaniesResponse;
    }
  }

  /**
   * Eligibility for one company. Resolves to `undefined` when the module is dark or the caller is
   * not a member of it — an INELIGIBLE member is not that case: they come back with
   * `eligible: false` and a stable `ineligibleReasonCode` the strip is meant to show.
   */
  public async GetContext(companyId: string): Promise<MealsContext> {
    try {
      const response = await this._requestService.GetRequest("/v1/meals/me/context?companyId=" + encodeURIComponent(companyId));
      return this._requestService.TryParseResponse(response);
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Mints a funding reservation and returns the authorization token cart completion must carry.
   *
   * The token is returned ONCE (the backend stores only its hash), so the caller must hold it in
   * memory for the length of the checkout and must never persist or log it.
   *
   * `idempotencyKey` is a REQUIRED header: without it the endpoint answers a 400 naming the
   * precondition, and with a repeated one it re-derives the same token verbatim rather than
   * reserving the allowance twice. Give one key per checkout attempt, not one per click.
   *
   * A typed refusal (`MEALS_*`, 409) is thrown as an Error carrying `reasonCode`, because every one
   * of them is something the guest has to be told: the window closed, the allowance is spent, the
   * membership was revoked.
   */
  public async CreateQuote(storeId: number, request: CreateMealsQuoteRequest, idempotencyKey: string): Promise<MealsQuote> {
    const response = await this._requestService.PostRequest(
      "/v1/stores/" + storeId + "/meals/quotes",
      request,
      { "Idempotency-Key": idempotencyKey }
    );

    const parsed = this._requestService.TryParseResponse(response);
    if (parsed && parsed.authorizationToken) { return parsed; }

    const problem = this._requestService.TryParseProblem(response);
    const error: any = new Error(problem?.detail || problem?.title || "Kunne ikke reservere bedriftsdekning");
    // The backend renders MEALS_* codes as the problem's `code` (MealsProblemException -> RFC 9457).
    error.reasonCode = problem?.code || problem?.reasonCode || null;
    throw error;
  }
}
