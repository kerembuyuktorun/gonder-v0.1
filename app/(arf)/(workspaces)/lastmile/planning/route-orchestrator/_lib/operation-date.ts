import type {
  ActiveRouteDateScope,
  OrchestratorActiveRoute,
  OrchestratorOrder,
} from '../_types/orchestrator'

/** Yerel takvim günü → YYYY-MM-DD */
export function toOperationDateInputValue(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** N gün önce (YYYY-MM-DD) */
export function shiftOperationDate(days: number, from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return toOperationDateInputValue(d)
}

/** Sipariş alım penceresinden operasyon günü (YYYY-MM-DD) */
export function getOrderOperationDate(order: OrchestratorOrder): string | null {
  const match = order.alim_zaman_penceresi.match(/^(\d{2})\.(\d{2})\.(\d{4})/)
  if (!match) return null
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

/**
 * Mock filtre:
 * - Bugün seçiliyse tüm havuz (mevcut mock tarihler dağınık olmasın diye)
 * - Başka gün seçiliyse yalnızca o güne ait siparişler
 */
export function orderMatchesOperationDate(
  order: OrchestratorOrder,
  selectedDate: string,
  today = toOperationDateInputValue()
): boolean {
  if (selectedDate === today) return true
  const orderDate = getOrderOperationDate(order)
  if (!orderDate) return false
  return orderDate === selectedDate
}

/**
 * Aktif rota listesi:
 * - today → operasyon günü bugün
 * - carryover → operasyon günü bugünden önce (geçmişten kalan)
 */
export function activeRouteMatchesDateScope(
  route: OrchestratorActiveRoute,
  scope: ActiveRouteDateScope,
  today = toOperationDateInputValue()
): boolean {
  if (scope === 'today') return route.operationDate === today
  return route.operationDate < today
}
