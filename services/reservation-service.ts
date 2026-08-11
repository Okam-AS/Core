import { RequestService } from "./request-service";
import { ICoreInitializer } from "../interfaces";
import {
  ReservationModel,
  AdminReservationModel,
  ReservationSuggestionRequestModel,
  ReservationSuggestionModel,
  ReservationAvailabilityModel,
  ConsumerReservationRequestModel,
  ReservationConfirmationModel,
  ReservationPublicModel
} from "../models";

export class ReservationService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  // ---- Admin ------------------------------------------------------------------

  public async GetForDay(storeId: number, date: string): Promise<Array<ReservationModel>> {
    const response = await this._requestService.GetRequest("/Reservation/" + storeId + "?date=" + encodeURIComponent(date));
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to get reservations for day");
    }
    return parsed;
  }

  public async Search(storeId: number, q: string): Promise<Array<ReservationModel>> {
    const response = await this._requestService.GetRequest("/Reservation/" + storeId + "/search?q=" + encodeURIComponent(q));
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to search reservations");
    }
    return parsed;
  }

  public async CreateAdmin(storeId: number, model: AdminReservationModel): Promise<ReservationModel> {
    const response = await this._requestService.PostRequest("/Reservation/" + storeId, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to create reservation");
    }
    return parsed;
  }

  public async UpdateAdmin(storeId: number, reservationId: number, model: AdminReservationModel): Promise<ReservationModel> {
    const response = await this._requestService.PutRequest("/Reservation/" + storeId + "/" + reservationId, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to update reservation");
    }
    return parsed;
  }

  public async Suggest(storeId: number, model: ReservationSuggestionRequestModel): Promise<ReservationSuggestionModel> {
    const response = await this._requestService.PostRequest("/Reservation/" + storeId + "/suggest", model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to suggest table");
    }
    return parsed;
  }

  // ---- Consumer (anonymous) ---------------------------------------------------

  public async GetAvailability(storeId: number, date: string, guests: number): Promise<ReservationAvailabilityModel> {
    const response = await this._requestService.GetRequest(
      "/Reservation/availability/" + storeId + "?date=" + encodeURIComponent(date) + "&guests=" + encodeURIComponent(guests)
    );
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to get reservation availability");
    }
    return parsed;
  }

  public async Book(storeId: number, model: ConsumerReservationRequestModel): Promise<ReservationConfirmationModel> {
    const response = await this._requestService.PostRequest("/Reservation/book/" + storeId, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to book reservation");
    }
    return parsed;
  }

  public async GetByToken(token: string): Promise<ReservationPublicModel> {
    const response = await this._requestService.GetRequest("/Reservation/by-token/" + token);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to get reservation by token");
    }
    return parsed;
  }

  public async Cancel(token: string): Promise<ReservationPublicModel> {
    const response = await this._requestService.PostRequest("/Reservation/cancel/" + token);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to cancel reservation");
    }
    return parsed;
  }
}
