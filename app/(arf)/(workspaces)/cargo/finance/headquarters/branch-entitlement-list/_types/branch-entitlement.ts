export interface BranchEntitlementRow {
  branchId: string
  branchName: string
  branchCode: string
  alimHakedisOrani: number
  dagitimHakedisOrani: number
  alimHakedisCirosu: number
  alimHakedisTotal: number
  dagitimHakedisCirosu: number
  dagitimHakedisTotal: number
  toplamHakedis: number
  teslimatiBeklenen: number
  iptalEdilen: number
}

export interface BranchEntitlementSummary {
  toplamHakedis: number
  alimHakedisTotal: number
  dagitimHakedisTotal: number
  teslimatiBeklenen: number
  iptalEdilen: number
  netToplamHakedis: number
}
