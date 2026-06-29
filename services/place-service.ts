import { ICoreInitializer } from "../interfaces";
import { RequestService } from "./";

export interface PlaceSearchParams {
  latLng: { lat: number; lng: number };
  distance: number;
  typeFilters: string[];
}

export interface PlaceSearchResponse {
  places: any[];
}

export class PlaceService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async SearchPlaces(params: PlaceSearchParams): Promise<PlaceSearchResponse> {
    console.log("🔍 PlaceService.SearchPlaces called with:", JSON.stringify(params, null, 2));
    
    try {
      console.log("🚀 PlaceService: Making POST request to /places/search");
      const response = await this._requestService.PostRequest("/places/search", params);
      console.log("📦 PlaceService: Raw response:", response);
      
      const parsedResponse = this._requestService.TryParseResponse(response);
      console.log("🔧 PlaceService: Parsed response:", parsedResponse);
      
      if (parsedResponse === undefined) {
        console.error("❌ PlaceService: Failed to parse response");
        throw new Error("Failed to search places");
      }
      
      console.log("✅ PlaceService: Successfully returning parsed response");
      return parsedResponse;
    } catch (error) {
      console.error("❌ PlaceService: Error in SearchPlaces:", error);
      throw error;
    }
  }
}
