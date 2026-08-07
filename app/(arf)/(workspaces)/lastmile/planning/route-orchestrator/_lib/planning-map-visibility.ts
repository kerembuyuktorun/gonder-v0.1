import type { VehicleOperationalStatus } from '../../../resources/vehicles/_types/vehicle'

export type PlanningMapMode =
  | 'bottom-only'
  | 'both-sides'
  | 'right-only'
  | 'left-only'
  | 'minimal'
  | 'selection-focus'

/** Sahadaki araçların haritada nasıl filtreleneceği */
export type FieldVehicleFilter =
  | 'all'
  | 'operational' // aktif rotada + boşta (pasif yok)
  | 'selected-only'
  | 'none'

export function resolvePlanningMapMode(input: {
  step: number
  bottomPanelExpanded: boolean
  leftPanelVisible: boolean
  rightPanelVisible: boolean
  /** Toolbar’da seçim var: sipariş ve/veya araç */
  hasPlanningSelection: boolean
  /** Alt panelden seçilmiş aktif rota var — panel kapansa da pinlenir */
  hasSelectedActiveRoutes: boolean
}): PlanningMapMode | null {
  if (input.step !== 1) return null

  const left = input.leftPanelVisible
  const right = input.rightPanelVisible

  // Sol/sağ açıkken panel kuralları (rota seçimi temizlenir)
  if (left && right) return 'both-sides'
  if (right) return 'right-only'
  if (left) return 'left-only'

  // Rota seçiliyse (alt açık/kapalı fark etmez) → seçili rotalar
  if (input.hasSelectedActiveRoutes) return 'bottom-only'

  // Planlama seçimi (sipariş ve/veya araç) paneller kapansa / alt açılsa bile kalır
  if (input.hasPlanningSelection) return 'selection-focus'

  // Alt panel açık, rota seçimi yok, planlama seçimi yok → boş harita
  if (input.bottomPanelExpanded) return 'bottom-only'

  return 'minimal'
}

/** Sipariş pinleri: sol panel veya sol+sağ açıkken; ya da selection-focus */
export function shouldShowPlanningOrders(mode: PlanningMapMode | null): boolean {
  return (
    mode === 'left-only' ||
    mode === 'both-sides' ||
    mode === 'selection-focus'
  )
}

/** selection-focus’ta yalnızca seçili siparişler; diğer modlarda havuzun tamamı */
export function shouldShowOnlySelectedOrders(mode: PlanningMapMode | null): boolean {
  return mode === 'selection-focus'
}

export function resolveFieldVehicleFilter(
  mode: PlanningMapMode | null,
  hasVehicleSelection: boolean
): FieldVehicleFilter {
  switch (mode) {
    case 'minimal':
      return 'all'
    case 'left-only':
      // Sol: seçim varsa seçili; yoksa aktif rotada + boşta
      return hasVehicleSelection ? 'selected-only' : 'operational'
    case 'both-sides':
      // Sol+sağ: pasif yok; seçim varsa yalnızca seçili
      return hasVehicleSelection ? 'selected-only' : 'operational'
    case 'right-only':
      // Sağ: seçim yoksa tümü, varsa yalnızca seçili
      return hasVehicleSelection ? 'selected-only' : 'all'
    case 'selection-focus':
      return 'selected-only'
    default:
      return 'none'
  }
}

export function shouldShowSelectedActiveRoutes(mode: PlanningMapMode | null): boolean {
  return mode === 'bottom-only'
}

export function isOperationalVehicleStatus(status: VehicleOperationalStatus): boolean {
  return status === 'yolda' || status === 'bos_ta'
}
