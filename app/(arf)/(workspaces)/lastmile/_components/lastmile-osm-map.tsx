'use client'

import { useEffect, useMemo } from 'react'
import {
  AttributionControl,
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
  type OsmMapKind,
  type OsmMapTone,
} from '../_lib/osm-map-markers'

export type { OsmMapKind, OsmMapTone } from '../_lib/osm-map-markers'
export { createLastmileMapMarkerIcon, getMapMarkerTooltipOffset } from '../_lib/osm-map-markers'

export type OsmMapPoint = {
  id: string
  lat: number
  lng: number
  kind: OsmMapKind
  tone?: OsmMapTone
  /** Ara durak sıra no vb. — harf pin değil */
  label?: string
  title?: string
}

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

function resolveCssColor(variable: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  return value || fallback
}

function useThemeSecondaryColor() {
  return useMemo(
    () => resolveCssColor('--secondary', 'oklch(0.3717 0.0392 257.2870)'),
    []
  )
}

export function isValidMapCoord(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  )
}

function markerIcon(kind: OsmMapKind, tone?: OsmMapTone, label?: string) {
  return createLastmileMapMarkerIcon(kind, tone, label)
}

function toneOffset(kind: OsmMapKind) {
  return getMapMarkerTooltipOffset(kind)
}

function FitBounds({ positions, zoom }: { positions: LatLngTuple[]; zoom?: number }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], zoom ?? 14)
      return
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 15 })
  }, [map, positions, zoom])

  return null
}

function InvalidateOnActive({ active }: { active: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => {
      map.invalidateSize()
    }, 80)
    return () => window.clearTimeout(timer)
  }, [active, map])

  return null
}

function PanToPoint({
  lat,
  lng,
  enabled,
}: {
  lat: number | null
  lng: number | null
  enabled: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (!enabled || lat == null || lng == null) return
    if (!isValidMapCoord(lat, lng)) return
    map.panTo([lat, lng], { animate: true, duration: 0.6 })
  }, [enabled, lat, lng, map])

  return null
}

function VoyagerTileLayer() {
  return (
    <TileLayer
      attribution={CARTO_ATTRIBUTION}
      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      subdomains={['a', 'b', 'c', 'd']}
      maxZoom={20}
    />
  )
}

type LastmilePointMapProps = {
  latitude: number
  longitude: number
  kind?: Extract<OsmMapKind, 'facility' | 'home'>
  tone?: Extract<OsmMapTone, 'sky' | 'emerald'>
  title?: string
  active?: boolean
  className?: string
  zoom?: number
}

/** Tek nokta — sipariş oluşturma adres önizlemesi */
export function LastmilePointMap({
  latitude,
  longitude,
  kind = 'home',
  tone,
  title,
  active = true,
  className,
  zoom = 15,
}: LastmilePointMapProps) {
  if (!isValidMapCoord(latitude, longitude)) {
    return (
      <div
        className={cn(
          'flex h-48 items-center justify-center bg-slate-50 text-sm text-slate-500 sm:h-56',
          className
        )}
      >
        Harita için konum bilgisi yok
      </div>
    )
  }

  const position: LatLngTuple = [latitude, longitude]
  const resolvedTone = tone ?? (kind === 'facility' ? 'sky' : 'emerald')

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      className={cn('h-48 w-full sm:h-56', className)}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <AttributionControl prefix={false} position="bottomright" />
      <VoyagerTileLayer />
      <FitBounds positions={[position]} zoom={zoom} />
      <InvalidateOnActive active={active} />
      <PanToPoint lat={latitude} lng={longitude} enabled={active} />
      <Marker position={position} icon={markerIcon(kind, resolvedTone)}>
        {title ? (
          <Tooltip
            direction="top"
            offset={[0, toneOffset(kind)]}
            opacity={1}
            className="lastmile-map-tooltip"
          >
            {title}
          </Tooltip>
        ) : null}
      </Marker>
    </MapContainer>
  )
}

type LastmileOsmMapProps = {
  points: OsmMapPoint[]
  polyline: Array<{ lat: number; lng: number }>
  active?: boolean
  className?: string
}

/** Çok nokta — sipariş detay haritası */
export function LastmileOsmMap({
  points,
  polyline,
  active = true,
  className,
}: LastmileOsmMapProps) {
  const secondaryColor = useThemeSecondaryColor()

  const validPoints = useMemo(
    () => points.filter((p) => isValidMapCoord(p.lat, p.lng)),
    [points]
  )

  const routeLine = useMemo(() => {
    const fromPoly = polyline.filter((p) => isValidMapCoord(p.lat, p.lng))
    // Gerçek rota geometrisi; 2–3 noktalı düz A→B çizgisi çizilmez
    return fromPoly.length >= 5 ? fromPoly : []
  }, [polyline])

  const fitPositions = useMemo(() => {
    const coords: LatLngTuple[] = []
    for (const p of validPoints) {
      if (p.id === 'courier') continue
      coords.push([p.lat, p.lng])
    }
    for (const p of routeLine) {
      coords.push([p.lat, p.lng])
    }
    return coords
  }, [validPoints, routeLine])

  const courier = validPoints.find((p) => p.id === 'courier')
  const center: LatLngExpression =
    fitPositions[0] ?? (courier ? [courier.lat, courier.lng] : [41.015, 28.98])

  if (validPoints.length === 0 && routeLine.length === 0) {
    return (
      <div
        className={cn(
          'flex h-[280px] items-center justify-center bg-slate-50 text-sm text-slate-500 lg:h-[360px]',
          className
        )}
      >
        Harita için konum bilgisi yok
      </div>
    )
  }

  const linePositions: LatLngExpression[] = routeLine.map((p) => [p.lat, p.lng])

  return (
    <MapContainer
      center={center}
      zoom={12}
      className={cn('h-[280px] w-full lg:h-[360px]', className)}
      scrollWheelZoom
      attributionControl={false}
    >
      <AttributionControl prefix={false} position="bottomright" />
      <VoyagerTileLayer />
      <FitBounds positions={fitPositions} />
      <InvalidateOnActive active={active} />
      <PanToPoint
        lat={courier?.lat ?? null}
        lng={courier?.lng ?? null}
        enabled={Boolean(courier) && active}
      />
      {linePositions.length >= 2 ? (
        <Polyline
          positions={linePositions}
          pathOptions={{
            color: secondaryColor,
            weight: 3.5,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      ) : null}
      {validPoints.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={markerIcon(point.kind, point.tone, point.label)}
        >
          {point.title ? (
            <Tooltip
              direction="top"
              offset={[0, toneOffset(point.kind)]}
              opacity={1}
              className="lastmile-map-tooltip"
            >
              {point.title}
            </Tooltip>
          ) : null}
        </Marker>
      ))}
    </MapContainer>
  )
}
