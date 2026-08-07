/**
 * Rota detay — sipariş / hareket / not mock’ları.
 */

import { mockOrderList } from '../../../orders/_mock/orders-mock-data'
import type { LastmileOrder } from '../../../orders/_types/order'
import type { OrderAuditLogItem } from '../../../orders/[id]/_types/order-detail'
import type { RouteNoteItem } from '../_types/planning-route-detail'
import type { OrchestratorActiveRoute, OrchestratorOrder } from '../../route-orchestrator/_types/orchestrator'
import { PLANNING_ROUTES_LIST_MOCK } from './routes-mock-data'

function cloneAsRouteOrder(
  template: LastmileOrder,
  orderId: string,
  route: OrchestratorActiveRoute,
  index: number
): OrchestratorOrder {
  const stop = route.stops.find((item) => item.orderIds.includes(orderId))
  const position = stop?.position ?? route.position

  return {
    ...template,
    id: orderId,
    takip_no: `ARF-${4100 + index}`,
    referans_no: `ORD-${route.label}-${index + 1}`,
    durum: route.status === 'tamamlandi' ? 'teslim_edildi' : route.status === 'aktif' ? 'yolda' : 'planlandi',
    durum_etiketi: null,
    rota_atandi: true,
    rota_kodu: route.label,
    atanan_arac: route.vehiclePlate,
    atanan_kurye: route.courierName,
    alis_noktasi: stop?.kind === 'pickup' ? stop.locationLabel ?? template.alis_noktasi : template.alis_noktasi,
    varis_noktasi:
      stop?.kind === 'delivery' ? stop.locationLabel ?? template.varis_noktasi : template.varis_noktasi,
    alis_acik_adres: stop?.openAddress ?? template.alis_acik_adres,
    varis_acik_adres: stop?.openAddress ?? template.varis_acik_adres,
    pickup: position,
    delivery: position,
  }
}

/** Rotadaki orderIds için liste + orkestratör uyumlu siparişler */
export function getPlanningRouteMockOrders(route: OrchestratorActiveRoute): OrchestratorOrder[] {
  const templates = mockOrderList
  return route.orderIds.map((orderId, index) => {
    const template = templates[index % templates.length]!
    return cloneAsRouteOrder(template, orderId, route, index)
  })
}

export function getPlanningRouteListExtras(routeId: string) {
  return PLANNING_ROUTES_LIST_MOCK.find((item) => item.id === routeId) ?? null
}

export function getPlanningRouteMockMovements(route: OrchestratorActiveRoute): OrderAuditLogItem[] {
  const day = route.operationDate.slice(0, 10)
  return [
    {
      id: `${route.id}-mv-1`,
      timestamp: `${day} 06:12`,
      actor: 'Ayşe Dispatcher',
      action: 'Rota oluşturuldu',
      actionType: 'ROUTE_CREATED',
      sourceLabel: 'ROUTE',
      itemCode: route.label,
      location: route.region,
      ip: '10.0.0.12',
    },
    {
      id: `${route.id}-mv-2`,
      timestamp: `${day} 06:18`,
      actor: 'Sistem',
      action: 'Optimizasyon uygulandı',
      actionType: 'ROUTE_OPTIMIZED',
      sourceLabel: 'ROUTE',
      itemCode: route.label,
      location: '—',
      ip: '—',
    },
    {
      id: `${route.id}-mv-3`,
      timestamp: `${day} 07:05`,
      actor: 'Ayşe Dispatcher',
      action: 'Kurye ve araç atandı',
      actionType: 'ROUTE_ASSIGNED',
      sourceLabel: 'ROUTE',
      itemCode: route.vehiclePlate,
      location: route.courierName ?? '—',
      ip: '10.0.0.12',
    },
    ...(route.status === 'aktif' || route.status === 'tamamlandi'
      ? [
          {
            id: `${route.id}-mv-4`,
            timestamp: `${day} 08:32`,
            actor: route.courierName ?? 'Kurye',
            action: 'Rota başlatıldı',
            actionType: 'ROUTE_STARTED',
            sourceLabel: 'ROUTE',
            itemCode: route.label,
            location: 'Park çıkışı',
            ip: '176.33.12.4',
          },
          {
            id: `${route.id}-mv-5`,
            timestamp: `${day} 09:20`,
            actor: route.courierName ?? 'Kurye',
            action: 'Paket teslim alındı',
            actionType: 'PACKAGE_PICKED_UP',
            sourceLabel: 'TRIP_LEG',
            itemCode: route.orderIds[0] ?? '—',
            location: 'Alım durağı',
            ip: '176.33.12.4',
          },
        ]
      : []),
    ...(route.status === 'tamamlandi'
      ? [
          {
            id: `${route.id}-mv-6`,
            timestamp: `${day} 14:10`,
            actor: route.courierName ?? 'Kurye',
            action: 'Rota tamamlandı',
            actionType: 'ROUTE_COMPLETED',
            sourceLabel: 'ROUTE',
            itemCode: route.label,
            location: 'Park dönüşü',
            ip: '176.33.12.4',
          },
        ]
      : []),
  ]
}

export function getPlanningRouteMockOpsNotes(
  route: OrchestratorActiveRoute
): RouteNoteItem[] {
  const day = route.operationDate.slice(0, 10)
  return [
    {
      id: `${route.id}-note-1`,
      note: 'Sabah trafiğine göre ilk iki alım yer değiştirilebilir.',
      authorName: 'Ayşe Dispatcher',
      createdUserId: null,
      createdAt: `${day}T06:40:00`,
      visibility: 'everyone',
    },
    {
      id: `${route.id}-note-2`,
      note: 'Park çıkışı Kadıköy tarafında; dönüşte aynı park kullanılacak.',
      authorName: 'Mehmet Planlama',
      createdUserId: null,
      createdAt: `${day}T07:10:00`,
      visibility: 'dispatcher',
    },
  ]
}
