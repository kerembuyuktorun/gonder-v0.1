export type CourierCashMovementType = 'collection' | 'remittance'

export type CourierCashSource =
  | 'kapida_gonderici'
  | 'kapida_alici'
  | 'diger_nakit'
  | 'tenant_tahsilat'

export type CourierCashMovement = {
  id: string
  courierId: string
  courierName?: string
  type: CourierCashMovementType
  amount: number
  occurredAt: string
  orderId?: string | null
  takipNo?: string | null
  note?: string | null
  source: CourierCashSource
  createdAt: string
}

export type CourierCashBalance = {
  courierId: string
  courierName: string
  netBalance: number
  collectedTotal: number
  remittedTotal: number
  lastMovementAt?: string
  openMovementCount: number
}

export type CourierCashBalancesKpi = {
  totalNet: number
  couriersWithBalance: number
  remittedToday: number
}

export const COURIER_CASH_MOVEMENT_TYPE_LABELS: Record<CourierCashMovementType, string> = {
  collection: 'Nakit tahsilat',
  remittance: 'Tenant tahsilatı',
}

export const COURIER_CASH_SOURCE_LABELS: Record<CourierCashSource, string> = {
  kapida_gonderici: 'Kapıda (gönderici)',
  kapida_alici: 'Kapıda (alıcı)',
  diger_nakit: 'Diğer nakit',
  tenant_tahsilat: 'Tenant tahsilatı',
}
