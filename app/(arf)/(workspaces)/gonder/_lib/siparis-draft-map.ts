import { searchPlaces } from '../../../../(marketing)/siparis/_lib/address-search'
import {
  BODY_TYPES,
  LOAD_KINDS,
  VEHICLE_TYPES,
  findLoadKind,
} from '../../../../(marketing)/siparis/_lib/catalog'
import {
  coerceDeliverySpeed,
  createInitialOrder,
  type Offer,
  type OrderDraft,
  type PlaceResult,
} from '../../../../(marketing)/siparis/_lib/order-types'
import { buildBreakdown, buildOffers } from '../../../../(marketing)/siparis/_lib/pricing'
import type { CreateShipmentDraft } from '../_types/create-shipment'
import {
  calcPieceDesi,
  type AddressDraft,
  type DraftPiece,
  type PriceCalculationDraft,
  type PriceCalculationLocation,
  type SearchQuote,
} from '../_types/price-calculation'
import type { QuoteHighlight } from '../_types/quotes'

type SiparisStep = 'route' | 'service' | 'mode' | 'details' | 'offers' | 'payment' | 'success'

export function resolvePlaceFromCity(city: string, label?: string): PlaceResult {
  const hit = searchPlaces(city)[0]
  if (hit) return hit
  return {
    id: `city-${city}`,
    title: city,
    subtitle: label ?? city,
    city,
    district: '',
    lat: 39.93,
    lng: 32.86,
  }
}

export function placeToLocation(place: PlaceResult): PriceCalculationLocation {
  return {
    label: place.subtitle || `${place.district}, ${place.city}`,
    city: place.city,
    district: place.district,
    country: 'TR',
    placeId: place.id,
    lat: place.lat,
    lng: place.lng,
  }
}

export function placeToAddressDraft(place: PlaceResult): AddressDraft {
  return {
    label: place.subtitle || `${place.district}, ${place.city}`,
    line1: place.subtitle,
    district: place.district,
    city: place.city,
    lat: place.lat,
    lng: place.lng,
    placeId: place.id,
  }
}

export function locationToPlace(
  location: PriceCalculationLocation | AddressDraft
): PlaceResult {
  const city = location.city?.trim() || location.label.split(',').at(-1)?.trim() || location.label
  const district = location.district?.trim() || ''
  return {
    id: location.placeId ?? `${city}-${district}-${location.lat ?? 0}-${location.lng ?? 0}`,
    title: district || city,
    subtitle: location.label,
    city,
    district,
    lat: location.lat ?? 39.0,
    lng: location.lng ?? 35.0,
  }
}

export function isOrderReadyForOffers(draft: OrderDraft): boolean {
  if (!draft.origin || !draft.destination) return false
  if (draft.origin.id === draft.destination.id) return false
  if (!draft.service) return false

  if (draft.service === 'kargo') {
    const { cargo } = draft
    return (
      cargo.preset !== null &&
      cargo.widthCm > 0 &&
      cargo.lengthCm > 0 &&
      cargo.heightCm > 0 &&
      cargo.weightKg > 0 &&
      cargo.quantity > 0
    )
  }

  if (!draft.logisticsMode) return false

  if (draft.logisticsMode === 'ftl') {
    return (
      draft.ftl.rows.length > 0 &&
      draft.ftl.rows.every(
        (row) => Boolean(row.vehicleTypeId && row.bodyTypeId) && row.count > 0
      )
    )
  }

  const { ltl } = draft
  return (
    ltl.loadKind !== null &&
    ltl.widthCm > 0 &&
    ltl.lengthCm > 0 &&
    ltl.heightCm > 0 &&
    ltl.weightKg > 0 &&
    ltl.quantity > 0
  )
}

function cargoTypeLabel(draft: OrderDraft): string {
  if (draft.service === 'kargo') {
    if (draft.cargo.preset === 'zarf') return 'Evrak'
    return 'Paket'
  }
  if (draft.logisticsMode === 'ltl') {
    return findLoadKind(draft.ltl.loadKind)?.label ?? 'Palet'
  }
  return 'Komple araç'
}

export function piecesFromOrder(draft: OrderDraft): DraftPiece[] {
  if (draft.service === 'kargo') {
    const { cargo } = draft
    return [
      {
        id: 'siparis-cargo',
        type: cargoTypeLabel(draft),
        widthCm: cargo.widthCm,
        lengthCm: cargo.lengthCm,
        heightCm: cargo.heightCm,
        quantity: cargo.quantity,
        desi: calcPieceDesi(cargo.widthCm, cargo.lengthCm, cargo.heightCm),
        weightKg: cargo.weightKg,
      },
    ]
  }

  if (draft.logisticsMode === 'ltl') {
    const { ltl } = draft
    return [
      {
        id: 'siparis-ltl',
        type: cargoTypeLabel(draft),
        widthCm: ltl.widthCm,
        lengthCm: ltl.lengthCm,
        heightCm: ltl.heightCm,
        quantity: ltl.quantity,
        desi: calcPieceDesi(ltl.widthCm, ltl.lengthCm, ltl.heightCm),
        weightKg: ltl.weightKg,
      },
    ]
  }

  if (draft.logisticsMode === 'ftl') {
    const first = draft.ftl.rows[0]
    return [
      {
        id: 'siparis-ftl',
        type: 'Komple araç',
        widthCm: 120,
        lengthCm: 1360,
        heightCm: 270,
        quantity: first?.count ?? 1,
        desi: calcPieceDesi(120, 1360, 270),
        weightKg: 1000,
      },
    ]
  }

  return []
}

function firstCompleteFtlRow(draft: OrderDraft) {
  return draft.ftl.rows.find((row) => row.vehicleTypeId && row.bodyTypeId) ?? draft.ftl.rows[0]
}

export function orderToPricePatch(draft: OrderDraft): Partial<PriceCalculationDraft> {
  const ftlRow = firstCompleteFtlRow(draft)
  const vehicle = VEHICLE_TYPES.find((item) => item.id === ftlRow?.vehicleTypeId)
  const body = BODY_TYPES.find((item) => item.id === ftlRow?.bodyTypeId)

  return {
    operationType: draft.service === 'lojistik' ? 'logistics' : draft.service ? 'parcel' : null,
    origin: draft.origin ? placeToLocation(draft.origin) : null,
    destination: draft.destination ? placeToLocation(draft.destination) : null,
    logisticsSubtype: draft.service === 'lojistik' ? draft.logisticsMode : null,
    vehicleType: vehicle?.id ?? ftlRow?.vehicleTypeId ?? null,
    bodyType: body?.id ?? ftlRow?.bodyTypeId ?? null,
    loadType: draft.ltl.loadKind,
    weightKg:
      draft.service === 'kargo'
        ? draft.cargo.weightKg * draft.cargo.quantity
        : draft.logisticsMode === 'ltl'
          ? draft.ltl.weightKg * draft.ltl.quantity
          : null,
    pieces: piecesFromOrder(draft),
    courierSpeed: draft.deliverySpeed,
    siparis: draft,
  }
}

function highlightFromBadge(badge: string | undefined): QuoteHighlight[] {
  if (badge === 'En Hızlı') return ['fastest']
  if (badge === 'En Uygun') return ['best_price']
  if (badge === 'Önerilen') return ['recommended']
  return []
}

export function offerToSearchQuote(offer: Offer): SearchQuote {
  return {
    id: offer.id,
    providerName: offer.carrier,
    serviceName: offer.title,
    etaLabel: offer.etaLabel,
    pickupLabel: offer.perks[0] ?? 'Kapıdan kapıya',
    insuranceLabel: offer.perks.find((perk) => perk.toLocaleLowerCase('tr-TR').includes('sigorta')),
    priceTry: offer.price,
    priceState: 'ready',
    badges: highlightFromBadge(offer.badge),
    quoteSource: offer.quoteSource,
    vehicleLabel: offer.serviceLabel,
    hasInstantPrice: offer.quoteSource === 'instant',
    hasPickupService: true,
    serviceType: offer.serviceLabel,
  }
}

export function searchQuotesFromOrder(draft: OrderDraft): SearchQuote[] {
  if (!isOrderReadyForOffers(draft)) return []
  const breakdown = buildBreakdown(draft)
  if (!breakdown) return []
  return buildOffers(draft, breakdown).map(offerToSearchQuote)
}

export function matchQuoteForOffer<T extends { id: string; providerName: string; serviceName: string }>(
  offers: T[],
  selected: Offer | null
): T | undefined {
  if (!selected) return undefined
  return (
    offers.find((offer) => offer.id === selected.id) ??
    offers.find((offer) => offer.providerName === selected.carrier) ??
    offers.find((offer) => offer.serviceName === selected.title)
  )
}

export function offerToQuoteSummary(offer: Offer | null): {
  providerName: string | null
  serviceName: string | null
  priceTry: number | null
} {
  if (!offer) {
    return { providerName: null, serviceName: null, priceTry: null }
  }
  return {
    providerName: offer.carrier,
    serviceName: offer.title,
    priceTry: offer.price,
  }
}

export function orderToShipmentPatch(
  draft: OrderDraft,
  offer: Offer | null
): Partial<CreateShipmentDraft> {
  const patch: Partial<CreateShipmentDraft> = {
    operationType: draft.service === 'lojistik' ? 'logistics' : draft.service ? 'parcel' : null,
    origin: draft.origin ? placeToAddressDraft(draft.origin) : null,
    destination: draft.destination ? placeToAddressDraft(draft.destination) : null,
    pieces: piecesFromOrder(draft),
    courierSpeed: draft.deliverySpeed,
    siparis: draft,
  }
  if (!offer) return patch
  return { ...patch, ...offerToQuoteSummary(offer) }
}

function matchVehicleId(value: string | null | undefined): string | null {
  if (!value) return null
  const found = VEHICLE_TYPES.find(
    (item) => item.id === value || item.label.toLocaleLowerCase('tr-TR') === value.toLocaleLowerCase('tr-TR')
  )
  return found?.id ?? null
}

function matchBodyId(value: string | null | undefined): string | null {
  if (!value) return null
  const found = BODY_TYPES.find(
    (item) => item.id === value || item.label.toLocaleLowerCase('tr-TR') === value.toLocaleLowerCase('tr-TR')
  )
  return found?.id ?? null
}

function matchLoadKind(value: string | null | undefined) {
  if (!value) return null
  const found = LOAD_KINDS.find(
    (item) =>
      item.id === value ||
      item.label.toLocaleLowerCase('tr-TR') === value.toLocaleLowerCase('tr-TR') ||
      `${item.label}li`.toLocaleLowerCase('tr-TR') === value.toLocaleLowerCase('tr-TR')
  )
  return found?.id ?? null
}

export function reconstructOrderFromPriceDraft(draft: PriceCalculationDraft): OrderDraft {
  if (draft.siparis?.origin || draft.siparis?.service) {
    return {
      ...createInitialOrder(),
      ...draft.siparis,
    }
  }

  const order = createInitialOrder()
  order.origin = draft.origin ? locationToPlace(draft.origin) : null
  order.destination = draft.destination ? locationToPlace(draft.destination) : null
  order.service =
    draft.operationType === 'logistics' ? 'lojistik' : draft.operationType ? 'kargo' : null
  order.logisticsMode = draft.logisticsSubtype
  order.deliverySpeed = coerceDeliverySpeed(
    order.service,
    draft.courierSpeed ?? (order.service === 'lojistik' ? 'scheduled' : 'express')
  )

  const piece = draft.pieces[0]
  if (piece) {
    order.cargo = {
      preset: 'custom',
      widthCm: piece.widthCm,
      lengthCm: piece.lengthCm,
      heightCm: piece.heightCm,
      weightKg: piece.weightKg,
      quantity: piece.quantity,
      contentNote: '',
    }
    order.ltl = {
      ...order.ltl,
      loadKind: matchLoadKind(draft.loadType) ?? matchLoadKind(piece.type),
      widthCm: piece.widthCm,
      lengthCm: piece.lengthCm,
      heightCm: piece.heightCm,
      weightKg: piece.weightKg,
      quantity: piece.quantity,
    }
  }

  const vehicleId = matchVehicleId(draft.vehicleType)
  const bodyId = matchBodyId(draft.bodyType)
  if (vehicleId || bodyId) {
    order.ftl = {
      rows: [
        {
          id: 'veh-0',
          vehicleTypeId: vehicleId,
          bodyTypeId: bodyId,
          count: piece?.quantity ?? 1,
        },
      ],
    }
  }

  return order
}

export function reconstructOrderFromShipmentDraft(draft: CreateShipmentDraft): OrderDraft {
  if (draft.siparis?.origin || draft.siparis?.service) {
    return {
      ...createInitialOrder(),
      ...draft.siparis,
    }
  }

  const order = createInitialOrder()
  order.origin = draft.origin ? locationToPlace(draft.origin) : null
  order.destination = draft.destination ? locationToPlace(draft.destination) : null
  order.service =
    draft.operationType === 'logistics' ? 'lojistik' : draft.operationType ? 'kargo' : null
  order.deliverySpeed = coerceDeliverySpeed(
    order.service,
    draft.courierSpeed ?? (order.service === 'lojistik' ? 'scheduled' : 'express')
  )

  const piece = draft.pieces[0]
  if (piece) {
    order.cargo = {
      preset: 'custom',
      widthCm: piece.widthCm,
      lengthCm: piece.lengthCm,
      heightCm: piece.heightCm,
      weightKg: piece.weightKg,
      quantity: piece.quantity,
      contentNote: '',
    }
    order.ltl = {
      ...order.ltl,
      widthCm: piece.widthCm,
      lengthCm: piece.lengthCm,
      heightCm: piece.heightCm,
      weightKg: piece.weightKg,
      quantity: piece.quantity,
    }
  }

  return order
}

export function clampSiparisStep(
  step: string | null | undefined,
  fallback: SiparisStep = 'route',
  variant?: 'quote' | 'shipment'
): SiparisStep {
  const allowed: SiparisStep[] = ['route', 'service', 'mode', 'details', 'offers', 'payment', 'success']
  if (!step || !allowed.includes(step as SiparisStep)) return fallback
  const resolved = step as SiparisStep
  if (variant === 'quote' && (resolved === 'payment' || resolved === 'success')) return 'offers'
  return resolved
}

export function numericStepFromSiparis(step: SiparisStep): CreateShipmentDraft['step'] {
  if (step === 'route') return 2
  if (step === 'service' || step === 'mode') return 1
  if (step === 'details') return 3
  if (step === 'offers') return 4
  return 5
}

export function shipmentMissingFromOrder(
  draft: CreateShipmentDraft,
  order: OrderDraft,
  offerSelected: boolean
): string[] {
  const missing: string[] = []
  if (!order.origin) missing.push('Çıkış adresi')
  if (!order.destination) missing.push('Varış adresi')
  if (!order.service) missing.push('Hizmet tipi')
  if (order.service === 'lojistik' && !order.logisticsMode) missing.push('Taşıma opsiyonu')
  if (!isOrderReadyForOffers(order)) missing.push('Gönderi detayları')
  if (!offerSelected && (!draft.providerName || !draft.serviceName || draft.priceTry == null)) {
    missing.push('Teklif')
  }
  if (!draft.paymentMethod) missing.push('Ödeme yöntemi')
  if (draft.paymentMethod === 'card' && !draft.cardPayment) missing.push('Kart ödemesi')
  return missing
}

export { createInitialOrder }
export type { Offer, OrderDraft, PlaceResult }
