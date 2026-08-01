import { Cart, CartValidation, Order, CartLineItem, Product, RecommendProductsRequest, UpdateCompanyInfoModel } from "../models";
import { ICoreInitializer } from "../interfaces";
import { RequestService } from "./request-service";

export class CartService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetRecommendations(model: RecommendProductsRequest): Promise<Array<Product>> {
    const response = await this._requestService.PostRequest("/carts/recommendations", model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke hente produkter");
    }
    return parsedResponse;
  }

  public async GetCartLineItem(cartLineItem: CartLineItem): Promise<CartLineItem> {
    const response = await this._requestService.PostRequest("/carts/lineItem", cartLineItem);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke hente produkt");
    }
    return parsedResponse;
  }

  public async GetByStoreId(storeId: number): Promise<Cart> {
    const response = await this._requestService.GetRequest("/carts/" + storeId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke hente handlekurv");
    }
    return parsedResponse;
  }

  public async Update(model: Cart): Promise<Cart> {
    const response = await this._requestService.PutRequest("/carts", model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke oppdatere handlekurv");
    }
    return parsedResponse;
  }

  public async Validate(storeId: number): Promise<CartValidation> {
    const response = await this._requestService.GetRequest("/carts/validate/" + storeId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke validere handlekurv");
    }
    return parsedResponse;
  }

  /**
   * Promotes the cart to an order.
   *
   * `reservationToken` is the Company Meals funding authorization the quote returned once
   * (MealsService.CreateQuote). It is REQUIRED whenever the cart's tender is
   * `PaymentType.CompanyAccount`: the backend binds it to the created order and, without it, cancels
   * the just-created order and refuses with a stable `MEALS_*` reason. It travels in the query
   * string because that is the only inbound path the API exposes for it. Every other tender ignores
   * it, so it is passed only when present.
   *
   * On refusal the backend answers `{ message }` — for a funded order that message IS the reason
   * code, so it is carried out on the thrown error as `reasonCode` rather than flattened into one
   * untranslatable sentence.
   */
  public async Complete(storeId: number, reservationToken?: string): Promise<Order> {
    const query = reservationToken ? "?reservationToken=" + encodeURIComponent(reservationToken) : "";
    const response = await this._requestService.PostRequest("/carts/complete/" + storeId + query);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      const problem = this._requestService.TryParseProblem(response);
      const error: any = new Error(problem?.message || problem?.detail || "Kunne ikke fullføre ordre");
      error.reasonCode = typeof problem?.message === "string" && problem.message.indexOf("MEALS_") === 0 ? problem.message : (problem?.code || null);
      throw error;
    }
    return parsedResponse;
  }

  public async Delete(storeId: Number): Promise<boolean> {
    const response = await this._requestService.DeleteRequest("/carts/" + storeId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async UpdateCompanyInfo(storeId: number, model: UpdateCompanyInfoModel): Promise<UpdateCompanyInfoModel> {
    const response = await this._requestService.PostRequest("/carts/updateCompanyInfo/" + storeId, model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke oppdatere firmainfo");
    }
    return parsedResponse;
  }

  public async ReorderFromOrder(orderId: string | number): Promise<Cart> {
    const response = await this._requestService.PostRequest("/carts/reorder/" + orderId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke bestille på nytt");
    }
    return parsedResponse;
  }
}
