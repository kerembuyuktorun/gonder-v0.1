export type SurchargeValueType = "fixed" | "percent"

export interface CustomSurchargeService {
  id: string
  name: string
  fee: number
}

export interface PriceSurcharge {
  smsNotificationFee: number
  codCommissionType: SurchargeValueType
  codCommissionValue: number
  pickupFee: number
  remoteAreaDeliveryFee: number
  customServices: CustomSurchargeService[]
}
