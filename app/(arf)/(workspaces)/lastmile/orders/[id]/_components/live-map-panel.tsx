'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { fetchLiveTracking } from '../_api/order-detail'
import type { OrderDetail } from '../_types/order-detail'
import type { OsmMapKind, OsmMapPoint } from './order-osm-map'

const POLL_MS = 12_000

const OrderOsmMap = dynamic(
  () => import('./order-osm-map').then((mod) => mod.OrderOsmMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center gap-2 bg-slate-50 text-sm text-slate-500 lg:h-[360px]">
        <Loader2 className="size-4 animate-spin" />
        Harita yükleniyor…
      </div>
    ),
  }
)

type LiveMapPanelProps = {
  order: OrderDetail
  active?: boolean
  onOrderPatch?: (updater: (prev: OrderDetail) => OrderDetail) => void
}

/**
 * OpenStreetMap (Leaflet) — tesis/ev/kurye pinleri + polyline.
 * Aktif sekmede ve yolda iken live-tracking poll eder.
 */
export function LiveMapPanel({ order, active = true, onOrderPatch }: LiveMapPanelProps) {
  const orderRef = useRef(order)
  orderRef.current = order

  useEffect(() => {
    if (!active || !onOrderPatch) return
    if (order.durum !== 'yolda') return
    if (!order.rota.rota_id && !order.atanan_kurye) return

    let cancelled = false

    const tick = async () => {
      const result = await fetchLiveTracking(orderRef.current.id)
      if (cancelled || !result.success) return

      const last = result.data.courierLastPosition
      const lat = last?.latitude
      const lng = last?.longitude
      if (typeof lat !== 'number' || typeof lng !== 'number') return

      onOrderPatch((prev) => {
        if (prev.rota.kurye_lat === lat && prev.rota.kurye_lng === lng) return prev
        return {
          ...prev,
          rota: {
            ...prev.rota,
            kurye_lat: lat,
            kurye_lng: lng,
          },
        }
      })
    }

    void tick()
    const timer = window.setInterval(() => {
      void tick()
    }, POLL_MS)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [active, onOrderPatch, order.durum, order.rota.rota_id, order.atanan_kurye, order.id])

  const points: OsmMapPoint[] = [
    {
      id: 'pickup',
      kind: 'facility',
      tone: 'sky',
      lat: order.alis.lat,
      lng: order.alis.lng,
      title: `Alış · ${order.alis.baslik}`,
    },
    ...order.rota.ara_duraklar.map((w) => ({
      id: w.id,
      kind: 'stop' as const,
      tone: 'muted' as const,
      label: w.label,
      lat: w.lat,
      lng: w.lng,
      title: `Ara durak · ${w.label}`,
    })),
    {
      id: 'dropoff',
      kind: 'home',
      tone: 'emerald',
      lat: order.varis.lat,
      lng: order.varis.lng,
      title: `Varış · ${order.varis.baslik}`,
    },
  ]

  if (order.rota.kurye_lat != null && order.rota.kurye_lng != null) {
    points.push({
      id: 'courier',
      kind: 'courier',
      tone: 'amber',
      lat: order.rota.kurye_lat,
      lng: order.rota.kurye_lng,
      title: order.rota.kurye_adi ? `Kurye · ${order.rota.kurye_adi}` : 'Kurye',
    })
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <OrderOsmMap points={points} polyline={order.rota.polyline} active={active} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Legend kind="facility" label="Alış" />
          <Legend kind="home" label="Varış" />
          <Legend kind="courier" label="Kurye" />
          <Legend kind="stop" label="Ara durak" />
          {order.durum === 'yolda' && active ? (
            <span className="ml-1 text-xs text-slate-400">Canlı ~{POLL_MS / 1000} sn</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function Legend({ kind, label }: { kind: OsmMapKind; label: string }) {
  const tone =
    kind === 'facility'
      ? { ink: 'text-sky-700', ring: 'ring-sky-200', soft: 'bg-sky-50' }
      : kind === 'home'
        ? { ink: 'text-emerald-700', ring: 'ring-emerald-200', soft: 'bg-emerald-50' }
        : kind === 'courier'
          ? { ink: 'text-amber-700', ring: 'ring-amber-200', soft: 'bg-amber-50' }
          : { ink: 'text-slate-600', ring: 'ring-slate-200', soft: 'bg-slate-50' }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${tone.soft} px-2.5 py-1 text-[11px] font-medium ${tone.ink} ring-1 ${tone.ring}`}
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
        {kind === 'facility' ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20V9.2L12 4l8 5.2V20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9.5 20v-5.5h5V20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        ) : kind === 'home' ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 11.2 12 4.2l8 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M6.8 10.5V19.5h10.4v-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        ) : kind === 'courier' ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3.5 10h10.5v7.5H3.5V10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M14 11h3.2L20.5 15v2.5H14V11z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <circle cx="7" cy="18.8" r="1.4" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="17.5" cy="18.8" r="1.4" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        ) : (
          <span className="size-1.5 rounded-full bg-slate-400" />
        )}
      </span>
      {label}
    </span>
  )
}
