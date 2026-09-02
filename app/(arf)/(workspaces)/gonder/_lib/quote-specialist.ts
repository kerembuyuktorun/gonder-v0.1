import type { OperationType } from '../_types/price-calculation'

const SPECIAL_LOAD = /frigo|soğuk|lowbed|tenteli|özel|vinç|jumbo|mega|açık kasa|damper/i

export function needsLogisticsSpecialist(input: {
  operationType?: OperationType | null
  logisticsSubtype?: 'ftl' | 'ltl' | null
  vehicleType?: string | null
  bodyType?: string | null
  loadType?: string | null
  totalDesi?: number
  weightKg?: number | null
}): boolean {
  if (input.operationType === 'logistics') return true
  if (input.logisticsSubtype === 'ftl' || input.logisticsSubtype === 'ltl') return true
  if ((input.totalDesi ?? 0) >= 30) return true
  if ((input.weightKg ?? 0) >= 500) return true
  const blob = `${input.vehicleType ?? ''} ${input.bodyType ?? ''} ${input.loadType ?? ''}`
  return SPECIAL_LOAD.test(blob)
}
