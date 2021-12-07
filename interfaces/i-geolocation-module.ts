import { ILocation } from './'
export interface IGeolocationModule {
  getCurrentLocation: ILocation;
  isEnabled: boolean;
}
