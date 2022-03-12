import { IGeolocationModule, ILocation } from '../interfaces'

class GeolocationModuleNS implements IGeolocationModule {
    getCurrentLocation: ILocation;
    isEnabled: boolean;

    constructor () {
      const geolocation = require('@nativescript/geolocation' + '')
      this.getCurrentLocation = geolocation.getCurrentLocation
      this.isEnabled = geolocation.isEnabled
    }
}

export const GeolocationModule = GeolocationModuleNS