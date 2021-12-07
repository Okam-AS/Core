import { IGeolocationModule, ILocation } from '../interfaces'

class GeolocationModuleNUXT implements IGeolocationModule {
    getCurrentLocation: ILocation;
    isEnabled: boolean;
}

export const GeolocationModule = GeolocationModuleNUXT