'use client'

import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../_shared/routes'
import { ordersRepository } from '../_data/orders-repository'
import { useCreateShipmentStore } from '../_stores/create-shipment-draft-store'
import { usePriceDraftStore } from '../_stores/price-calculation-draft-store'
import type { GonderOrder, GonderOrderDetail, OrderStatus } from '../_types/orders'
import {
  createInitialOrder,
  isOrderReadyForOffers,
  orderToPricePatch,
  orderToShipmentPatch,
  resolvePlaceFromCity,
  type OrderDraft,
  type PlaceResult,
} from './siparis-draft-map'

const BLOCKED_ORDER_STATUSES = new Set<OrderStatus>([
  'cancelled',
  'rejected',
  'completed',
  'shipment_created',
])

function destinationFromOrder(order: GonderOrder | GonderOrderDetail): PlaceResult {
  const detail = order as GonderOrderDetail
  const address = detail.shippingAddress
  const resolved = resolvePlaceFromCity(
    order.destinationCity,
    `${order.destinationCity} varış · ${order.customerName}`
  )
  if (!address) return resolved
  return {
    ...resolved,
    title: address.district || address.city || resolved.title,
    subtitle:
      [address.line1, address.district, address.city].filter(Boolean).join(', ') || resolved.subtitle,
    city: address.city || order.destinationCity,
    district: address.district || resolved.district,
  }
}

export function orderToSiparisDraft(order: GonderOrder | GonderOrderDetail): OrderDraft {
  const detail = order as GonderOrderDetail
  const draft = createInitialOrder()
  draft.service = 'kargo'
  draft.deliverySpeed = 'express'
  draft.origin = resolvePlaceFromCity(order.originCity, `${order.originCity} çıkış`)
  draft.destination = destinationFromOrder(order)
  draft.cargo = {
    preset: 'orta',
    widthCm: 30,
    lengthCm: 40,
    heightCm: 20,
    weightKg: 2,
    quantity: Math.max(1, order.pieceCount),
    contentNote: `${order.orderNumber} · ${order.customerName}`,
  }
  draft.contact = {
    name: order.customerName,
    phone: detail.customerPhone ?? detail.shippingAddress?.phone ?? '',
    email: detail.customerEmail ?? '',
    company: '',
  }
  return draft
}

export function mergeOrdersForCargo(orders: Array<GonderOrder | GonderOrderDetail>): {
  ok: true
  draft: OrderDraft
  orderIds: string[]
} | {
  ok: false
  message: string
} {
  if (!orders.length) {
    return { ok: false, message: 'Sipariş seçilmedi' }
  }

  const eligible = orders.filter(
    (order) => !order.shipmentId && !BLOCKED_ORDER_STATUSES.has(order.status)
  )
  if (!eligible.length) {
    return {
      ok: false,
      message: 'Seçilen siparişler kargoya dönüştürülemez (iptal, tamamlanmış veya gönderisi var).',
    }
  }

  const origin = eligible[0]!.originCity
  const destination = eligible[0]!.destinationCity
  const mixed = eligible.some(
    (order) => order.originCity !== origin || order.destinationCity !== destination
  )
  if (mixed) {
    return {
      ok: false,
      message:
        'Seçilen siparişlerin çıkış ve varış adresleri aynı olmalı. Farklı rotalar için ayrı kargo oluşturun.',
    }
  }

  const draft = orderToSiparisDraft(eligible[0]!)
  draft.cargo.quantity = eligible.reduce((sum, order) => sum + Math.max(1, order.pieceCount), 0)
  draft.cargo.contentNote = eligible.map((order) => order.orderNumber).join(', ')
  if (!isOrderReadyForOffers(draft)) {
    return { ok: false, message: 'Sipariş bilgilerinden teklif taslağı oluşturulamadı' }
  }

  return { ok: true, draft, orderIds: eligible.map((order) => order.id) }
}

export async function startCargoQuoteFromOrderIds(
  orderIds: string[],
  navigate: (href: string) => void
): Promise<boolean> {
  if (!orderIds.length) {
    toast.message('Kargo oluşturmak için sipariş seçin')
    return false
  }

  const details = (
    await Promise.all(orderIds.map((id) => ordersRepository.getById(id)))
  ).filter((item): item is GonderOrderDetail => Boolean(item))

  const merged = mergeOrdersForCargo(details)
  if (!merged.ok) {
    toast.error(merged.message)
    return false
  }

  usePriceDraftStore.getState().patchDraft({
    ...orderToPricePatch(merged.draft),
    siparisStep: 'offers',
    selectedOffer: null,
    selectedQuoteId: null,
    mode: 'quote',
  })

  useCreateShipmentStore.getState().hydrateFromSources({
    source: 'order',
    orderId: merged.orderIds[0] ?? null,
    linkedOrderIds: merged.orderIds,
    quoteId: null,
    quoteRequestId: null,
    ...orderToShipmentPatch(merged.draft, null),
    siparisStep: 'offers',
    selectedOffer: null,
    note: merged.draft.cargo.contentNote,
  })

  if (merged.orderIds.length) {
    await ordersRepository.bulkUpdateStatus(merged.orderIds, 'quote_pending')
  }

  toast.success(
    merged.orderIds.length > 1
      ? `${merged.orderIds.length} sipariş için teklifler hazır`
      : 'Sipariş için teklifler hazır'
  )
  navigate(ARF_ROUTES.gonder.results)
  return true
}
