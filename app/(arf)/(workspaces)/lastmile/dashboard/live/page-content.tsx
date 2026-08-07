'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Bike,
  ChevronRight,
  Clock3,
  FileWarning,
  Radio,
  Route,
  Wallet,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../../_shared/routes'
import type { LastmileLiveDashboardData, LiveCourierPin, LiveException } from '../../_types/dashboard'
import type { OsmMapPoint } from '../../_components/lastmile-osm-map'

const LastmileOsmMap = dynamic(
  () =>
    import('../../_components/lastmile-osm-map').then((m) => ({
      default: m.LastmileOsmMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-[360px] items-center justify-center bg-muted/30 text-sm text-muted-foreground lg:h-[480px]'>
        Harita yükleniyor…
      </div>
    ),
  }
)

const exceptionIcon = {
  unassigned: Clock3,
  delayed: AlertTriangle,
  doc: FileWarning,
  overdue: Wallet,
} as const

interface Props {
  data: LastmileLiveDashboardData
}

export default function LiveDashboardContent({ data }: Props) {
  const searchParams = useSearchParams()
  const focusCourier = searchParams.get('courier')
  const focusVehicle = searchParams.get('vehicle')

  const initialSelected =
    focusCourier && data.couriers.some((c) => c.id === focusCourier)
      ? focusCourier
      : data.couriers[0]?.id ?? null

  const [selectedId, setSelectedId] = useState<string | null>(initialSelected)

  const selected = useMemo(
    () => data.couriers.find((c) => c.id === selectedId) ?? null,
    [data.couriers, selectedId]
  )

  const mapPoints: OsmMapPoint[] = useMemo(() => {
    return data.couriers.map((c) => ({
      id: c.id === selectedId ? 'courier' : c.id,
      lat: c.lat,
      lng: c.lng,
      kind: 'courier' as const,
      tone: c.status === 'yolda' ? ('sky' as const) : ('muted' as const),
      title: `${c.name} · ${c.status === 'yolda' ? 'Yolda' : 'Boşta'}`,
    }))
  }, [data.couriers, selectedId])

  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Canlı İzleme' }]}
        searchPlaceholder='Kurye veya araç ara...'
        searchShortcut={<>⌘K</>}
        notificationCount={data.exceptions.length}
        notificationsLabel='İstisnalar'
      />

      <div className='flex flex-1 flex-col gap-4 p-4 md:p-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <div className='mb-1 flex items-center gap-2'>
              <span className='relative flex size-2.5'>
                <span className='absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                <span className='relative inline-flex size-2.5 rounded-full bg-emerald-500' />
              </span>
              <h1 className='text-2xl font-semibold tracking-tight'>Canlı İzleme</h1>
            </div>
            <p className='text-sm text-muted-foreground'>
              Saha filosu, aktif rotalar ve istisna kuyruğu
              {focusVehicle ? ` · araç odağı: ${focusVehicle}` : null}
            </p>
          </div>
          <Button variant='outline' size='sm' asChild>
            <Link href={ARF_ROUTES.lastmile.planning.orchestrator} className='gap-1.5'>
              <Route className='size-4' />
              Orkestratör
            </Link>
          </Button>
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {data.kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className='flex items-center justify-between p-4'>
                <div>
                  <p className='text-xs text-muted-foreground'>{kpi.label}</p>
                  <p className='text-2xl font-semibold tracking-tight'>{kpi.value}</p>
                </div>
                {kpi.hint ? (
                  <Badge variant='secondary' className='text-xs font-normal'>
                    {kpi.hint}
                  </Badge>
                ) : (
                  <Radio className='size-4 text-muted-foreground' />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <FleetStrip
          couriers={data.couriers}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='overflow-hidden lg:col-span-2'>
            <CardHeader className='flex flex-row items-center justify-between border-b py-3'>
              <div>
                <CardTitle className='text-base font-medium'>Saha Haritası</CardTitle>
                <CardDescription>
                  {selected
                    ? `${selected.name} seçili · ${selected.activeOrders} aktif sipariş`
                    : `${data.activeRouteCount} aktif rota`}
                </CardDescription>
              </div>
              {selected ? (
                <Button variant='ghost' size='sm' asChild>
                  <Link
                    href={`${ARF_ROUTES.lastmile.resources.couriers.detail(selected.id)}?demo=1`}
                  >
                    Profil
                    <ChevronRight className='size-4' />
                  </Link>
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className='p-0'>
              <LastmileOsmMap
                points={mapPoints}
                polyline={[]}
                className='h-[360px] lg:h-[480px]'
              />
            </CardContent>
          </Card>

          <ExceptionsPanel exceptions={data.exceptions} />
        </div>
      </div>
    </>
  )
}

function FleetStrip({
  couriers,
  selectedId,
  onSelect,
}: {
  couriers: LiveCourierPin[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className='flex gap-2 overflow-x-auto pb-1'>
      {couriers.map((c) => {
        const active = c.id === selectedId
        return (
          <button
            key={c.id}
            type='button'
            onClick={() => onSelect(c.id)}
            className={cn(
              'flex min-w-[160px] shrink-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
              active
                ? 'border-primary/40 bg-primary/5'
                : 'border-border bg-card hover:bg-muted/40'
            )}
          >
            <div
              className={cn(
                'flex size-9 items-center justify-center rounded-md',
                c.status === 'yolda' ? 'bg-sky-500/10 text-sky-600' : 'bg-muted text-muted-foreground'
              )}
            >
              <Bike className='size-4' />
            </div>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium'>{c.name}</p>
              <p className='text-xs text-muted-foreground'>
                {c.status === 'yolda' ? 'Yolda' : 'Boşta'}
                {c.activeOrders > 0 ? ` · ${c.activeOrders} sipariş` : null}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ExceptionsPanel({ exceptions }: { exceptions: LiveException[] }) {
  return (
    <Card className='flex flex-col'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-medium'>İstisna Kuyruğu</CardTitle>
        <CardDescription>Atamasız, geciken ve belge uyarıları</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col gap-2 p-0'>
        {exceptions.map((ex) => {
          const Icon = exceptionIcon[ex.kind]
          const body = (
            <div className='flex items-start gap-3 px-6 py-3 transition-colors hover:bg-muted/50'>
              <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600'>
                <Icon className='size-4' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium'>{ex.title}</p>
                <p className='text-xs text-muted-foreground'>{ex.meta}</p>
              </div>
              {ex.href ? <ChevronRight className='mt-1 size-4 shrink-0 text-muted-foreground' /> : null}
            </div>
          )
          return ex.href ? (
            <Link key={ex.id} href={ex.href} className='block border-t first:border-t-0'>
              {body}
            </Link>
          ) : (
            <div key={ex.id} className='border-t first:border-t-0'>
              {body}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
