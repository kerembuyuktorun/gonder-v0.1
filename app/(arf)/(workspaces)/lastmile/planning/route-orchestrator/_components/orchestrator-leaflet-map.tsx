'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression, LatLngTuple } from 'leaflet'
import { cn } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'
import {
  createLastmileMapMarkerIcon,
  getMapMarkerTooltipOffset,
  getMapPointKindLabel,
  getMapToneColor,
  type OsmMapKind,
  type OsmMapMarkerState,
  type OsmMapTone,
} from '../../../_lib/osm-map-markers'
import type { VehicleOperationalStatus } from '../../../resources/vehicles/_types/vehicle'
import type { LatLng } from '../_types/orchestrator'

export type OrchestratorMapPointKind =
  | 'facility'
  | 'pickup'
  | 'delivery'
  | 'vehicle'
  | 'stop'

export type OrchestratorMapPoint = {
  id: string
  lat: number
  lng: number
  kind: OrchestratorMapPointKind
  label?: string
  title?: string
  selected?: boolean
  color?: string
  dimmed?: boolean
  /** Araç operasyonel durumu: boşta / aktif rotada / pasif */
  vehicleStatus?: VehicleOperationalStatus
  /** Araç noktalarında tıklama → aktif rota eşlemesi */
  vehicleId?: string
  /** Sipariş pin’lerinde tıklama → havuz seçimi */
  orderId?: string
}

export type OrchestratorMapRoute = {
  id: string
  color: string
  polyline: LatLng[]
  emphasized?: boolean
}

function isValid(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  )
}

function toOsmKind(kind: OrchestratorMapPointKind): OsmMapKind {
  switch (kind) {
    case 'facility':
      return 'facility'
    case 'pickup':
      return 'pickup'
    case 'delivery':
      return 'home'
    case 'vehicle':
      return 'courier'
    case 'stop':
      return 'stop'
  }
}

function resolveMarkerAppearance(point: OrchestratorMapPoint): {
  kind: OsmMapKind
  tone: OsmMapTone
  state: OsmMapMarkerState
  pulse: boolean
  statusLabel: string
  statusClass: string
} {
  const kind = toOsmKind(point.kind)

  if (point.kind === 'vehicle') {
    const status = point.vehicleStatus ?? 'pasif'
    const selected = point.selected ?? false

    if (selected) {
      return {
        kind,
        tone: status === 'yolda' ? 'emerald' : 'sky',
        state: 'selected',
        pulse: status === 'yolda',
        statusLabel: 'Seçili',
        statusClass: 'lm-tip-status-selected',
      }
    }

    if (status === 'yolda') {
      return {
        kind,
        tone: point.dimmed ? 'muted' : 'emerald',
        state: point.dimmed ? 'passive' : 'active',
        pulse: !point.dimmed,
        statusLabel: 'Aktif Rotada',
        statusClass: 'lm-tip-status-on-route',
      }
    }
    if (status === 'bos_ta') {
      return {
        kind,
        tone: point.dimmed ? 'muted' : 'sky',
        state: point.dimmed ? 'passive' : 'active',
        pulse: false,
        statusLabel: 'Boşta',
        statusClass: 'lm-tip-status-idle',
      }
    }
    return {
      kind,
      tone: 'muted',
      state: 'passive',
      pulse: false,
      statusLabel: 'Pasif',
      statusClass: 'lm-tip-status-passive',
    }
  }

  if (point.kind === 'pickup' || point.kind === 'delivery') {
    const selected = point.selected ?? false
    const dimmed = point.dimmed ?? false
    const accent: OsmMapTone = point.kind === 'pickup' ? 'sky' : 'emerald'

    if (selected) {
      return {
        kind,
        tone: accent,
        state: 'selected',
        pulse: false,
        statusLabel: 'Seçili',
        statusClass: 'lm-tip-status-selected',
      }
    }

    if (dimmed) {
      return {
        kind,
        tone: 'muted',
        state: 'passive',
        pulse: false,
        statusLabel: 'Pasif',
        statusClass: 'lm-tip-status-passive',
      }
    }

    return {
      kind,
      tone: accent,
      state: 'active',
      pulse: false,
      statusLabel: 'Aktif',
      statusClass: 'lm-tip-status-active',
    }
  }

  if (point.kind === 'stop') {
    const active = !(point.dimmed ?? false)
    return {
      kind,
      tone: active ? 'sky' : 'muted',
      state: active ? 'active' : 'passive',
      pulse: false,
      statusLabel: active ? 'Bekleyen' : 'Tamamlandı',
      statusClass: active ? 'lm-tip-status-active' : 'lm-tip-status-passive',
    }
  }

  // facility
  return {
    kind,
    tone: 'sky',
    state: 'active',
    pulse: false,
    statusLabel: 'Merkez',
    statusClass: 'lm-tip-status-selected',
  }
}

function markerIcon(point: OrchestratorMapPoint) {
  const { kind, tone, state, pulse } = resolveMarkerAppearance(point)
  return createLastmileMapMarkerIcon(kind, tone, point.label, { pulse, state })
}

function MapPointTooltipContent({ point }: { point: OrchestratorMapPoint }) {
  const appearance = resolveMarkerAppearance(point)
  const kindLabel = getMapPointKindLabel(appearance.kind)
  const toneColor = getMapToneColor(
    appearance.state === 'passive' ? 'muted' : appearance.tone
  )

  return (
    <div className='lm-tip'>
      <div className='lm-tip-meta'>
        <span className='lm-tip-kind'>
          <span className='lm-tip-dot' style={{ background: toneColor }} />
          {kindLabel}
        </span>
        <span className={cn('lm-tip-status', appearance.statusClass)}>
          {appearance.statusLabel}
        </span>
      </div>
      {point.title ? <p className='lm-tip-title'>{point.title}</p> : null}
    </div>
  )
}

function FitBounds({
  positions,
  focusKey,
}: {
  positions: LatLngTuple[]
  focusKey: string
}) {
  const map = useMap()

  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 13)
      return
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [56, 56], maxZoom: 14 })
  }, [map, positions, focusKey])

  return null
}

function InvalidateSize() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const targets: Element[] = [container]
    if (container.parentElement) {
      targets.push(container.parentElement)
    }

    let raf = 0
    const syncSize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        map.invalidateSize({ animate: false, pan: false })
      })
    }

    const observer = new ResizeObserver(syncSize)
    for (const target of targets) {
      observer.observe(target)
    }

    syncSize()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [map])

  return null
}

/** Leaflet panes hazır olmadan marker/tooltip eklenmesini engeller */
function MapLayersGate({ children }: { children: ReactNode }) {
  const map = useMap()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    return () => setReady(false)
  }, [map])

  if (!ready) return null
  return <>{children}</>
}

type Props = {
  points: OrchestratorMapPoint[]
  routes: OrchestratorMapRoute[]
  className?: string
  emphasizeRouteId?: string | null
  onPointClick?: (point: OrchestratorMapPoint) => void
}

export function OrchestratorLeafletMap({
  points,
  routes,
  className,
  emphasizeRouteId = null,
  onPointClick,
}: Props) {
  const validPoints = useMemo(
    () => points.filter((p) => isValid(p.lat, p.lng)),
    [points]
  )

  const validRoutes = useMemo(
    () =>
      routes
        .map((route) => ({
          ...route,
          polyline: route.polyline.filter((p) => isValid(p.lat, p.lng)),
        }))
        .filter((route) => route.polyline.length >= 2),
    [routes]
  )

  const fitPositions = useMemo(() => {
    const coords: LatLngTuple[] = validPoints.map((p) => [p.lat, p.lng])
    for (const route of validRoutes) {
      if (emphasizeRouteId && route.id !== emphasizeRouteId) continue
      for (const p of route.polyline) coords.push([p.lat, p.lng])
    }
    return coords
  }, [validPoints, validRoutes, emphasizeRouteId])

  const center: LatLngExpression = fitPositions[0] ?? [41.015, 28.98]
  const focusKey = `${emphasizeRouteId ?? 'all'}:${fitPositions.length}`

  // Seçili / aktif noktalar üstte kalsın
  const sortedPoints = useMemo(() => {
    return [...validPoints].sort((a, b) => {
      const score = (p: OrchestratorMapPoint) => {
        if (p.selected) return 5
        if (p.kind === 'vehicle' && p.vehicleStatus === 'yolda') return 4
        if (p.kind === 'vehicle' && p.vehicleStatus === 'bos_ta') return 3
        if (p.kind === 'vehicle') return 2
        if (p.dimmed) return 0
        return 1
      }
      return score(a) - score(b)
    })
  }, [validPoints])

  return (
    <MapContainer
      center={center}
      zoom={12}
      className={cn('h-full min-h-[280px] w-full', className)}
      scrollWheelZoom
      attributionControl={false}
      zoomControl={false}
    >
      <TileLayer
        url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        subdomains={['a', 'b', 'c', 'd']}
        maxZoom={20}
      />
      <FitBounds positions={fitPositions} focusKey={focusKey} />
      <InvalidateSize />

      <MapLayersGate>
        {validRoutes.map((route) => {
          const emphasized =
            emphasizeRouteId == null ||
            route.id === emphasizeRouteId ||
            route.emphasized
          return (
            <Polyline
              key={route.id}
              positions={route.polyline.map((p) => [p.lat, p.lng] as LatLngTuple)}
              pathOptions={{
                color: route.color,
                weight: emphasized ? 4.5 : 2.5,
                opacity: emphasized ? 0.9 : 0.28,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )
        })}

        {sortedPoints.map((point) => {
          const osmKind = toOsmKind(point.kind)
          const clickable =
            Boolean(onPointClick) &&
            ((point.kind === 'vehicle' &&
              point.vehicleId != null &&
              (point.vehicleStatus === 'yolda' ||
                point.vehicleStatus === 'bos_ta')) ||
              ((point.kind === 'pickup' || point.kind === 'delivery') &&
                point.orderId != null))
          return (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={markerIcon(point)}
              eventHandlers={
                clickable
                  ? {
                      click: (event) => {
                        L.DomEvent.stopPropagation(event)
                        onPointClick?.(point)
                      },
                    }
                  : undefined
              }
              zIndexOffset={
                point.selected
                  ? 700
                  : point.vehicleStatus === 'yolda'
                    ? 600
                    : point.vehicleStatus === 'bos_ta'
                      ? 500
                      : point.dimmed || point.vehicleStatus === 'pasif'
                        ? 100
                        : 300
              }
            >
              <Tooltip
                direction='top'
                offset={[0, getMapMarkerTooltipOffset(osmKind)]}
                opacity={1}
                className='lastmile-map-tooltip'
              >
                <MapPointTooltipContent point={point} />
              </Tooltip>
            </Marker>
          )
        })}
      </MapLayersGate>
    </MapContainer>
  )
}
