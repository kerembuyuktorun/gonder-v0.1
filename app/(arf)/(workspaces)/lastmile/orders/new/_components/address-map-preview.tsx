'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OsmMapKind, OsmMapTone } from '../../../_components/lastmile-osm-map'

const LastmilePointMap = dynamic(
  () =>
    import('../../../_components/lastmile-osm-map').then((mod) => mod.LastmilePointMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center gap-2 border-t border-slate-200 bg-slate-50 text-sm text-slate-500 sm:h-56">
        <Loader2 className="size-4 animate-spin" />
        Harita yükleniyor…
      </div>
    ),
  }
)

type Props = {
  latitude: number | null | undefined
  longitude: number | null | undefined
  title?: string
  defaultOpen?: boolean
  /** Tesis = warehouse, home = adres/contact */
  kind?: Extract<OsmMapKind, 'facility' | 'home'>
  tone?: Extract<OsmMapTone, 'sky' | 'emerald'>
}

export function AddressMapPreview({
  latitude,
  longitude,
  title,
  defaultOpen = false,
  kind = 'home',
  tone,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
          aria-expanded={open}
        >
          {open ? (
            <ChevronUp className="size-3.5 shrink-0" />
          ) : (
            <ChevronDown className="size-3.5 shrink-0" />
          )}
          {open ? 'Harita gösterimini gizle' : 'Harita gösterimini aç'}
        </button>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
        >
          Haritada aç
        </a>
      </div>
      <div className={cn(open ? 'block' : 'hidden')}>
        <LastmilePointMap
          latitude={latitude}
          longitude={longitude}
          kind={kind}
          tone={tone}
          title={title?.trim() || undefined}
          active={open}
        />
      </div>
    </div>
  )
}
