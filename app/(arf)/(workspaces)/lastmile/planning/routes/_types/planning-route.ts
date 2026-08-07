/** Rota Listesi sayfası — Orkestratör panelinden bağımsız liste modeli */

export type PlanningRouteStatus = 'aktif' | 'planlandi' | 'tamamlandi' | 'iptal'

export type PlanningRouteStatusScope = 'all' | PlanningRouteStatus

/** Planlanan güne göre bugün / geçmiş / ileri */
export type PlanningRouteDateChip = 'bugun' | 'gecmis' | 'ileri'

export type PlanningRouteDateScope = 'all' | PlanningRouteDateChip

/** Rota listesi — sipariş rota tipinden bağımsız (Karışık dahil) */
export type PlanningRouteType =
  | 'Karışık'
  | 'Standart Rota'
  | 'Ekspres Teslimat'
  | 'Toplama Ringi'

export type PlanningRouteListItem = {
  id: string
  label: string
  color: string
  status: PlanningRouteStatus
  routeType: PlanningRouteType
  operationDate: string
  dateChip: PlanningRouteDateChip
  vehicleId: string
  vehiclePlate: string
  courierName: string | null
  progressCompleted: number
  progressTotal: number
  orderCount: number
  distanceKm: number
  /** Planlanan süre (dk) */
  durationPlannedMin: number
  /** Gerçekleşen süre (dk) — tamamlanmamışsa null */
  durationActualMin: number | null
  region: string
  capacityVolumePct: number
  capacityWeightPct: number
  /** Vardiya veya ilk/son stop ETA */
  shiftStart: string | null
  shiftEnd: string | null
  parkLabel: string | null
  /**
   * Rota müşteriye bağlıysa (tenant/müşteri scoped planlama).
   * BE `customerId` / `customerSnapshot` döndüğünde dolar; yoksa null → "—".
   */
  customerId: string | null
  customerName: string | null
  createdAt: string
  createdBy: string | null
}

export type PlanningRouteListKpi = {
  todayActive: number
  plannedToday: number
  carryover: number
  future: number
  completedToday: number
  canceled: number
}
