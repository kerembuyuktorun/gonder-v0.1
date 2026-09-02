'use client'

import { Clock, Route } from 'lucide-react'
import { estimateDriveHours, roadDistanceKm } from '../_lib/address-search'
import type { PlaceResult } from '../_lib/order-types'

const VIEW_W = 400
const VIEW_H = 190

// Türkiye sınırlarını kapsayan projeksiyon aralığı
const LNG_MIN = 25.4
const LNG_MAX = 45.0
const LAT_MIN = 35.6
const LAT_MAX = 42.3

/** Basitleştirilmiş Türkiye silüeti — saat yönünde [lng, lat] */
const OUTLINE: Array<[number, number]> = [
  [27.0, 41.7],
  [29.0, 41.2],
  [30.3, 41.2],
  [31.4, 41.3],
  [32.3, 41.9],
  [33.8, 42.0],
  [35.0, 42.1],
  [36.3, 41.3],
  [37.8, 41.0],
  [39.7, 41.0],
  [41.0, 41.4],
  [41.55, 41.5],
  [42.8, 41.2],
  [43.5, 40.9],
  [43.7, 40.1],
  [44.8, 39.7],
  [44.4, 38.4],
  [44.3, 37.9],
  [44.8, 37.3],
  [43.5, 37.3],
  [42.3, 37.2],
  [41.2, 37.1],
  [40.2, 37.1],
  [39.0, 36.7],
  [38.2, 36.9],
  [37.5, 36.7],
  [36.9, 36.7],
  [36.6, 36.2],
  [36.15, 35.9],
  [36.17, 36.6],
  [35.5, 36.6],
  [34.9, 36.75],
  [34.6, 36.8],
  [34.0, 36.35],
  [32.85, 36.0],
  [32.0, 36.5],
  [30.7, 36.85],
  [30.5, 36.3],
  [29.6, 36.2],
  [29.1, 36.6],
  [28.3, 36.75],
  [27.4, 36.7],
  [27.5, 37.1],
  [27.3, 37.3],
  [26.9, 37.7],
  [26.3, 38.3],
  [26.9, 38.8],
  [26.7, 39.3],
  [26.0, 39.5],
  [26.2, 40.1],
  [26.7, 40.4],
  [26.1, 40.6],
  [26.3, 41.2],
]

function projectX(lng: number): number {
  return ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VIEW_W
}

function projectY(lat: number): number {
  return ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VIEW_H
}

const OUTLINE_PATH = `${OUTLINE.map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'}${projectX(lng).toFixed(1)} ${projectY(lat).toFixed(1)}`).join(' ')} Z`

export function RouteMap({
  origin,
  destination,
}: {
  origin: PlaceResult | null
  destination: PlaceResult | null
}) {
  const distanceKm = origin && destination ? roadDistanceKm(origin, destination) : null
  const hours = distanceKm ? estimateDriveHours(distanceKm) : null

  const from = origin ? { x: projectX(origin.lng), y: projectY(origin.lat) } : null
  const to = destination ? { x: projectX(destination.lng), y: projectY(destination.lat) } : null

  // Rotayı hafif kavisli çiz
  const curve =
    from && to
      ? `M${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 - Math.abs(to.x - from.x) * 0.18} ${to.x} ${to.y}`
      : null

  return (
    <div className='overflow-hidden rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-bg-soft)]'>
      <div className='relative'>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className='h-full w-full' role='img' aria-label='Güzergâh haritası'>
          <defs>
            <pattern id='map-grid' width='24' height='24' patternUnits='userSpaceOnUse'>
              <path d='M24 0H0V24' fill='none' stroke='rgb(25 45 50 / 0.05)' strokeWidth='1' />
            </pattern>
          </defs>
          <rect width={VIEW_W} height={VIEW_H} fill='url(#map-grid)' />

          <path d={OUTLINE_PATH} fill='#ffffff' stroke='rgb(25 91 85 / 0.3)' strokeWidth='1.5' strokeLinejoin='round' />

          {curve ? (
            <>
              <path d={curve} fill='none' stroke='var(--gl-accent)' strokeWidth='2.5' strokeDasharray='6 5' strokeLinecap='round' />
              <path d={curve} fill='none' stroke='var(--gl-accent)' strokeWidth='7' opacity='0.1' strokeLinecap='round' />
            </>
          ) : null}

          {from ? (
            <g>
              <circle cx={from.x} cy={from.y} r='9' fill='var(--gl-petrol)' opacity='0.15' />
              <circle cx={from.x} cy={from.y} r='5' fill='#ffffff' stroke='var(--gl-petrol)' strokeWidth='3' />
            </g>
          ) : null}

          {to ? (
            <g>
              <circle cx={to.x} cy={to.y} r='9' fill='var(--gl-accent)' opacity='0.15' />
              <path
                d={`M${to.x} ${to.y - 16}c5 0 9 4 9 9 0 6-9 14-9 14s-9-8-9-14c0-5 4-9 9-9z`}
                fill='var(--gl-accent)'
              />
              <circle cx={to.x} cy={to.y - 7} r='3.2' fill='#ffffff' />
            </g>
          ) : null}
        </svg>

        {!origin && !destination ? (
          <p className='absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-[var(--gl-muted)]'>
            Adresleri seçtikçe güzergâh burada görünecek
          </p>
        ) : null}
      </div>

      <div className='flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--gl-border)] bg-white px-4 py-3 text-xs'>
        <span className='inline-flex items-center gap-1.5 text-[var(--gl-muted)]'>
          <Route className='size-3.5 text-[var(--gl-petrol)]' aria-hidden />
          {distanceKm ? (
            <>
              <span className='font-semibold text-[var(--gl-ink)]'>~{distanceKm} km</span> karayolu
            </>
          ) : (
            'Mesafe hesaplanacak'
          )}
        </span>
        <span className='inline-flex items-center gap-1.5 text-[var(--gl-muted)]'>
          <Clock className='size-3.5 text-[var(--gl-petrol)]' aria-hidden />
          {hours ? (
            <>
              <span className='font-semibold text-[var(--gl-ink)]'>~{hours} sa</span> sürüş
            </>
          ) : (
            'Süre hesaplanacak'
          )}
        </span>
      </div>
    </div>
  )
}
