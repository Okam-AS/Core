import { IGeolocationModule, ILocation } from '../interfaces'

class GeolocationModuleNS implements IGeolocationModule {
    getCurrentLocation: ILocation;
    isEnabled: boolean;

    constructor () {
      import('@nativescript/geolocation' + '').then((x) => {
        this.getCurrentLocation = x.geolocation.getCurrentLocation
        this.isEnabled = x.geolocation.isEnabled
      })
    }
}

export const GeolocationModule = GeolocationModuleNS