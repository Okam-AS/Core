import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { RequestService } from './request-service'

export interface WrappedData {
    storeId: number
    storeName: string
    storeLogoUrl: string
    year: number
    totalOrders: number
    totalRevenue: number
    totalRevenueFormatted: string
    averageOrderValue: number
    averageOrderValueFormatted: string
    busiestDay: string | null
    busiestDayOrders: number
    busiestHour: number
    busiestDayOfWeek: string
    mostPopularDay: string
    mostPopularHourRange: string
    topProducts: TopProduct[]
    iOSOrders: number
    androidOrders: number
    webOrders: number
    paymentMethodCounts: Record<string, number>
    selfPickupOrders: number
    homeDeliveryOrders: number
    tableDeliveryOrders: number
    woltDeliveryOrders: number
    totalTips: number
    totalTipsFormatted: string
    funFacts: FunFact[]
    uniqueCustomers: number
    monthlyRevenue: MonthlyDataPoint[]
    monthlyOrders: MonthlyDataPoint[]
}

export interface TopProduct {
    productId: string
    name: string
    quantitySold: number
    revenue: number
    revenueFormatted: string
}

export interface FunFact {
    icon: string
    title: string
    description: string
    value: string
}

export interface MonthlyDataPoint {
    month: number
    monthName: string
    value: number
}

export class WrappedService {
    private _requestService: RequestService

    constructor(vuexModule: IVuexModule) {
        this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    }

    public async GetWrappedData(storeId: number): Promise<WrappedData> {
        const response = await this._requestService.GetRequest(`/wrapped/${storeId}`)
        const parsedResponse = this._requestService.TryParseResponse(response)
        if (parsedResponse === undefined) {
            throw new Error('Failed to get wrapped data')
        }
        return parsedResponse
    }

    public async NotifyViewed(storeId: number): Promise<void> {
        await this._requestService.PostRequest(`/wrapped/notify/${storeId}`, {})
    }
}
