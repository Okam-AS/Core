import { ReservationAvailability, ConsumerReservationRequest, ReservationConfirmation, ReservationPublic, Reservation, AdminReservationPayload } from "../models";
import { ICoreInitializer } from "../interfaces";
import { RequestService } from "./";

// Table reservations (L3b). The consumer routes (availability / book / by-token / cancel) are
// anonymous; the admin routes are store-scoped. Mutations surface the backend {message} to the
// UI via TryParseResponseWithError and carry the HTTP status on the thrown error so callers can
// tell a 429 (rate limit) from a domain error. Maps to the API's ReservationController.
export class ReservationService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // ---- Consumer -------------------------------------------------------------

  public async GetAvailability(storeId: number, guests: number, date?: string): Promise<ReservationAvailability> {
    let path = "/Reservation/availability/" + storeId + "?guests=" + guests;
    if (date) {
      path += "&date=" + date;
    }
    const response = await this._requestService.GetRequest(path);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get availability");
    }
    return parsedResponse;
  }

  public async CreateReservation(storeId: number, request: ConsumerReservationRequest): Promise<ReservationConfirmation> {
    const response = await this._requestService.PostRequest("/Reservation/book/" + storeId, request);
    return this.ParseOrThrow(response);
  }

  public async GetByCancelToken(token: string): Promise<ReservationPublic> {
    const response = await this._requestService.GetRequest("/Reservation/by-token/" + token);
    return this.ParseOrThrow(response);
  }

  public async CancelByToken(token: string): Promise<ReservationPublic> {
    const response = await this._requestService.PostRequest("/Reservation/cancel/" + token);
    return this.ParseOrThrow(response);
  }

  // ---- Admin ----------------------------------------------------------------

  public async GetForDay(storeId: number, date: string): Promise<Array<Reservation>> {
    const response = await this._requestService.GetRequest("/Reservation/" + storeId + "?date=" + date);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get reservations");
    }
    return parsedResponse;
  }

  public async Search(storeId: number, query: string): Promise<Array<Reservation>> {
    const response = await this._requestService.GetRequest("/Reservation/" + storeId + "/search?q=" + encodeURIComponent(query));
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to search reservations");
    }
    return parsedResponse;
  }

  public async CreateAdmin(storeId: number, payload: AdminReservationPayload): Promise<Reservation> {
    const response = await this._requestService.PostRequest("/Reservation/" + storeId, payload);
    return this.ParseOrThrow(response);
  }

  public async UpdateAdmin(storeId: number, reservationId: number, payload: AdminReservationPayload): Promise<Reservation> {
    const response = await this._requestService.PutRequest("/Reservation/" + storeId + "/" + reservationId, payload);
    return this.ParseOrThrow(response);
  }

  public async SuggestTable(storeId: number, request: { startTime: string; durationMinutes: number; partySize: number; excludeReservationId?: number }): Promise<{ tableId: number | null; tableIds: Array<number> }> {
    const response = await this._requestService.PostRequest("/Reservation/" + storeId + "/suggest", request);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to suggest a table");
    }
    return parsedResponse;
  }

  // Parses a mutation response, surfacing the backend {message} and the HTTP status on the
  // thrown error (status lets the UI distinguish a 429 rate limit from a domain error).
  private ParseOrThrow(response: any): any {
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) {
      const status = response ? (response.status ?? response.statusCode) : undefined;
      const err: any = new Error(error);
      err.status = status;
      throw err;
    }
    return data;
  }
}
