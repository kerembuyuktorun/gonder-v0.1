import { searchPlaces } from './address-search'
import { PACKAGE_PRESETS, findPallet } from './catalog'
import {
  inferFtlConfig,
  inferServiceFromLoad,
  TYPICAL_PALLET_CM,
} from './infer-load'
import {
  coerceDeliverySpeed,
  createInitialOrder,
  type LogisticsMode,
  type OrderDraft,
  type PackagePresetId,
  type PlaceResult,
  type ServiceType,
} from './order-types'

export const QUOTE_PREFILL_KEY = 'gonder-landing-quote-prefill'

export type QuotePrefill = {
  service?: ServiceType | null
  subtype?: LogisticsMode
  origin?: string
  destination?: string
  originLabel?: string
  destinationLabel?: string
  quantity?: number
  unit?: 'palet' | 'koli'
  weightKg?: number
  loadingDate?: string
  description?: string
  stackable?: boolean
  widthCm?: number
  lengthCm?: number
  heightCm?: number
  cargoPreset?: PackagePresetId
  vehicleTypeId?: string
  bodyTypeId?: string
}

export function saveQuotePrefill(draft: QuotePrefill) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(QUOTE_PREFILL_KEY, JSON.stringify(draft))
  } catch {
    // private mode / quota
  }
}

export function readQuotePrefill(): QuotePrefill | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(QUOTE_PREFILL_KEY)
    if (!raw) return null
    return JSON.parse(raw) as QuotePrefill
  } catch {
    return null
  }
}

export function clearQuotePrefill() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(QUOTE_PREFILL_KEY)
  } catch {
    // ignore
  }
}

export function resolvePrefillPlace(label?: string): PlaceResult | null {
  if (!label) return null
  return searchPlaces(label)[0] ?? null
}

function perPieceWeight(totalKg: number | undefined, quantity: number | undefined): number | undefined {
  if (totalKg == null || !Number.isFinite(totalKg) || totalKg <= 0) return undefined
  const qty = quantity && quantity > 0 ? quantity : 1
  return Math.round((totalKg / qty) * 100) / 100
}

function applyPreset(order: OrderDraft, presetId: PackagePresetId | undefined): OrderDraft {
  if (!presetId || presetId === 'custom') {
    return {
      ...order,
      cargo: { ...order.cargo, preset: presetId ?? order.cargo.preset },
    }
  }
  const preset = PACKAGE_PRESETS.find((item) => item.id === presetId)
  if (!preset) return order
  return {
    ...order,
    cargo: {
      ...order.cargo,
      preset: preset.id,
      widthCm: preset.widthCm,
      lengthCm: preset.lengthCm,
      heightCm: preset.heightCm,
      weightKg: order.cargo.weightKg || preset.weightKg,
    },
  }
}

/** Asistan taslağını sipariş sihirbazı draft'ına işler. */
export function applyQuotePrefill(
  order: OrderDraft,
  prefill: QuotePrefill,
  places?: { origin?: PlaceResult | null; destination?: PlaceResult | null }
): OrderDraft {
  const origin = places?.origin ?? order.origin ?? resolvePrefillPlace(prefill.originLabel ?? prefill.origin)
  const destination =
    places?.destination ?? order.destination ?? resolvePrefillPlace(prefill.destinationLabel ?? prefill.destination)

  const load = {
    text: prefill.description,
    unit: prefill.unit,
    quantity: prefill.quantity,
    weightKg: prefill.weightKg,
    widthCm: prefill.widthCm,
    lengthCm: prefill.lengthCm,
    heightCm: prefill.heightCm,
  }

  const service =
    prefill.service ??
    (prefill.unit || prefill.weightKg || prefill.quantity ? inferServiceFromLoad(load) : order.service)

  const logisticsMode =
    service === 'lojistik' ? (prefill.subtype ?? order.logisticsMode) : service === 'kargo' ? null : order.logisticsMode

  let next: OrderDraft = {
    ...order,
    origin: origin ?? order.origin,
    destination: destination ?? order.destination,
    service,
    logisticsMode,
    extras: {
      ...order.extras,
      loadingDate: prefill.loadingDate || order.extras.loadingDate,
    },
  }

  next.deliverySpeed = coerceDeliverySpeed(next.service, next.deliverySpeed)

  if (next.service === 'kargo') {
    const qty = prefill.quantity ?? next.cargo.quantity
    const pieceKg = perPieceWeight(prefill.weightKg, qty)
    next = {
      ...next,
      cargo: {
        ...next.cargo,
        quantity: qty,
        weightKg: pieceKg ?? next.cargo.weightKg,
        contentNote: prefill.description || next.cargo.contentNote,
        widthCm: prefill.widthCm ?? next.cargo.widthCm,
        lengthCm: prefill.lengthCm ?? next.cargo.lengthCm,
        heightCm: prefill.heightCm ?? next.cargo.heightCm,
      },
    }
    next = applyPreset(next, prefill.cargoPreset)
  }

  if (next.service === 'lojistik' && next.logisticsMode !== 'ftl') {
    const qty = prefill.quantity ?? next.ltl.quantity
    const unit = prefill.unit
    const loadKind = unit === 'palet' ? 'palet' : unit === 'koli' ? 'koli' : (next.ltl.loadKind ?? (qty ? 'palet' : null))
    const pallet = loadKind === 'palet' ? findPallet(next.ltl.palletTypeId) ?? findPallet('euro') : null
    const pieceKg = perPieceWeight(prefill.weightKg, qty)

    next = {
      ...next,
      logisticsMode: next.logisticsMode ?? 'ltl',
      ltl: {
        ...next.ltl,
        loadKind,
        palletTypeId: loadKind === 'palet' ? (pallet?.id ?? 'euro') : next.ltl.palletTypeId,
        quantity: qty,
        weightKg: pieceKg ?? next.ltl.weightKg,
        description: prefill.description || next.ltl.description,
        stackable: prefill.stackable ?? next.ltl.stackable,
        widthCm: prefill.widthCm ?? pallet?.widthCm ?? (loadKind === 'palet' ? TYPICAL_PALLET_CM.widthCm : next.ltl.widthCm),
        lengthCm:
          prefill.lengthCm ?? pallet?.lengthCm ?? (loadKind === 'palet' ? TYPICAL_PALLET_CM.lengthCm : next.ltl.lengthCm),
        heightCm: prefill.heightCm ?? (loadKind === 'palet' ? TYPICAL_PALLET_CM.heightCm : next.ltl.heightCm),
      },
    }
  }

  if (next.service === 'lojistik' && next.logisticsMode === 'ftl') {
    const ai = inferFtlConfig(load)
    const vehicleTypeId = prefill.vehicleTypeId ?? next.ftl.rows[0]?.vehicleTypeId ?? ai.vehicleTypeId
    const bodyTypeId = prefill.bodyTypeId ?? next.ftl.rows[0]?.bodyTypeId ?? ai.bodyTypeId
    next = {
      ...next,
      ftl: {
        rows: [
          {
            id: next.ftl.rows[0]?.id ?? 'veh-0',
            vehicleTypeId,
            bodyTypeId,
            count: next.ftl.rows[0]?.count || 1,
          },
        ],
      },
    }
  }

  return next
}

export function createOrderFromPrefill(prefill: QuotePrefill, origin: PlaceResult | null, destination: PlaceResult | null) {
  return applyQuotePrefill(createInitialOrder(), prefill, { origin, destination })
}
