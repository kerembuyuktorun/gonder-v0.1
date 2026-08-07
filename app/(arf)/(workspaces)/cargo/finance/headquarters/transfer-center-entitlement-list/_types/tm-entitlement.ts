export type CommissionModel = "per_piece" | "percentage"

export interface TmEntitlementRow {
  transferCenterId: string
  transferCenterName: string
  transferCenterCode: string
  commissionModel: CommissionModel
  commissionValue: number
  toplamParcaAdedi: number
  toplamKargoBedeli: number
  iptalEdilen: number
}

export interface TmEntitlementSummary {
  toplamHakedis: number
  parcaBasiToplam: number
  yuzdelikToplam: number
  iptalEdilen: number
  netToplamHakedis: number
}
