'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  OrchestratorMapPoint,
  OrchestratorMapRoute,
} from './orchestrator-leaflet-map'

const OrchestratorLeafletMap = dynamic(
  () =>
    import('./orchestrator-leaflet-map').then((mod) => mod.OrchestratorLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-full min-h-[280px] items-center justify-center gap-2 bg-slate-50 text-sm text-slate-500'>
        <Loader2 className='size-4 animate-spin' />
        Harita yükleniyor…
      </div>
    ),
  }
)

type Props = {
  points: OrchestratorMapPoint[]
  routes: OrchestratorMapRoute[]
  className?: string
  emphasizeRouteId?: string | null
  onPointClick?: (point: OrchestratorMapPoint) => void
}

export function OrchestratorMapHost({
  points,
  routes,
  className,
  emphasizeRouteId,
  onPointClick,
}: Props) {
  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <OrchestratorLeafletMap
        points={points}
        routes={routes}
        emphasizeRouteId={emphasizeRouteId}
        onPointClick={onPointClick}
        className='absolute inset-0'
      />
    </div>
  )
}
